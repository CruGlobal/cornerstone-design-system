/**
 * `GridKeyboardController`: the keystroke mechanics for the `cs-data-grid` spike, modelled on
 * `src/internal/segmented-field/segmented-field-controller.ts`. Same split: the controller owns which key does what
 * and the RTL inversion; the host owns the data, rendering, focus and validation and plugs them in through
 * `GridKeyboardConfig`. Like the segmented controller, a host that needs its own keys first (the lookup cell's
 * listbox) handles them and then calls `handleKeyDown`.
 *
 * Two modes:
 *  - navigation: a cell has DOM focus (roving tabindex, never `aria-activedescendant`).
 *  - editing: the cell's own input has DOM focus.
 *
 * The Tab-wraps rule (Tab moves cell to cell and wraps rows, then leaves after the last cell) and the F2 / Escape
 * hand-off between cell and input follow litgrid's behaviour; the cell maths is in `grid-navigation.ts`, which carries
 * the litgrid notice.
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { getArrowTarget, getTabTarget } from './grid-navigation.js';
import type { GridCell, GridShape } from './grid-navigation.js';

export interface GridKeyboardConfig {
  getShape(): GridShape;
  getActive(): GridCell;
  isRtl(): boolean;
  isEditing(): boolean;
  /** Rows per Page Up / Page Down. */
  pageSize(): number;
  /** Make `cell` active and give it DOM focus. */
  moveTo(cell: GridCell): void;
  /** Focus the active cell element synchronously, without changing state. */
  focusActiveCell(): void;
  /** `seed` replaces the value with a typed character; without it the value is kept. Returns false for read-only. */
  startEdit(seed?: string): boolean;
  /** Validate and write the draft. On success focus is back on the cell. Returns false when invalid. */
  commitEdit(): boolean;
  /** Drop the draft, restore the value, focus the cell. */
  cancelEdit(): void;
  /** Delete / Backspace in navigation mode. */
  clearCell(): void;
  /** The documented mid-grid exit key (Alt+End): move focus to whatever follows the grid. */
  leaveGrid(): void;
}

export class GridKeyboardController implements ReactiveController {
  private config: GridKeyboardConfig;

  constructor(host: ReactiveControllerHost & Element, config: GridKeyboardConfig) {
    this.config = config;
    host.addController(this);
  }

  hostConnected() {
    // Nothing. The host binds `handleKeyDown` on its grid element.
  }

  hostDisconnected() {
    // Nothing held.
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) {
      return;
    }
    if (this.config.isEditing()) {
      this.handleEditorKeyDown(event);
    } else {
      this.handleCellKeyDown(event);
    }
  };

  private handleCellKeyDown(event: KeyboardEvent) {
    const config = this.config;
    const active = config.getActive();
    const shape = config.getShape();

    if (event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const target = getTabTarget(active, event.shiftKey ? -1 : 1, shape);
      if (target) {
        event.preventDefault();
        config.moveTo(target);
      }
      // No target: past the last (or before the first) cell. Leave the default so the browser moves focus out.
      return;
    }

    if (event.key === 'End' && event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      config.leaveGrid();
      return;
    }

    if ((event.key === 'Enter' || event.key === 'F2') && !event.altKey && !event.ctrlKey && !event.metaKey) {
      if (config.startEdit()) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      config.clearCell();
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Type to edit: the first character replaces the value, as in a spreadsheet.
      if (config.startEdit(event.key)) {
        event.preventDefault();
      }
      return;
    }

    if (event.altKey || event.metaKey) {
      return;
    }

    const target = getArrowTarget(
      active,
      {
        key: event.key,
        ctrlKey: event.ctrlKey,
        rtl: config.isRtl(),
        pageSize: config.pageSize(),
      },
      shape,
    );
    if (target) {
      event.preventDefault();
      if (target.row !== active.row || target.column !== active.column) {
        config.moveTo(target);
      }
    }
  }

  private handleEditorKeyDown(event: KeyboardEvent) {
    const config = this.config;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        // Keep Escape inside the grid so an enclosing dialog does not close too.
        event.stopPropagation();
        config.cancelEdit();
        return;

      case 'Enter':
        event.preventDefault();
        config.commitEdit();
        return;

      case 'Tab': {
        if (event.ctrlKey || event.altKey || event.metaKey) {
          return;
        }
        if (!config.commitEdit()) {
          // Invalid: keep focus in the input. Escape still cancels, so this is not a trap (Esther F7).
          event.preventDefault();
          return;
        }
        const target = getTabTarget(config.getActive(), event.shiftKey ? -1 : 1, config.getShape());
        if (target) {
          event.preventDefault();
          config.moveTo(target);
        }
        // No target: focus is on the cell now (commitEdit put it there) and the default Tab leaves the grid from it.
        return;
      }

      default:
        // Arrows, Home, End and characters belong to the input while editing.
        return;
    }
  }
}
