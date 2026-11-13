import { html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import CornerstoneElement from '../../src/internal/cornerstone-element.js';
import { customElement } from '../../src/internal/custom-element.js';
import { registerDismissible, unregisterDismissible, isTopDismissible } from '../../src/internal/dismissible-stack.js';
import { announce } from '../../src/internal/live-announcer.js';
import { scrollIntoView } from '../../src/internal/scroll.js';
import sizeStyles from '../../src/styles/component/size.styles.js';
import visuallyHiddenStyles from '../../src/styles/component/visually-hidden.styles.js';
import styles from './data-grid.styles.js';
import { CsCellCommitEvent } from './events/cell-commit.js';
import { CsLayoutChangeEvent } from './events/layout-change.js';
import { CsBatchSubmitEvent } from './events/submit.js';
import { GridKeyboardController } from './grid-keyboard-controller.js';
import {
  filterOptions,
  getRenderedRows,
  getVirtualWindow,
  moveColumn,
  normalizeLayout,
  setPinned,
} from './grid-navigation.js';
import type { DataGridLayout, GridCell, LookupOption, VirtualWindow } from './grid-navigation.js';
import { scrollCellIntoView } from './scroll-cell-into-view.js';

export type { DataGridLayout, LookupOption };

export type DataGridRow = { id: string | number; [key: string]: unknown };

export interface DataGridColumn {
  key: string;
  label: string;
  /** Width in `em`, so it scales with `size`. */
  width?: number;
  type?: 'text' | 'number' | 'lookup' | 'status' | 'line';
  readonly?: boolean;
  required?: boolean;
  /** One column per row may name the row (Esther R5). */
  rowHeader?: boolean;
  align?: 'start' | 'end';
  options?: LookupOption[];
  /** Extra validation; return a message to reject the value. */
  validate?: (value: string, row: DataGridRow) => string | null;
}

export type SaveHandler = (detail: { row: DataGridRow; column: string; value: unknown }) => Promise<void>;

interface EditState {
  row: number;
  column: number;
  initial: string;
}

type RowStatus = { state: 'saving' | 'saved' | 'failed'; message?: string };

/**
 * @summary SPIKE (UIUX-340), not a shipped component. An editable, virtualized data grid for keyboard-first entry.
 * @status experimental
 * @since spike
 *
 * @event cs-cell-commit - A cell's value was written.
 * @event cs-layout-change - Column order or pinning changed.
 * @event cs-batch-submit - `submit()` ran.
 *
 * @csspart base - The wrapper.
 * @csspart scroller - The scrolling `role="grid"` element.
 *
 * @cssproperty --cs-data-grid-row-height - Row height. Default `var(--cs-form-control-height)`.
 * @cssproperty --cs-data-grid-height - Height of the whole grid. Default `24em`.
 * @cssproperty --cs-data-grid-border-color - Cell borders. Default `var(--cs-color-surface-border)`.
 * @cssproperty --cs-data-grid-background - Cell background. Default `var(--cs-color-surface-default)`.
 * @cssproperty --cs-data-grid-header-background - Header background. Default `var(--cs-color-surface-lowered)`.
 */
@customElement('cs-data-grid')
export default class CsDataGrid extends CornerstoneElement {
  static css = [styles, sizeStyles, visuallyHiddenStyles];

  @property({ attribute: false }) columns: DataGridColumn[] = [];
  @property({ attribute: false }) rows: DataGridRow[] = [];
  @property() label = '';
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';
  @property({ type: Number }) overscan = 6;
  /** Spike-only switch: `inset` uses `scroll-cell-into-view.ts`, `cornerstone` the shared `scrollIntoView`. */
  @property({ attribute: 'scroll-strategy' }) scrollStrategy: 'inset' | 'cornerstone' = 'inset';
  @property({ attribute: false }) saveHandler?: SaveHandler;

  @state() private activeRow = 0;
  @state() private activeColumn = 0;
  @state() private editing: EditState | null = null;
  @state() private virtualWindow: VirtualWindow = { start: 0, end: 0 };
  @state() private layoutState: DataGridLayout = normalizeLayout(null, []);
  @state() private lookupOpen = false;
  @state() private lookupIndex = -1;
  @state() private lookupQuery = '';

  @query('.data-grid__scroller') private scroller: HTMLElement;
  @query('.data-grid__head') private head: HTMLElement;
  @query('.data-grid__probe') private probe: HTMLElement;
  @query('.cell__editor') private editor: HTMLInputElement | null;
  @query('.lookup') private lookupList: HTMLElement | null;

  private rowHeight = 36;
  private cellErrors = new Map<string, string>();
  private rowStatus = new Map<string | number, RowStatus>();
  private lastAnnounced = '';
  private resizeObserver?: ResizeObserver;
  private readonly lookupKey = {};

  private keyboard = new GridKeyboardController(this, {
    getShape: () => ({
      rowCount: this.rows.length,
      columnCount: this.visibleColumns.length,
    }),
    getActive: () => ({ row: this.activeRow, column: this.activeColumn }),
    isRtl: () => this.matches(':dir(rtl)'),
    isEditing: () => this.editing !== null,
    pageSize: () => Math.max(1, Math.floor(this.viewportBodyHeight() / this.rowHeight) - 1),
    moveTo: (cell) => this.moveTo(cell),
    focusActiveCell: () =>
      this.cellElement(this.activeRow, this.activeColumn)?.focus({
        preventScroll: true,
      }),
    startEdit: (seed) => this.startEdit(seed),
    commitEdit: () => this.commitEdit(),
    cancelEdit: () => this.cancelEdit(),
    clearCell: () => this.clearCell(),
    leaveGrid: () => this.focusAfterGrid(),
  });

  //
  // Public API
  //

  /** Column order, pinning and widths as JSON. Set it to restore a saved layout; unknown keys are dropped. */
  get layout(): DataGridLayout {
    return structuredClone(this.layoutState);
  }

  set layout(value: Partial<DataGridLayout> | null) {
    this.applyLayout(normalizeLayout(value, this.columns));
  }

  /** Moves a column one step earlier (-1) or later (1) inside its pinned or unpinned block. */
  moveColumn(key: string, delta: -1 | 1) {
    this.applyLayout(moveColumn(this.layoutState, key, delta));
  }

  /** Pins a column to the inline-start edge, or unpins it. */
  pinColumn(key: string, pinned: boolean) {
    this.applyLayout(setPinned(this.layoutState, key, pinned));
  }

  /** The active cell, by row index and column key. */
  get activeCell() {
    return {
      row: this.activeRow,
      column: this.visibleColumns[this.activeColumn]?.key,
    };
  }

  /** Moves the active cell and focus. */
  focusCell(row: number, columnKey: string) {
    const column = this.visibleColumns.findIndex((col) => col.key === columnKey);
    if (column >= 0) {
      this.moveTo({ row, column });
    }
  }

  /**
   * Validates every row that has any data and reports the result. Failure is announced assertively with a count and
   * moves focus to the first problem cell; success is announced politely (Esther E3).
   */
  submit(): boolean {
    if (this.editing && !this.commitEdit()) {
      return false;
    }
    const problems: { row: number; column: number }[] = [];
    let used = 0;
    this.rows.forEach((row, rowIndex) => {
      const hasData = this.visibleColumns.some(
        (column) => !column.readonly && row[column.key] !== '' && row[column.key] != null,
      );
      if (!hasData) {
        return;
      }
      used++;
      this.visibleColumns.forEach((column, columnIndex) => {
        const key = this.errorKey(row, column);
        if (column.required && (row[column.key] === '' || row[column.key] == null)) {
          this.cellErrors.set(key, `${column.label} is required.`);
        }
        if (this.cellErrors.has(key)) {
          problems.push({ row: rowIndex, column: columnIndex });
        }
      });
      if (this.rowStatus.get(row.id)?.state === 'failed' && !problems.some((p) => p.row === rowIndex)) {
        problems.push({ row: rowIndex, column: this.activeColumn });
      }
    });

    const errorRows = new Set(problems.map((problem) => problem.row)).size;
    if (problems.length > 0) {
      const first = problems[0];
      announce(
        `Batch not submitted. ${errorRows} ${errorRows === 1 ? 'row has' : 'rows have'} errors. ` +
          `First: row ${first.row + 1}, ${this.visibleColumns[first.column].label}.`,
        'assertive',
      );
      this.requestUpdate();
      this.moveTo(first);
    } else {
      announce(`Batch submitted. ${used} rows.`, 'polite');
    }
    this.dispatchEvent(
      new CsBatchSubmitEvent({
        ok: problems.length === 0,
        errorCount: errorRows,
        rowCount: used,
      }),
    );
    return problems.length === 0;
  }

  //
  // Lifecycle
  //

  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.measure());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    unregisterDismissible(this.lookupKey);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('columns')) {
      this.layoutState = normalizeLayout(this.layoutState, this.columns);
    }
    if (changed.has('rows') && this.activeRow >= this.rows.length) {
      this.activeRow = Math.max(0, this.rows.length - 1);
    }
  }

  protected firstUpdated() {
    this.resizeObserver?.observe(this.scroller);
    this.measure();
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('rows')) {
      this.updateWindow();
    }
    this.syncLookupPopover();
  }

  //
  // Derived values
  //

  private get visibleColumns(): DataGridColumn[] {
    const byKey = new Map(this.columns.map((column) => [column.key, column]));
    return this.layoutState.order.map((key) => byKey.get(key)).filter((column): column is DataGridColumn => !!column);
  }

  private errorKey(row: DataGridRow, column: DataGridColumn) {
    return `${row.id}:${column.key}`;
  }

  private viewportBodyHeight() {
    return Math.max(0, (this.scroller?.clientHeight ?? 0) - (this.head?.offsetHeight ?? 0));
  }

  private pinnedWidth() {
    let width = 0;
    this.head?.querySelectorAll<HTMLElement>('.cell--pinned').forEach((cell) => (width += cell.offsetWidth));
    return width;
  }

  private cellElement(row: number, column: number) {
    return this.shadowRoot?.querySelector<HTMLElement>(`.cell[data-row="${row}"][data-col="${column}"]`) ?? null;
  }

  private formatValue(column: DataGridColumn, row: DataGridRow, rowIndex: number): string {
    if (column.type === 'line') {
      return String(rowIndex + 1);
    }
    const value = row[column.key];
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (column.type === 'number' && typeof value === 'number') {
      return value.toFixed(2);
    }
    if (column.type === 'lookup') {
      const option = column.options?.find((candidate) => candidate.value === value);
      return option ? `${option.value} ${option.label}` : String(value);
    }
    return String(value);
  }

  //
  // Measuring and virtualization
  //

  private measure() {
    if (!this.scroller) {
      return;
    }
    this.rowHeight = this.probe?.offsetHeight || 36;
    this.updateWindow();
    this.requestUpdate();
  }

  private updateWindow() {
    if (!this.scroller) {
      return;
    }
    const next = getVirtualWindow({
      scrollTop: Math.max(0, this.scroller.scrollTop),
      viewportHeight: this.viewportBodyHeight() || 400,
      rowHeight: this.rowHeight,
      rowCount: this.rows.length,
      overscan: this.overscan,
    });
    if (next.start !== this.virtualWindow.start || next.end !== this.virtualWindow.end) {
      this.virtualWindow = next;
    }
  }

  private handleScroll = () => {
    this.updateWindow();
    if (this.lookupOpen) {
      this.positionLookup();
    }
  };

  //
  // Focus and movement
  //

  private moveTo(cell: GridCell) {
    this.activeRow = cell.row;
    this.activeColumn = cell.column;
    const element = this.cellElement(cell.row, cell.column);
    if (element) {
      element.focus({ preventScroll: true });
      this.scrollActiveIntoView(element);
      return;
    }
    // The target row was not drawn (Page Down, Ctrl+End). The active row always is, so it exists after this update.
    this.updateComplete.then(() => {
      const drawn = this.cellElement(cell.row, cell.column);
      drawn?.focus({ preventScroll: true });
      if (drawn) {
        this.scrollActiveIntoView(drawn);
      }
    });
  }

  private scrollActiveIntoView(element: HTMLElement) {
    if (this.scrollStrategy === 'cornerstone') {
      scrollIntoView(element, this.scroller, 'both', 'auto');
      return;
    }
    const pinned = element.classList.contains('cell--pinned');
    scrollCellIntoView(
      element,
      this.scroller,
      {
        blockStart: this.head.offsetHeight,
        inlineStart: pinned ? 0 : this.pinnedWidth(),
        verticalOnly: pinned,
      },
      'auto',
    );
  }

  /** The skip link and Alt+End: focus the first tabbable element after the grid in document order. */
  private focusAfterGrid() {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const candidates = [...document.querySelectorAll<HTMLElement>(selector)];
    const next = candidates.find(
      (element) =>
        this.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING &&
        !this.contains(element) &&
        element.getClientRects().length > 0,
    );
    next?.focus();
  }

  private handleSkipClick = (event: MouseEvent) => {
    event.preventDefault();
    this.focusAfterGrid();
  };

  private handleFocusIn = (event: FocusEvent) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('.cell[data-row]');
    if (!cell || cell.classList.contains('cell--header')) {
      return;
    }
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.col);
    if (row !== this.activeRow || column !== this.activeColumn) {
      this.activeRow = row;
      this.activeColumn = column;
    }
  };

  private handleFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (this.editing && next && !this.shadowRoot?.contains(next)) {
      // Focus left the grid (a click elsewhere). Commit without pulling focus back; an invalid draft stays open.
      this.commitEdit(false);
    }
  };

  private handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('.cell__editor, .lookup')) {
      return;
    }
    const cell = target.closest<HTMLElement>('.cell[data-row]');
    if (!cell) {
      return;
    }
    if (this.editing && !this.commitEdit()) {
      event.preventDefault();
    }
  };

  private handleDoubleClick = (event: MouseEvent) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('.cell[data-row]');
    if (cell && !this.editing) {
      this.startEdit();
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.editing && this.visibleColumns[this.editing.column]?.type === 'lookup') {
      this.handleLookupKeyDown(event);
    }
    this.keyboard.handleKeyDown(event);
  };

  //
  // Editing
  //

  private startEdit(seed?: string): boolean {
    const column = this.visibleColumns[this.activeColumn];
    const row = this.rows[this.activeRow];
    if (!column || !row || column.readonly || column.type === 'status' || column.type === 'line') {
      return false;
    }
    const current = row[column.key];
    const initial =
      seed ?? (column.type === 'number' && typeof current === 'number' ? current.toFixed(2) : String(current ?? ''));
    this.editing = { row: this.activeRow, column: this.activeColumn, initial };
    if (column.type === 'lookup') {
      this.lookupQuery = seed ?? '';
      this.setLookupOpen(seed !== undefined);
      this.lookupIndex = this.matchIndex(column, seed ?? initial);
    }
    this.updateComplete.then(() => {
      const editor = this.editor;
      if (!editor) {
        return;
      }
      editor.focus({ preventScroll: true });
      editor.setSelectionRange(editor.value.length, editor.value.length);
    });
    return true;
  }

  private filteredOptions(column: DataGridColumn) {
    return filterOptions(column.options ?? [], this.lookupQuery);
  }

  private matchIndex(column: DataGridColumn, text: string) {
    const options = this.filteredOptions(column);
    const exact = options.findIndex((option) => option.value.toLowerCase() === text.trim().toLowerCase());
    if (exact >= 0) {
      return exact;
    }
    return this.lookupQuery && options.length > 0 ? 0 : -1;
  }

  /** Turns the editor text into a stored value, or an error message. */
  private resolveValue(column: DataGridColumn, row: DataGridRow, raw: string): { value: unknown } | { error: string } {
    const text = raw.trim();
    if (text === '') {
      return column.required ? { error: `${column.label} is required.` } : { value: '' };
    }
    let value: unknown = text;
    if (column.type === 'number') {
      if (!/^\d+(\.\d{1,2})?$/.test(text) || Number(text) <= 0) {
        return {
          error: 'Enter an amount greater than 0, with up to 2 decimals.',
        };
      }
      value = Number(text);
    }
    if (column.type === 'lookup') {
      const options = this.filteredOptions(column);
      const highlighted = this.lookupOpen && this.lookupIndex >= 0 ? options[this.lookupIndex] : undefined;
      const exact = column.options?.find(
        (option) =>
          option.value.toLowerCase() === text.toLowerCase() || option.label.toLowerCase() === text.toLowerCase(),
      );
      const picked = exact ?? highlighted;
      if (!picked) {
        return { error: `Pick a ${column.label.toLowerCase()} from the list.` };
      }
      value = picked.value;
    }
    const custom = column.validate?.(text, row);
    return custom ? { error: custom } : { value };
  }

  /** Validates and writes. On success focus returns to the cell (Esther F6); on failure it stays in the input. */
  private commitEdit(refocus = true): boolean {
    const edit = this.editing;
    if (!edit) {
      return true;
    }
    const column = this.visibleColumns[edit.column];
    const row = this.rows[edit.row];
    const raw = this.editor?.value ?? edit.initial;
    const result = this.resolveValue(column, row, raw);
    const key = this.errorKey(row, column);

    if ('error' in result) {
      this.cellErrors.set(key, result.error);
      this.requestUpdate();
      // Announce once per distinct attempt, so pressing Tab again on the same bad value does not repeat it.
      const said = `${key}:${raw}`;
      if (said !== this.lastAnnounced) {
        this.lastAnnounced = said;
        announce(`Row ${edit.row + 1}, ${column.label}: ${result.error}`, 'assertive');
      }
      return false;
    }

    this.cellErrors.delete(key);
    this.lastAnnounced = '';
    const oldValue = row[column.key];
    if (oldValue !== result.value) {
      row[column.key] = result.value;
      this.dispatchEvent(
        new CsCellCommitEvent({
          row: edit.row,
          rowId: row.id,
          column: column.key,
          value: result.value,
          oldValue,
        }),
      );
      void this.save(row, column, result.value);
    }
    this.endEdit(refocus);
    return true;
  }

  private cancelEdit() {
    const edit = this.editing;
    if (!edit) {
      return;
    }
    this.cellErrors.delete(this.errorKey(this.rows[edit.row], this.visibleColumns[edit.column]));
    this.lastAnnounced = '';
    this.endEdit(true);
  }

  private endEdit(refocus: boolean) {
    if (refocus) {
      // Focus the cell before the input is removed, so focus never falls to <body>.
      this.cellElement(this.editing!.row, this.editing!.column)?.focus({
        preventScroll: true,
      });
    }
    this.setLookupOpen(false);
    this.editing = null;
  }

  private clearCell() {
    const column = this.visibleColumns[this.activeColumn];
    const row = this.rows[this.activeRow];
    if (!column || !row || column.readonly || column.type === 'status' || column.type === 'line') {
      return;
    }
    this.editing = {
      row: this.activeRow,
      column: this.activeColumn,
      initial: '',
    };
    // No editor is drawn yet, so commit reads `initial`.
    if (!this.commitEdit()) {
      this.editing = null;
    }
  }

  private async save(row: DataGridRow, column: DataGridColumn, value: unknown) {
    if (!this.saveHandler) {
      return;
    }
    this.rowStatus.set(row.id, { state: 'saving' });
    this.requestUpdate();
    try {
      await this.saveHandler({ row, column: column.key, value });
      this.rowStatus.set(row.id, { state: 'saved' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The server did not accept the change.';
      this.rowStatus.set(row.id, { state: 'failed', message });
      const index = this.rows.indexOf(row);
      announce(`Row ${index + 1} not saved: ${message}`, 'assertive');
    }
    this.requestUpdate();
  }

  //
  // Lookup cells
  //

  private setLookupOpen(open: boolean) {
    if (open === this.lookupOpen) {
      return;
    }
    this.lookupOpen = open;
    if (open) {
      registerDismissible(this.lookupKey);
    } else {
      unregisterDismissible(this.lookupKey);
    }
  }

  private handleLookupKeyDown(event: KeyboardEvent) {
    const column = this.visibleColumns[this.editing!.column];
    const count = this.filteredOptions(column).length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.lookupOpen) {
          this.setLookupOpen(true);
        } else {
          this.lookupIndex = Math.min(this.lookupIndex + 1, count - 1);
        }
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.lookupIndex = Math.max(this.lookupIndex - 1, count > 0 ? 0 : -1);
        return;
      case 'Escape':
        // First Escape closes the list and keeps the text; the second cancels the edit (Esther L3).
        if (this.lookupOpen && isTopDismissible(this.lookupKey)) {
          event.preventDefault();
          event.stopPropagation();
          this.setLookupOpen(false);
        }
        return;
      default:
        return;
    }
  }

  private handleEditorInput = (event: InputEvent) => {
    const column = this.visibleColumns[this.editing!.column];
    if (column.type !== 'lookup') {
      return;
    }
    this.lookupQuery = (event.target as HTMLInputElement).value;
    this.setLookupOpen(true);
    this.lookupIndex = this.matchIndex(column, this.lookupQuery);
  };

  private handleOptionMouseDown(event: MouseEvent, option: LookupOption) {
    event.preventDefault();
    if (this.editor) {
      this.editor.value = option.value;
    }
    this.lookupQuery = option.value;
    this.lookupIndex = 0;
    this.commitEdit();
  }

  private syncLookupPopover() {
    const list = this.lookupList;
    if (!list) {
      return;
    }
    if (this.lookupOpen && !list.matches(':popover-open')) {
      list.showPopover();
    }
    if (!this.lookupOpen && list.matches(':popover-open')) {
      list.hidePopover();
    }
    if (this.lookupOpen) {
      this.positionLookup();
    }
  }

  private positionLookup() {
    const list = this.lookupList;
    const editor = this.editor;
    if (!list || !editor) {
      return;
    }
    const box = editor.getBoundingClientRect();
    list.style.top = `${box.bottom}px`;
    list.style.minWidth = `${Math.max(box.width, 240)}px`;
    if (this.matches(':dir(rtl)')) {
      list.style.left = 'auto';
      list.style.right = `${document.documentElement.clientWidth - box.right}px`;
    } else {
      list.style.right = 'auto';
      list.style.left = `${box.left}px`;
    }
  }

  private applyLayout(next: DataGridLayout) {
    if (next === this.layoutState) {
      return;
    }
    const activeKey = this.visibleColumns[this.activeColumn]?.key;
    this.layoutState = next;
    const column = next.order.indexOf(activeKey);
    if (column >= 0) {
      this.activeColumn = column;
    }
    this.dispatchEvent(new CsLayoutChangeEvent({ layout: this.layout }));
  }

  //
  // Rendering
  //

  private renderEditor(column: DataGridColumn, rowIndex: number, errorId: string | null) {
    const labelledBy = `col-${column.key} rowhead-${rowIndex}`;
    const describedBy = ['edit-hint', errorId].filter(Boolean).join(' ');
    if (column.type !== 'lookup') {
      return html`<input
        class="cell__editor"
        tabindex="-1"
        autocomplete="off"
        inputmode=${column.type === 'number' ? 'decimal' : nothing}
        aria-labelledby=${labelledBy}
        aria-describedby=${describedBy}
        aria-invalid=${errorId ? 'true' : nothing}
        aria-required=${column.required ? 'true' : nothing}
        .value=${this.editing!.initial}
      />`;
    }
    const options = this.filteredOptions(column);
    return html`<input
        class="cell__editor"
        tabindex="-1"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded=${this.lookupOpen ? 'true' : 'false'}
        aria-controls="lookup-list"
        aria-activedescendant=${
          this.lookupOpen && this.lookupIndex >= 0 ? `lookup-option-${this.lookupIndex}` : nothing
        }
        aria-labelledby=${labelledBy}
        aria-describedby=${describedBy}
        aria-invalid=${errorId ? 'true' : nothing}
        aria-required=${column.required ? 'true' : nothing}
        .value=${this.editing!.initial}
        @input=${this.handleEditorInput}
      />
      <div id="lookup-list" class="lookup" role="listbox" popover="manual" aria-label=${column.label}>
        ${
          options.length === 0
            ? html`<div class="lookup__empty">No matches</div>`
            : options.map(
                (option, index) =>
                  html`<div
                    id="lookup-option-${index}"
                    class="lookup__option"
                    role="option"
                    aria-selected=${index === this.lookupIndex ? 'true' : 'false'}
                    @mousedown=${(event: MouseEvent) => this.handleOptionMouseDown(event, option)}
                  >
                    <span class="lookup__marker" aria-hidden="true">${index === this.lookupIndex ? '>' : ''}</span>
                    <strong>${option.value}</strong><span>${option.label}</span>
                  </div>`,
              )
        }
      </div>`;
  }

  private renderStatus(row: DataGridRow): TemplateResult | typeof nothing {
    const hasError = this.visibleColumns.some((column) => this.cellErrors.has(this.errorKey(row, column)));
    const status = this.rowStatus.get(row.id);
    if (hasError) {
      return html`<span class="status--error"><span aria-hidden="true">! </span>Error</span>`;
    }
    if (status?.state === 'failed') {
      return html`<span class="status--failed" title=${status.message ?? ''}
        ><span aria-hidden="true">! </span>Not saved</span
      >`;
    }
    if (status?.state === 'saving') {
      return html`<span><span aria-hidden="true">... </span>Saving</span>`;
    }
    if (status?.state === 'saved') {
      return html`<span><span aria-hidden="true">✓ </span>Saved</span>`;
    }
    return nothing;
  }

  private renderCell(row: DataGridRow, rowIndex: number, column: DataGridColumn, columnIndex: number, offset: number) {
    const isActive = rowIndex === this.activeRow && columnIndex === this.activeColumn;
    const isEditing = !!this.editing && this.editing.row === rowIndex && this.editing.column === columnIndex;
    const pinned = this.layoutState.pinned.includes(column.key);
    const lastPinned = pinned && this.layoutState.pinned[this.layoutState.pinned.length - 1] === column.key;
    const error = this.cellErrors.get(this.errorKey(row, column)) ?? null;
    const errorId = error ? `err-${rowIndex}-${columnIndex}` : null;
    const readonly = column.readonly || column.type === 'status' || column.type === 'line';

    return html`<div
      class=${classMap({
        cell: true,
        'cell--active': isActive,
        'cell--editing': isEditing,
        'cell--pinned': pinned,
        'cell--pinned-last': lastPinned,
        'cell--readonly': !!readonly,
        'cell--invalid': !!error,
        'cell--end': column.align === 'end' || column.type === 'number',
      })}
      style=${pinned ? styleMap({ insetInlineStart: `${offset}em` }) : nothing}
      role=${column.rowHeader ? 'rowheader' : 'gridcell'}
      id=${column.rowHeader ? `rowhead-${rowIndex}` : nothing}
      data-row=${rowIndex}
      data-col=${columnIndex}
      tabindex=${isActive && !isEditing ? '0' : '-1'}
      aria-readonly=${readonly ? 'true' : nothing}
      aria-required=${column.required ? 'true' : nothing}
      aria-invalid=${error ? 'true' : nothing}
      aria-describedby=${errorId ?? nothing}
    >
      ${
        isEditing
          ? this.renderEditor(column, rowIndex, errorId)
          : column.type === 'status'
            ? this.renderStatus(row)
            : html`${error ? html`<span class="cell__icon" aria-hidden="true">!</span>` : nothing}<span
                  class="cell__value"
                  >${this.formatValue(column, row, rowIndex)}</span
                >`
      }
      ${error ? html`<span id=${errorId!} hidden>${error}</span>` : nothing}
      ${error && isActive ? html`<span class="cell__message" aria-hidden="true">! ${error}</span>` : nothing}
    </div>`;
  }

  private renderRow(rowIndex: number, columns: DataGridColumn[], offsets: number[]) {
    const row = this.rows[rowIndex];
    return html`<div
      class=${classMap({
        'data-grid__row': true,
        'data-grid__row--active': rowIndex === this.activeRow,
      })}
      role="row"
      aria-rowindex=${rowIndex + 2}
      data-row-id=${String(row.id)}
      style="transform: translateY(${rowIndex * this.rowHeight}px)"
    >
      ${columns.map((column, columnIndex) => this.renderCell(row, rowIndex, column, columnIndex, offsets[columnIndex]))}
    </div>`;
  }

  render() {
    const columns = this.visibleColumns;
    const widths = columns.map((column) => this.layoutState.widths[column.key] ?? 8);
    const offsets: number[] = [];
    let running = 0;
    for (const width of widths) {
      offsets.push(running);
      running += width;
    }
    const rendered = getRenderedRows(this.virtualWindow, this.activeRow, this.rows.length);

    return html`<div class="data-grid" part="base">
      <a class="data-grid__skip cs-visually-hidden" href="#" @click=${this.handleSkipClick}>Skip past grid</a>
      <div class="data-grid__label" id="label">${this.label}</div>
      <div class="data-grid__hint" id="hint">
        Tab and arrow keys move. Type, Enter or F2 to edit. Escape cancels. Alt+End leaves the grid.
      </div>
      <div
        class="data-grid__scroller"
        part="scroller"
        role="grid"
        aria-labelledby="label"
        aria-describedby="hint"
        aria-rowcount=${this.rows.length + 1}
        style=${styleMap({
          '--_columns': widths.map((width) => `${width}em`).join(' '),
        })}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}
        @dblclick=${this.handleDoubleClick}
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
        @scroll=${this.handleScroll}
      >
        <div class="data-grid__head" role="rowgroup">
          <div class="data-grid__row" role="row" aria-rowindex="1">
            ${columns.map((column, index) => {
              const pinned = this.layoutState.pinned.includes(column.key);
              const lastPinned = pinned && this.layoutState.pinned[this.layoutState.pinned.length - 1] === column.key;
              return html`<div
                class=${classMap({
                  cell: true,
                  'cell--header': true,
                  'cell--pinned': pinned,
                  'cell--pinned-last': lastPinned,
                  'cell--end': column.align === 'end' || column.type === 'number',
                })}
                style=${pinned ? styleMap({ insetInlineStart: `${offsets[index]}em` }) : nothing}
                role="columnheader"
                id="col-${column.key}"
              >
                <span class="cell__value">${column.label}</span>
              </div>`;
            })}
          </div>
        </div>
        <div
          class="data-grid__body"
          role="rowgroup"
          style="height: ${this.rows.length * this.rowHeight}px; width: ${running}em"
        >
          ${repeat(
            rendered,
            (rowIndex) => this.rows[rowIndex].id,
            (rowIndex) => this.renderRow(rowIndex, columns, offsets),
          )}
        </div>
      </div>
      <div class="data-grid__probe" aria-hidden="true"></div>
      <div id="edit-hint" hidden>Editing. Enter saves, Escape cancels.</div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-data-grid': CsDataGrid;
  }
}
