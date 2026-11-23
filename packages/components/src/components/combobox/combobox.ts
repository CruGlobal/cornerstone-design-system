import type { PropertyValues, TemplateResult } from 'lit';
import { html, isServer, render } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { isTemplateResult } from 'lit/directive-helpers.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { CsAfterHideEvent } from '../../events/after-hide.js';
import { CsAfterShowEvent } from '../../events/after-show.js';
import { CsClearEvent } from '../../events/clear.js';
import { CsCreateEvent } from '../../events/create.js';
import { CsHideEvent } from '../../events/hide.js';
import { CsOptionsErrorEvent } from '../../events/options-error.js';
import { CsOptionsRequestEvent } from '../../events/options-request.js';
import type { CsRemoveEvent } from '../../events/remove.js';
import { CsShowEvent } from '../../events/show.js';
import { animateWithClass } from '../../internal/animate.js';
import { copyStartContent } from '../../internal/copy-start-content.js';
import { CornerstoneFormAssociatedElement } from '../../internal/cornerstone-form-associated-element.js';
import { customElement } from '../../internal/custom-element.js';
import { isTopDismissible, registerDismissible, unregisterDismissible } from '../../internal/dismissible-stack.js';
import { waitForEvent } from '../../internal/event.js';
import { announce } from '../../internal/live-announcer.js';
import { scrollIntoView } from '../../internal/scroll.js';
import { HasSlotController } from '../../internal/slot.js';
import { submitOnEnter } from '../../internal/submit-on-enter.js';
import { RequiredValidator } from '../../internal/validators/required-validator.js';
import { watch } from '../../internal/watch.js';
import formControlStyles from '../../styles/component/form-control.styles.js';
import sizeStyles from '../../styles/component/size.styles.js';
import { LocalizeController } from '../../utilities/localize.js';
import '../icon/icon.js';
import '../option/option.js';
import type CsOption from '../option/option.js';
import '../popup/popup.js';
import type CsPopup from '../popup/popup.js';
import '../spinner/spinner.js';
import '../tag/tag.js';
import styles from './combobox.styles.js';

/** One option a `dataSource` returns as data. The combobox builds a `<cs-option>` from it and sets its text. */
export interface ComboboxOptionData {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * What a `dataSource` may return: option data, real DOM nodes such as `<cs-option>` and `<cs-divider>`, or a Lit
 * template. Never an HTML string; the combobox does not parse markup.
 */
export type ComboboxDataSourceResult = TemplateResult | Node | ReadonlyArray<ComboboxOptionData | Node>;

/** Loads the options for `query`. Stop work when `signal` aborts: a newer request has replaced this one. */
export type ComboboxDataSource = (
  query: string,
  signal: AbortSignal,
) => ComboboxDataSourceResult | Promise<ComboboxDataSourceResult>;

/** Decides whether `option` matches what the user typed. */
export type ComboboxFilter = (option: CsOption, query: string) => boolean;

type StatusRow = 'empty' | 'no-results' | 'loading' | 'error';

/** The default filter: the option's label contains the query, ignoring case. */
const defaultFilter: ComboboxFilter = (option, query) => option.label.toLowerCase().includes(query.toLowerCase());

/** How long the list has to sit still before its result count is announced, so fast typing reads once. */
const ANNOUNCE_DELAY = 300;

function sameValues(a: readonly string[] | null, b: readonly string[] | null) {
  if (a === b) {
    return true;
  }
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}

function toValues(value: string | readonly string[] | null | undefined): string[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value.map(String) : [String(value)];
}

/**
 * @summary Comboboxes pair a text field with a list of options, so people can type to narrow a long list and then pick
 *  one or more values.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/combobox
 * @status experimental
 * @since 0.12
 *
 * @dependency cs-icon
 * @dependency cs-option
 * @dependency cs-popup
 * @dependency cs-spinner
 * @dependency cs-tag
 *
 * @slot - The listbox options. Must be `<cs-option>` elements. You can use `<cs-divider>` to group items visually.
 * @slot label - The combobox's label. Alternatively, you can use the `label` attribute.
 * @slot hint - Text that describes how to use the combobox. Alternatively, you can use the `hint` attribute.
 * @slot start - An element, such as `<cs-icon>`, placed at the start of the combobox.
 * @slot end - An element, such as `<cs-icon>`, placed at the end of the combobox.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot expand-icon - The icon to show when the control is expanded and collapsed. Rotates on open and close.
 * @slot empty - Shown when there are no options and nothing has been typed. Defaults to "No options".
 * @slot no-results - Shown when nothing matches what was typed. Defaults to "No matching results".
 * @slot loading - Shown in server mode while options load and none are showing yet. Defaults to "Loading".
 * @slot error - Shown in server mode when the last `dataSource` request failed. Defaults to "Couldn't load options".
 *
 * @event change - Emitted when the control's value changes. Not emitted for each keystroke.
 * @event input - Emitted when the control's value changes. Not emitted for each keystroke.
 * @event focus - Emitted when the control gains focus.
 * @event blur - Emitted when the control loses focus.
 * @event cs-clear - Emitted when the clear button clears the control.
 * @event cs-show - Emitted when the listbox opens.
 * @event cs-after-show - Emitted after the listbox opens and all animations are complete.
 * @event cs-hide - Emitted when the listbox closes.
 * @event cs-after-hide - Emitted after the listbox closes and all animations are complete.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 * @event {{ inputValue: string }} cs-create - Emitted when the user picks the create option. Cancelable: call
 *  `preventDefault()` to create the option yourself.
 * @event {{ query: string, signal: AbortSignal }} cs-options-request - Emitted in server mode when the combobox needs
 *  options for `query`.
 * @event {{ error: unknown, request: { query: string } }} cs-options-error - Emitted when a `dataSource` request fails.
 *  Not emitted for a request that was aborted, or that newer typing has superseded.
 *
 * @csspart form-control - The form control that wraps the label, input, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The combobox's wrapper.
 * @csspart hint - The hint's wrapper.
 * @csspart combobox - The container that wraps the start, end, tags, text input, clear button, and expand icon.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart display-input - The text input people type into, an `<input>` element.
 * @csspart listbox - The listbox container where options are slotted.
 * @csspart status - The status row shown in place of options. Each also carries its own part, below.
 * @csspart empty - The status row shown when there are no options and nothing has been typed.
 * @csspart no-results - The status row shown when nothing matches what was typed.
 * @csspart loading - The status row shown while options load and none are showing yet.
 * @csspart error - The status row shown after a failed `dataSource` request.
 * @csspart spinner - The loading spinner in the field, a `<cs-spinner>` element.
 * @csspart tags - The container that houses option tags when `multiple` is used.
 * @csspart tag - The individual tags that represent each picked option.
 * @csspart tag__content - The tag's content part.
 * @csspart tag__remove-button - The tag's remove button.
 * @csspart tag__remove-button__button - The tag's remove button's exported `button` part.
 * @csspart clear-button - The clear button.
 * @csspart expand-icon - The container that wraps the expand icon.
 *
 * @cssproperty [--cs-show-duration=var(--cs-transition-fast)] - The duration of the show animation. Read by the
 *  combobox's popup, which inherits it.
 * @cssproperty [--cs-hide-duration=var(--cs-transition-fast)] - The duration of the hide animation.
 * @cssproperty [--cs-combobox-tag-max-size=10ch] - When using `multiple`, the max size of tags before their content is
 *  truncated.
 *
 * @cssstate blank - The combobox has no value and its text field is empty.
 * @cssstate loading - An options request is pending.
 * @cssstate showing-loading-row - The open listbox shows its loading row, so the spinner in the field is hidden.
 */
@customElement('cs-combobox')
export default class CsCombobox extends CornerstoneFormAssociatedElement {
  static css = [styles, formControlStyles, sizeStyles];

  static get validators() {
    return [
      ...super.validators,
      RequiredValidator({
        validationElement: () => Object.assign(document.createElement('select'), { required: true }),
        validationProperty: 'hasValue',
      }),
    ];
  }

  assumeInteractionOn = ['blur', 'input'];

  private readonly hasSlotController = new HasSlotController(this, 'hint', 'label');
  private readonly localize = new LocalizeController(this);
  private cachedOptions: CsOption[] | null = null;
  private slotChangePending = false;
  private _value: string[] | null = null;
  private _defaultValue: string[] | null = null;
  /** The option element last seen for each picked value, so a pick keeps its label after server results replace it. */
  private pickedOptions = new Map<string, CsOption>();
  /** True from the first keystroke until the typed text is picked, committed, restored or cleared. */
  private isEditing = false;
  /** True once the user moves the highlight with a key, so Tab picks it even with nothing typed. */
  private hasNavigated = false;
  /**
   * What the open list is showing, which decides the highlight when its options change (see placeHighlight). While it
   * shows what opening it showed: 'first' or 'last' when an arrow key opened it, else 'none'. Once it answers the text
   * in the field, typed or emptied: 'query'.
   */
  private highlightBasis: 'first' | 'last' | 'none' | 'query' = 'none';
  /** The root the open list listens to for focus, saved because `getRootNode()` changes once the element is removed. */
  private listenerRoot: Node | null = null;
  /** Nodes the combobox appended from a `dataSource` answer. Only these, and options, go when the next answer lands. */
  private serverNodes = new Set<Node>();
  /** True while waiting once for options that have not upgraded yet. */
  private waitingForOptions = false;
  /** Set by a press that focuses the field, so the release that follows does not undo the selected label. */
  private keepSelectionOnMouseUp = false;
  /** Options and decorations this component hid while filtering. Only these are shown again. */
  private filteredOut = new Set<Element>();
  private requestController: AbortController | null = null;
  /** True while a dataSource call is awaited. */
  private awaitingAnswer = false;
  private requestTimeout: number | undefined;
  private announceTimeout: number | undefined;
  private lastAnnouncement = '';

  @query('.combobox-popup') popup: CsPopup;
  @query('.combobox') combobox: HTMLElement;
  @query('.display-input') displayInput: HTMLInputElement;
  @query('.listbox') listbox: HTMLElement;
  @query('.create-option') private createOptionElement: CsOption | null;

  /** What the user has typed since the list opened. It filters the list; empty shows everything. */
  @state() private query = '';
  /** How many of the light DOM options are showing. */
  @state() private visibleCount = 0;
  /** True when the create option is the highlighted one. */
  @state() private createIsCurrent = false;
  /** True after a `dataSource` request fails, until the next request starts. */
  @state() private loadFailed = false;

  /** The option the user is on, which Enter picks. `undefined` when no option is highlighted. Read-only. */
  @state() currentOption: CsOption | undefined;

  /** The name of the combobox, submitted as a name/value pair with form data. */
  @property({ reflect: true }) name = '';

  /**
   * The combobox's value: a string, or an array of strings when `multiple` is set. Only a picked option's value is ever
   * submitted. The text someone types is not, unless `allow-custom-value` is set.
   */
  @property({ attribute: 'value', reflect: false })
  set value(val: string | string[] | null) {
    const oldValue = this.value;
    const source = (val as unknown) instanceof FormData ? (val as unknown as FormData).getAll(this.name) : val;
    const next = toValues(source as string | string[] | null);

    if (sameValues(this._value, next)) {
      return;
    }

    this._value = next;
    this.valueHasChanged = true;

    // A value set from outside replaces whatever is half-typed in the field. In multiple mode the field only ever
    // holds a query, so it empties; in single mode it shows the new pick's label.
    this.isEditing = false;
    this.hasNavigated = false;
    this.query = '';
    if (this.multiple) {
      this.inputValue = '';
    }
    this.requestUpdate('value', oldValue);

    // Set during an update (from a cs-show listener, say), the requested update joins the one running after willUpdate()
    // has written the form value, so write it here too. Before the first update, willUpdate() still does it.
    if (this.hasUpdated && !isServer) {
      this.syncValueState();
    }
  }

  get value(): string | string[] | null {
    const values = this.selectedValues;
    return this.multiple ? values : (values[0] ?? null);
  }

  /** The value the combobox returns to when its form is reset. Read from the `value` attribute or `selected` options. */
  @property({ attribute: false })
  set defaultValue(val: string | string[] | null) {
    this._defaultValue = val == null ? null : toValues(val);
  }

  get defaultValue(): string | string[] | null {
    const values = this._defaultValue ?? [];
    return this.multiple ? [...values] : (values[0] ?? null);
  }

  /** The text in the field. In single mode it shows the picked option's label until the user types. */
  @property({ attribute: false }) inputValue = '';

  /** The combobox's size. */
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';

  /** Placeholder text to show as a hint when the combobox is empty. */
  @property() placeholder = '';

  /** Allows more than one option to be picked. Picks show as tags and the field is used only to filter. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /**
   * The maximum number of picked options to show as tags when `multiple` is true. After the maximum, "+n" is shown to
   * indicate the number of additional picks. Set to 0 to remove the limit.
   */
  @property({ attribute: 'max-options-visible', type: Number }) maxOptionsVisible = 3;

  /** Disables the combobox. */
  @property({ type: Boolean }) disabled = false;

  /** Adds a clear button when the combobox has a value or text. */
  @property({ attribute: 'with-clear', type: Boolean }) withClear = false;

  /**
   * Indicates whether or not the listbox is open. You can toggle this attribute to show and hide the listbox, or you can
   * use the `show()` and `hide()` methods and this attribute will reflect the combobox's open state.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /** The combobox's visual appearance. */
  @property({ reflect: true }) appearance: 'filled' | 'outlined' | 'filled-outlined' = 'outlined';

  /** Draws a pill-style combobox with rounded edges. */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** The combobox's label. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /**
   * The preferred placement of the listbox. Note that the actual placement may vary as needed to keep the listbox
   * inside of the viewport.
   */
  @property({ reflect: true }) placement: 'top' | 'bottom' = 'bottom';

  /** The combobox's hint. If you need to display HTML, use the `hint` slot instead. */
  @property({ attribute: 'hint' }) hint = '';

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `label` element so the server-rendered markup
   * includes the label before the component hydrates on the client.
   */
  @property({ attribute: 'ssr-label', type: Boolean }) ssrLabel = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `hint` element so the server-rendered markup
   * includes the hint before the component hydrates on the client.
   */
  @property({ attribute: 'ssr-hint', type: Boolean }) ssrHint = false;

  /** Makes the combobox a required field. */
  @property({ type: Boolean, reflect: true }) required = false;

  /**
   * Keeps typed text that matches no option as the value. Single selection only; ignored when `multiple` is set. The
   * first match is not highlighted while typing, so Enter, Tab, leaving the field or closing the list keeps exactly
   * what was typed, and Escape throws it away. Text that equals an option's label picks that option.
   */
  @property({ attribute: 'allow-custom-value', type: Boolean }) allowCustomValue = false;

  /**
   * Shows a create option when the typed text matches nothing. Picking it emits a cancelable `cs-create` event, then
   * adds a `<cs-option>` with that text as its value and label, and picks it.
   */
  @property({ attribute: 'allow-create', type: Boolean }) allowCreate = false;

  /**
   * Decides which options match the typed text. Receives the option and the query and returns `true` to show it. The
   * default shows options whose label contains the query, ignoring case. Ignored in server mode.
   */
  @property({ attribute: false }) filter: ComboboxFilter | null = null;

  /**
   * Turns on server mode without a `dataSource`. The combobox stops filtering and emits `cs-options-request` instead.
   * Replace its options for that query, then set `loading` back to `false`. Implied when `dataSource` is set.
   */
  @property({ type: Boolean }) server = false;

  /**
   * Loads options from a server, and turns on server mode. Called with the query and an `AbortSignal` when the list
   * opens and as the user types. Return option data (`{ value, label, disabled }`), DOM nodes, or a Lit template. An
   * HTML string is rejected: the combobox never parses markup.
   */
  @property({ attribute: false }) dataSource: ComboboxDataSource | null = null;

  /** In server mode, how long to wait after the last keystroke before requesting options, in milliseconds. */
  @property({ attribute: 'filter-debounce', type: Number }) filterDebounce = 250;

  /**
   * Whether an options request is pending, from the keystroke that schedules it. In server mode without a
   * `dataSource`, set it back to `false` yourself once you have answered.
   */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Controls whether and how text input is automatically capitalized as it is entered by the user. */
  @property() autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

  /**
   * Indicates whether the browser's autocorrect feature is on or off. When set as an attribute, use `"off"` or `"on"`.
   * When set as a property, use `true` or `false`.
   */
  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => (!value || value === 'off' ? false : true),
      toAttribute: (value) => (value ? 'on' : 'off'),
    },
  })
  declare autocorrect: boolean;

  /** Enables spell checking on the text field. */
  @property({
    type: Boolean,
    converter: {
      // Allow "true|false" attribute values but keep the property boolean
      fromAttribute: (value) => (!value || value === 'false' ? false : true),
      toAttribute: (value) => (value ? 'true' : 'false'),
    },
  })
  spellcheck = false;

  /**
   * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
   * keyboard on supportive devices.
   */
  @property() inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** Used to customize the label or icon of the Enter key on virtual keyboards. */
  @property() enterkeyhint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /**
   * A function that customizes the tags to be rendered when `multiple` is true. The first argument is the option, the
   * second is the tag's index. Return a Lit template, an `HTMLElement`, or a string. A string is shown as plain text; it
   * is never parsed as HTML. The default tag shows the option's label and an inert, display-only copy of its `start`
   * content. The copy renders in the combobox's shadow root, where page CSS does not reach.
   */
  @property({ attribute: false }) getTag: (option: CsOption, index: number) => TemplateResult | string | HTMLElement = (
    option,
  ) => {
    return html`
      <cs-tag
        part="tag"
        exportparts="
            content:tag__content,
            remove-button:tag__remove-button,
            remove-button__button:tag__remove-button__button
          "
        ?pill=${this.pill}
        size=${this.size}
        with-remove
        data-value=${option.value}
        @cs-remove=${(event: CsRemoveEvent) => this.handleTagRemove(event, option)}
      >
        ${copyStartContent(option)} ${option.label}
      </cs-tag>
    `;
  };

  /** Where to anchor native constraint validation. */
  get validationTarget() {
    return this.displayInput;
  }

  /** @internal Whether anything is picked. Read by the required validator, which treats an empty array as a value. */
  get hasValue() {
    return this.selectedValues.length > 0;
  }

  connectedCallback() {
    super.connectedCallback();

    // Call processSlotChange directly so initial setup is synchronous. Later option changes are batched through
    // handleDefaultSlotChange.
    this.processSlotChange();

    // Because this is a form control, it shouldn't be opened initially
    this.open = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
    this.cancelRequest();
    clearTimeout(this.announceTimeout);
    this.cachedOptions = null;
  }

  /** The picked values in pick order, after dropping any the list cannot hold. */
  private get selectedValues(): string[] {
    const raw = this._value ?? this._defaultValue ?? [];

    // Server results come and go, and a custom value never has an option, so neither drops a value it can't see.
    let values = raw;
    if (!this.isServerMode && !this.acceptsCustomValue) {
      const known = this.knownValues();
      values = raw.filter((value) => known.has(value));
    }

    // Always a fresh array, so nothing outside can reach the stored one through `value`.
    return this.multiple ? [...values] : values.slice(0, 1);
  }

  private get isServerMode() {
    return this.server || this.dataSource !== null;
  }

  /** True while a newer keystroke's request waits on the debounce. */
  private get requestScheduled() {
    return this.requestTimeout !== undefined;
  }

  /**
   * True when the options showing answer text no longer in the field: text was typed, or the field was just emptied
   * and its request still waits. Read before finishEditing(), which clears both.
   */
  private get showingAnswerForOldText() {
    return this.query.trim() !== '' || this.requestScheduled;
  }

  private get acceptsCustomValue() {
    return this.allowCustomValue && !this.multiple;
  }

  private get showCreateOption() {
    const text = this.query.trim();
    return (
      this.allowCreate &&
      this.open &&
      text !== '' &&
      this.visibleCount === 0 &&
      !(this.isServerMode && (this.loading || this.loadFailed)) &&
      // A disabled option holding this value means it cannot be picked now, so it cannot be created either
      !this.getAllOptions().some((option) => option.disabled && option.value === text)
    );
  }

  /** Which status row the open list shows in place of options, if any. */
  private get statusRow(): StatusRow | null {
    // A failed request hides whatever options were showing, so the error row always stands alone.
    if (this.isServerMode && this.loadFailed) {
      return 'error';
    }
    if (this.visibleCount > 0 || this.showCreateOption) {
      return null;
    }
    if (this.isServerMode && this.loading) {
      return 'loading';
    }
    return this.query.trim() !== '' ? 'no-results' : 'empty';
  }

  private addOpenListeners() {
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    registerDismissible(this);

    // If the component is rendered in a shadow root, we need to attach the focusin listener there too
    const root = this.getRootNode();
    if (root !== document) {
      root.addEventListener('focusin', this.handleDocumentFocusIn);
      this.listenerRoot = root;
    }
  }

  private removeOpenListeners() {
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    unregisterDismissible(this);

    // Remove it from the root it was added to. Once the element is removed, getRootNode() is the element itself.
    this.listenerRoot?.removeEventListener('focusin', this.handleDocumentFocusIn);
    this.listenerRoot = null;
  }

  private handleDocumentFocusIn = (event: FocusEvent) => {
    // Close when focus moves somewhere outside the combobox
    if (!event.composedPath().includes(this)) {
      this.settleText();
      void this.hide();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    // The text field handles its own keys. This catches Escape when the list was opened with focus elsewhere.
    if (event.key === 'Escape' && this.open && isTopDismissible(this)) {
      event.preventDefault();
      event.stopPropagation();
      this.restoreText();
      void this.hide();
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) => {
    // Close when clicking outside of the combobox. This runs before the text field's blur, so settle the text here,
    // or closing would throw away custom text that leaving the field keeps.
    if (!event.composedPath().includes(this)) {
      this.settleText();
      void this.hide();
    }
  };

  private handleComboboxMouseDown(event: MouseEvent) {
    const path = event.composedPath();
    const isTag = path.some((el) => el instanceof Element && (el.localName === 'cs-tag' || el.localName === 'button'));

    // Ignore disabled controls, and clicks on tags (their remove buttons) and the clear button
    if (this.disabled || isTag) {
      return;
    }

    const onInput = path.includes(this.displayInput);
    const onExpandIcon = path.some((el) => el instanceof Element && el.classList?.contains('expand-icon'));
    const isFocused = this.shadowRoot?.activeElement === this.displayInput;

    // Keep focus in the text field. A press on the field itself is left alone, so once the field has focus the caret
    // lands where it was pressed. The press that first focuses it selects the label instead (handleInputFocus).
    // Decided afresh on every press, so a press released outside the field cannot leave it set for a later one
    this.keepSelectionOnMouseUp = onInput && !isFocused;
    if (!onInput) {
      event.preventDefault();
      this.displayInput.focus({ preventScroll: true });
    }

    if (onExpandIcon && this.open) {
      // Closing with the chevron is leaving the list, not cancelling it: only Escape throws typed text away.
      this.settleText();
      void this.hide();
      return;
    }

    void this.show();
  }

  private handleInputFocus() {
    // In single mode the field shows the pick's label. Select it, so typing replaces the label rather than adding to it.
    if (!this.multiple && !this.isEditing && this.displayInput.value !== '') {
      this.displayInput.select();
    }
  }

  private handleInputMouseUp(event: MouseEvent) {
    // Releasing the press that focused the field would collapse the selection into a caret. Keep it, once.
    if (this.keepSelectionOnMouseUp) {
      this.keepSelectionOnMouseUp = false;
      event.preventDefault();
    }
  }

  private handleInput(event: Event) {
    // Each keystroke changes only the text, not the value, so it does not leave the shadow root. `input` and `change`
    // are emitted when the value changes.
    event.stopPropagation();

    this.inputValue = this.displayInput.value;
    this.query = this.inputValue;
    this.isEditing = true;
    this.hasNavigated = false;
    this.highlightBasis = 'query';

    if (!this.open) {
      // Opening requests and filters with the query already set.
      void this.show();
      return;
    }

    if (this.isServerMode) {
      // The options showing answer an older query, so Enter must not pick one before the new results arrive.
      this.highlight(null);
      this.scheduleRequest();
      return;
    }

    this.applyFilter();
    this.highlightAfterTyping();
    this.scheduleAnnouncement();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.disabled || event.isComposing) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const down = event.key === 'ArrowDown';

        if (event.altKey) {
          // Alt+Down opens without moving the highlight; Alt+Up closes, settling the text as leaving does.
          if (down) {
            void this.show();
          } else if (this.open) {
            this.settleText();
            void this.hide();
          }
          return;
        }

        if (!this.open) {
          this.highlightBasis = down ? 'first' : 'last';
          void this.show();
          return;
        }

        this.moveHighlight(down ? 1 : -1);
        return;
      }

      case 'Home':
      case 'End': {
        // As in the ARIA APG editable combobox, these always move the caret in the text field. If the user had
        // arrowed into the list, the highlight goes back to where typing put it, as focus returns to the field.
        if (this.open && this.hasNavigated) {
          this.hasNavigated = false;
          this.highlightBasis = 'query';
          this.highlightAfterTyping();
        }
        return;
      }

      case 'Enter': {
        if (!this.open) {
          // The field sits in a shadow root, so the browser's implicit submission cannot reach the form.
          submitOnEnter(event, this);
          return;
        }
        event.preventDefault();
        this.handleEnter();
        return;
      }

      case 'Tab': {
        // Tab picks the highlight only when the user typed or moved to it. Focus then leaves, which closes the list.
        // In multiple mode it never un-picks: Tab past a picked option leaves it picked.
        const option = this.currentOption;
        const intended = this.query.trim() !== '' || this.hasNavigated;
        if (this.open && intended && this.createIsCurrent) {
          this.create();
        } else if (this.open && option && intended && !(this.multiple && option.selected)) {
          this.pick(option);
        }
        return;
      }

      case 'Escape': {
        if (this.open && isTopDismissible(this)) {
          event.preventDefault();
          event.stopPropagation();
          this.restoreText();
          void this.hide();
        } else if (!this.open && this.isEditing) {
          event.preventDefault();
          event.stopPropagation();
          this.restoreText();
        }
        return;
      }

      case 'Backspace': {
        // In an empty field, Backspace removes the last tag
        if (this.multiple && this.displayInput.value === '' && this.selectedValues.length > 0) {
          event.preventDefault();
          this.commitValues(this.selectedValues.slice(0, -1));
        }
        return;
      }
    }
  }

  private handleEnter() {
    if (this.createIsCurrent) {
      this.create();
      return;
    }

    if (this.currentOption) {
      this.pick(this.currentOption);
      return;
    }

    if (this.acceptsCustomValue) {
      this.commitTypedText();
      void this.hide();
      return;
    }

    if (!this.multiple && this.isEditing && this.inputValue.trim() === '') {
      this.finishEditing();
      this.commitValues([]);
      void this.hide();
      return;
    }

    // Nothing to pick. With text that matches nothing, the list stays open and says so.
    if (!this.isEditing) {
      void this.hide();
    }
  }

  private handleInputBlur(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    this.keepSelectionOnMouseUp = false;

    // Focus moving to a tag's remove button or the clear button stays inside the combobox.
    if (next && (this.contains(next) || this.shadowRoot?.contains(next))) {
      return;
    }

    this.settleText();
    void this.hide();
  }

  private handleClearClick(event: MouseEvent) {
    event.stopPropagation();

    if (this.selectedValues.length === 0 && this.inputValue === '') {
      return;
    }

    const hadQuery = this.showingAnswerForOldText;
    this.finishEditing();
    this.inputValue = '';
    this.displayInput.focus({ preventScroll: true });

    // Emit after update, ahead of the input and change events commitValues() queues
    void this.updateComplete.then(() => this.dispatchEvent(new CsClearEvent()));
    this.commitValues([]);
    if (this.open) {
      this.highlightBasis = 'query';
    }
    this.highlight(null);
    if (hadQuery) {
      this.showEveryOption();
    }
  }

  private handleClearMouseDown(event: MouseEvent) {
    // Don't lose focus or propagate events when clicking the clear button
    event.stopPropagation();
    event.preventDefault();
  }

  private handleListboxMouseDown(event: MouseEvent) {
    // Keep focus in the text field while picking with the pointer
    event.preventDefault();
  }

  private handleListboxClick(event: MouseEvent) {
    const option = (event.target as Element).closest('cs-option');

    if (!option || option.disabled) {
      return;
    }

    if (option === this.createOptionElement) {
      this.create();
    } else {
      this.pick(option);
    }

    this.displayInput.focus({ preventScroll: true });
  }

  /** @internal Called by `<cs-option>` when its label or value changes, so the combobox reads its options again. */
  handleDefaultSlotChange() {
    if (this.slotChangePending) {
      return;
    }

    this.slotChangePending = true;
    queueMicrotask(() => {
      this.slotChangePending = false;
      this.processSlotChange();
    });
  }

  /** @internal Called by `<cs-option>` when its `selected` property is set directly, as Vue does. */
  selectionChanged() {
    this.processSlotChange();
  }

  private processSlotChange() {
    if (isServer) {
      return;
    }

    if (this.didSSR && !this.hasUpdated) {
      void this.updateComplete.then(() => this.handleDefaultSlotChange());
      return;
    }

    // An option that has not upgraded yet has no value, so reading it now would match it to any pick. That happens
    // when cs-combobox is defined before cs-option, or upgrades first because its markup was set with innerHTML. Wait
    // once: whenDefined() settles after every pending option has upgraded, at once if cs-option is already defined.
    // Waiting only once means an option whose upgrade failed is skipped (getAllOptions) rather than waited on forever.
    const all = [...this.querySelectorAll<CsOption>('cs-option')];
    const defined = all.filter((option) => option.matches(':defined'));
    if (defined.length !== all.length && !this.waitingForOptions) {
      this.waitingForOptions = true;
      void customElements.whenDefined('cs-option').then(() => this.handleDefaultSlotChange());
      return;
    }
    this.waitingForOptions = false;

    const oldValue = this.value;
    // The same list getAllOptions() would build: only upgraded options
    this.cachedOptions = defined;
    this.updateDefaultValue();
    this.syncOptions();
    this.applyFilter();

    if (this.open) {
      this.refreshHighlight();
      this.scheduleAnnouncement();
    }

    // Options arriving or leaving can change which values the list holds
    this.requestUpdate('value', oldValue);
  }

  private updateDefaultValue() {
    const options = this.getAllOptions();

    // Before anything sets a value, an option's `selected` property counts too, which is how Vue binds `:selected`.
    const selected = options.filter(
      (option) =>
        option.hasAttribute('selected') || option.defaultSelected || (this._value === null && option.selected),
    );

    if (selected.length > 0) {
      const values = selected.map((option) => option.value);
      this._defaultValue = this.multiple ? values : values.slice(0, 1);
    }

    if (this.hasAttribute('value') && this.getAttribute('value')) {
      this._defaultValue = [this.getAttribute('value')!];
    }
  }

  // Gets an array of all `<cs-option>` elements
  private getAllOptions() {
    if (this.cachedOptions) {
      return this.cachedOptions;
    }
    if (!this?.querySelectorAll) {
      return [];
    }
    // Only upgraded options: one that has not upgraded has no value or label to read yet (see processSlotChange).
    this.cachedOptions = [...this.querySelectorAll<CsOption>('cs-option')].filter((option) =>
      option.matches(':defined'),
    );
    return this.cachedOptions;
  }

  private knownValues() {
    return new Set(
      this.getAllOptions()
        .filter((option) => !option.disabled)
        .map((option) => option.value),
    );
  }

  /** Non-option content of the default slot, such as `<cs-divider>` and `<small>` group labels. */
  private getDecorations() {
    if (!this?.children) {
      return [];
    }
    return [...this.children].filter((el) => !el.hasAttribute('slot') && el.localName !== 'cs-option');
  }

  /** The options the keyboard can reach: showing, enabled, and the create option last. */
  private navigableItems(): CsOption[] {
    const items = this.getAllOptions().filter((option) => !option.hidden && !option.disabled);
    if (this.showCreateOption && this.createOptionElement) {
      items.push(this.createOptionElement);
    }
    return items;
  }

  /** Marks each option picked or not, and keeps the field showing the pick. */
  private syncOptions() {
    const values = this.selectedValues;
    const picked = new Set(values);

    for (const option of this.getAllOptions()) {
      const isPicked = picked.has(option.value);
      if (option.selected !== isPicked) {
        option.selected = isPicked;
      }
      if (isPicked) {
        this.pickedOptions.set(option.value, option);
      }
    }

    for (const value of [...this.pickedOptions.keys()]) {
      if (!picked.has(value)) {
        this.pickedOptions.delete(value);
      }
    }

    this.syncTextToValue();
  }

  /** In single mode, shows the picked option's label in the field unless the user is typing. */
  private syncTextToValue() {
    if (this.multiple || this.isEditing) {
      return;
    }
    const value = this.selectedValues[0];
    this.inputValue = value === undefined ? '' : this.labelFor(value);
  }

  private labelFor(value: string) {
    const option = this.pickedOptions.get(value) ?? this.getAllOptions().find((el) => el.value === value);
    return option ? option.label : value;
  }

  /** The option element behind each tag. A value no option has ever carried gets a stand-in, so a tag can show it. */
  private tagOptions(): CsOption[] {
    return this.selectedValues.map((value) => {
      let option = this.pickedOptions.get(value) ?? this.getAllOptions().find((el) => el.value === value);
      if (!option) {
        option = document.createElement('cs-option');
        option.value = value;
        option.label = value;
        this.pickedOptions.set(value, option);
      }
      return option;
    });
  }

  /** Shows the options that match the query and hides the rest. In server mode the server has already filtered. */
  private applyFilter() {
    const filtering = this.open && !this.isServerMode && this.query.trim() !== '';
    // After a failed request the options showing answer an older query, so none may be picked until one succeeds.
    const failed = this.open && this.isServerMode && this.loadFailed;
    const matches = this.filter ?? defaultFilter;
    let count = 0;

    for (const option of this.getAllOptions()) {
      // An option the author hid stays hidden and is never counted.
      if (option.hidden && !this.filteredOut.has(option)) {
        continue;
      }

      const show = !failed && (!filtering || matches(option, this.query));
      this.setFilteredOut(option, !show);
      if (show) {
        count++;
      }
    }

    // Dividers and group labels only make sense around the full list.
    for (const decoration of this.getDecorations()) {
      if (decoration instanceof HTMLElement && (!decoration.hidden || this.filteredOut.has(decoration))) {
        this.setFilteredOut(decoration, filtering || failed);
      }
    }

    this.visibleCount = count;
  }

  private setFilteredOut(element: HTMLElement, hide: boolean) {
    if (hide) {
      if (!element.hidden) {
        element.hidden = true;
        this.filteredOut.add(element);
      }
    } else if (this.filteredOut.has(element)) {
      element.hidden = false;
      this.filteredOut.delete(element);
    }
  }

  /** After the list narrows, highlights the first match, unless typed text is allowed to stand as the value. */
  private highlightAfterTyping() {
    // The options showing answer older text until the answer for this text lands, so none of them is its first match
    if (this.query.trim() === '' || this.acceptsCustomValue || (this.isServerMode && this.loading)) {
      this.highlight(null);
      return;
    }

    if (this.showCreateOption) {
      // The create option renders on the next update; highlight it by state rather than by element.
      this.highlight(null);
      this.createIsCurrent = true;
      return;
    }

    this.highlight(this.navigableItems()[0] ?? null);
  }

  /*
   * What is highlighted. One rule for client and server mode: it runs when the list opens, and again whenever its
   * options change under it, which in server mode is when an answer lands.
   *
   * | Case                                      | Highlight                              | Tab picks it          |
   * | ----------------------------------------- | -------------------------------------- | --------------------- |
   * | Opened by Down / Up Arrow, nothing picked | The first / last option                | Yes                   |
   * | Opened with a pick, nothing typed         | The pick (in multiple mode, the first) | If an arrow opened it |
   * | Opened by pointer, Alt+Down or show()     | Nothing, unless there is a pick        | No                    |
   * | Text typed                                | The first match (1)                    | No                    |
   * | Text emptied by the user                  | Nothing, so Enter or leaving clears    | No                    |
   * | After a pick in multiple mode             | The option just picked (2)             | No                    |
   * | After the clear button                    | Nothing                                | No                    |
   * | After a failed request                    | Nothing (3)                            | No                    |
   * | Retry after a failure                     | The row for what triggered it (4)      | As that row           |
   *
   * (1) Nothing with allow-custom-value; the create option when nothing matches.
   * (2) No new request unless text had been typed: the options showing already answer the empty field.
   * (3) The options hide behind the error row.
   * (4) Typing, or reopening the list.
   *
   * Across every row: when the options change and the highlighted value is still among them, the highlight stays on
   * it (refreshHighlight), so a keyboard user keeps their place. `highlightBasis` records which half of the table
   * applies: 'first', 'last' or 'none' for the open rows, 'query' once the user types, empties or clears the field, or
   * picks in multiple mode.
   */
  private placeHighlight() {
    if (this.highlightBasis === 'query') {
      this.highlightAfterTyping();
      return;
    }

    const items = this.navigableItems();
    const picked = items.find((option) => option.selected);
    const start = this.highlightBasis === 'none' ? null : this.highlightBasis;
    const target = picked ?? (start === 'first' ? items[0] : start === 'last' ? items[items.length - 1] : undefined);

    this.highlight(target ?? null);
    if (target && start) {
      this.hasNavigated = true;
    }
  }

  /** After the options change under an open list: keeps the highlighted value if still there, else places again. */
  private refreshHighlight() {
    const items = this.navigableItems();
    const current = this.currentOption;
    if (current && items.includes(current)) {
      return;
    }

    // A server answer brings new elements, so look for the same value among them
    const sameValue = current ? items.find((option) => option.value === current.value) : undefined;
    if (sameValue) {
      this.highlight(sameValue);
      return;
    }

    this.placeHighlight();
  }

  private moveHighlight(delta: 1 | -1) {
    const items = this.navigableItems();
    if (items.length === 0) {
      return;
    }

    const current = this.createIsCurrent ? this.createOptionElement : this.currentOption;
    const index = current ? items.indexOf(current) : -1;
    const next = index === -1 ? (delta > 0 ? 0 : items.length - 1) : (index + delta + items.length) % items.length;

    this.highlight(items[next], { announce: true });
    this.hasNavigated = true;
  }

  /** Sets the highlighted option. Focus stays in the text field; the input points at the option instead. */
  private highlight(item: CsOption | null | undefined, options: { announce?: boolean } = {}) {
    const isCreate = !!item && item === this.createOptionElement;

    for (const option of this.getAllOptions()) {
      option.current = option === item;
    }

    this.currentOption = isCreate ? undefined : (item ?? undefined);
    this.createIsCurrent = isCreate;

    if (item && this.open && this.listbox && !this.listbox.hidden) {
      scrollIntoView(item, this.listbox, 'vertical', 'auto');
    }

    // Where the browser can point the input at an option in the light DOM, it announces the option itself. Elsewhere,
    // the live region reads it.
    if (item && options.announce && !this.supportsElementReflection()) {
      announce(item.label);
    }
  }

  private supportsElementReflection() {
    return 'ariaActiveDescendantElement' in Element.prototype;
  }

  /** Points the text field's active descendant at the highlighted option. */
  private syncActiveDescendant() {
    const input = this.displayInput;
    if (!input) {
      return;
    }

    const active = this.open ? ((this.createIsCurrent ? this.createOptionElement : this.currentOption) ?? null) : null;

    if (this.supportsElementReflection()) {
      if (input.ariaActiveDescendantElement !== active) {
        input.ariaActiveDescendantElement = active;
      }
      return;
    }

    // Without element reflection an ID reference cannot leave the shadow root, but the create option lives inside it.
    if (active && active === this.createOptionElement) {
      input.setAttribute('aria-activedescendant', 'create-option');
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  private scheduleAnnouncement() {
    clearTimeout(this.announceTimeout);
    this.announceTimeout = window.setTimeout(() => this.announceResults(), ANNOUNCE_DELAY);
  }

  /** Reads out the result count, or the status row that stands in for results. */
  private announceResults() {
    if (!this.open) {
      return;
    }

    const status = this.statusRow;
    let message: string;

    if (status) {
      message = this.statusText(status);
    } else if (this.visibleCount === 0 && this.showCreateOption) {
      message = this.localize.term('createOption', this.query.trim());
    } else {
      message = this.localize.term('numResults', this.visibleCount);
    }

    if (message && message !== this.lastAnnouncement) {
      this.lastAnnouncement = message;
      announce(message);
    }
  }

  /** The text a status row shows: the slotted content when there is some, else the default term. */
  private statusText(status: StatusRow) {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(`slot[name="${status}"]`);
    // Not `getText()`: it skips any element carrying a `slot` attribute, which every slotted status element does.
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    const text = assigned
      .map((node) => node.textContent ?? '')
      .join('')
      .trim();
    if (text) {
      return text;
    }

    const terms = {
      empty: 'noOptions',
      'no-results': 'noResults',
      loading: 'loading',
      error: 'optionsLoadError',
    } as const;
    return this.localize.term(terms[status]);
  }

  /** Picks an option. In single mode the list closes; in multiple mode it toggles the option and stays open. */
  private pick(option: CsOption) {
    if (option.disabled) {
      return;
    }

    const values = this.selectedValues;
    let next: string[];

    if (this.multiple) {
      next = values.includes(option.value)
        ? values.filter((value) => value !== option.value)
        : [...values, option.value];
    } else {
      next = [option.value];
    }

    const hadQuery = this.showingAnswerForOldText;
    this.pickedOptions.set(option.value, option);
    this.finishEditing();

    if (this.multiple) {
      this.inputValue = '';
      this.commitValues(next);
      this.highlightBasis = 'query';
      this.highlight(option);
      // With nothing typed or waiting, the options showing already answer the empty field: nothing to ask again.
      if (hadQuery) {
        this.showEveryOption();
      }
      this.scheduleAnnouncement();
    } else {
      this.commitValues(next);
      void this.hide();
    }
  }

  /**
   * After the query empties under an open list, shows every option again: by filtering on the client, or in server
   * mode by asking for the empty query's results, so the list never shows matches for text no longer in the field.
   */
  private showEveryOption() {
    if (!this.open) {
      return;
    }
    if (this.isServerMode) {
      void this.requestOptions();
    } else {
      this.applyFilter();
    }
  }

  /** Emits `cs-create`, then adds and picks an option for the typed text unless the event was cancelled. */
  private create() {
    const inputValue = this.query.trim();
    if (!inputValue) {
      return;
    }

    // The create option shows when no label matches, but the value may already be held. A pick stays picked, even
    // when a server answer has taken its option out of the list, rather than being created again and toggled off.
    const existing = this.getAllOptions().find((option) => option.value === inputValue && !option.disabled);
    if (this.selectedValues.includes(inputValue)) {
      this.finishEditing();
      if (this.multiple) {
        this.inputValue = '';
        this.highlightBasis = 'query';
        this.highlight(existing ?? null);
        this.showEveryOption();
      } else {
        this.syncTextToValue();
        void this.hide();
      }
      return;
    }

    // Or an option may carry this value under another label: pick it rather than add a second with the same value.
    if (existing) {
      this.pick(existing);
      return;
    }

    const event = new CsCreateEvent({ inputValue });
    this.dispatchEvent(event);
    if (event.defaultPrevented) {
      return;
    }

    const option = document.createElement('cs-option');
    option.setAttribute('value', inputValue);
    option.textContent = inputValue;

    // Right after the last option, so it lists last and lands outside a framework's trailing range when the options
    // come before it (replaceOptions). Options a framework renders itself are its own: cancel cs-create and add the
    // option through the framework, or its next render may drop this one.
    const last = this.getAllOptions().at(-1);
    if (last?.parentElement === this) {
      last.after(option);
    } else {
      this.prepend(option);
    }

    // Refresh the option cache now rather than on the next slotchange, so the pick below can find it.
    this.cachedOptions = null;
    this.pick(option);
  }

  /** Commits what is in the field as the value. Used when typed text may stand as the value. */
  private commitTypedText() {
    const text = this.inputValue.trim();
    this.finishEditing();

    if (text === '') {
      this.commitValues([]);
      return;
    }

    const match = this.getAllOptions().find(
      (option) => !option.disabled && option.label.trim().toLowerCase() === text.toLowerCase(),
    );

    if (match) {
      this.pickedOptions.set(match.value, match);
      this.commitValues([match.value]);
    } else {
      this.commitValues([text]);
    }
  }

  /** Ends typing when focus leaves: keeps custom text, clears an emptied field, or puts the pick's label back. */
  private settleText() {
    if (!this.isEditing) {
      if (this.multiple) {
        this.inputValue = '';
      }
      return;
    }

    if (this.acceptsCustomValue) {
      this.commitTypedText();
    } else if (!this.multiple && this.inputValue.trim() === '') {
      this.finishEditing();
      this.commitValues([]);
    } else {
      this.restoreText();
    }
  }

  /** Throws away what was typed. In single mode the field shows the last pick's label again. */
  private restoreText() {
    this.finishEditing();
    if (this.multiple) {
      this.inputValue = '';
    } else {
      this.syncTextToValue();
    }
  }

  private finishEditing() {
    this.isEditing = false;
    this.hasNavigated = false;
    this.query = '';
    this.cancelScheduledRequest();
  }

  /** Sets the picked values from a user action, and emits `input` and `change` when they changed. */
  private commitValues(next: string[]) {
    const before = this.selectedValues;
    this.hasInteracted = true;

    if (sameValues(before, next)) {
      this.syncOptions();
      return false;
    }

    const oldValue = this.value;
    this._value = next;
    this.valueHasChanged = true;
    this.requestUpdate('value', oldValue);
    this.syncValueState();
    this.syncOptions();

    // Emit after updating
    void this.updateComplete.then(() => {
      this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });

    return true;
  }

  /**
   * Writes the form value and validity now rather than leaving them to the next update. A commit can happen inside a
   * @watch handler (closing the list settles the text), where a requested update joins the one already running after
   * willUpdate() has written the form value, and would be lost.
   */
  private syncValueState() {
    this.updateFormValue(this.value);
    this.updateValidity();
  }

  private handleTagRemove(event: CsRemoveEvent, directOption?: CsOption) {
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    // Use the option the default tag passes; a custom tag names its option with `data-value`.
    let value = directOption?.value;
    if (value === undefined) {
      const tag = (event.target as Element).closest<HTMLElement>('cs-tag[data-value]');
      value = tag?.dataset.value;
    }

    if (value !== undefined) {
      this.commitValues(this.selectedValues.filter((picked) => picked !== value));
      this.displayInput.focus({ preventScroll: true });
    }
  }

  private scheduleRequest() {
    clearTimeout(this.requestTimeout);
    // Pending from the keystroke: the options showing answer older text, so neither the create option nor the
    // no-results row may stand for the new text until its answer lands.
    this.loading = true;
    this.requestTimeout = window.setTimeout(() => {
      this.requestTimeout = undefined;
      void this.requestOptions();
    }, this.filterDebounce);
  }

  private cancelScheduledRequest() {
    if (this.requestTimeout === undefined) {
      return;
    }
    clearTimeout(this.requestTimeout);
    this.requestTimeout = undefined;
    // Nothing is on its way now, unless a dataSource answer is still being awaited
    if (!this.awaitingAnswer) {
      this.loading = false;
    }
  }

  /** Aborts any request in flight, and any waiting on the debounce. */
  private cancelRequest() {
    this.cancelScheduledRequest();
    if (this.requestController) {
      this.requestController.abort();
      this.requestController = null;
      this.awaitingAnswer = false;
      this.loading = false;
    }
  }

  /**
   * Starts a request for the current query, aborting the one before it. With a `dataSource`, resolves once its options
   * are in the list. Without one, resolves once `cs-options-request` has been emitted.
   */
  private async requestOptions() {
    this.cancelScheduledRequest();
    this.requestController?.abort();
    // The aborted call's finally skips its cleanup once the controller changes, so clear its flag here
    this.awaitingAnswer = false;

    const controller = new AbortController();
    const { signal } = controller;
    const query = this.open ? this.query : '';
    this.requestController = controller;
    this.loadFailed = false;
    this.loading = true;

    this.dispatchEvent(new CsOptionsRequestEvent({ query, signal }));

    if (!this.dataSource) {
      return;
    }

    this.awaitingAnswer = true;
    try {
      const result = await this.dataSource(query, signal);
      // Aborted, or a newer keystroke's request waits on the debounce: this answer is for older text, so loading stays
      // on and the list stays as it is until the newer one lands.
      if (signal.aborted || this.requestScheduled) {
        return;
      }
      this.replaceOptions(result);
      this.loading = false;
    } catch (error) {
      if (signal.aborted || this.requestScheduled) {
        return;
      }
      // Hide what was showing behind the error row; the next open or keystroke requests again.
      this.loadFailed = true;
      this.loading = false;
      this.applyFilter();
      this.highlight(null);
      this.dispatchEvent(new CsOptionsErrorEvent({ error, request: { query } }));
    } finally {
      if (this.requestController === controller) {
        this.requestController = null;
        this.awaitingAnswer = false;
      }
    }

    if (this.open) {
      this.refreshHighlight();
      this.scheduleAnnouncement();
    }
    await this.updateComplete;
  }

  /**
   * Swaps the options for what a `dataSource` returned. Only what the combobox owns goes: the nodes it appended last
   * time, and any options, dividers and group labels in the default slot. Everything else stays, comments included,
   * because a framework rendering the combobox's children keeps its markers there.
   */
  private replaceOptions(result: ComboboxDataSourceResult) {
    const nodes = this.toNodes(result);
    const owned = ['cs-option', 'cs-divider', 'small'];

    for (const node of [...this.childNodes]) {
      const isOwnedElement = node instanceof Element && !node.hasAttribute('slot') && owned.includes(node.localName);
      if (this.serverNodes.has(node) || isOwnedElement) {
        if (node instanceof Element) {
          this.filteredOut.delete(node);
        }
        node.remove();
      }
    }

    // Put them first. Lit and Vue keep a marker among the combobox's children and own everything after it, so nodes
    // appended at the end would be removed on their next render.
    this.serverNodes = new Set(nodes);
    this.prepend(...nodes);
    this.processSlotChange();
  }

  private toNodes(result: ComboboxDataSourceResult): Node[] {
    if (isTemplateResult(result)) {
      const fragment = document.createDocumentFragment();
      render(result, fragment);
      return [...fragment.childNodes];
    }

    // A fragment empties itself into the combobox, so record its children: they are what replaceOptions removes next.
    if (result instanceof DocumentFragment) {
      return [...result.childNodes];
    }

    if (result instanceof Node) {
      return [result];
    }

    if (Array.isArray(result)) {
      return result.flatMap((item: ComboboxOptionData | Node) => {
        if (item instanceof DocumentFragment) {
          return [...item.childNodes];
        }
        return item instanceof Node ? [item] : [this.optionFromData(item)];
      });
    }

    // A string lands here on purpose: the combobox never parses markup it is handed.
    throw new TypeError('A cs-combobox dataSource must return option data, DOM nodes or a Lit template.');
  }

  private optionFromData(item: ComboboxOptionData) {
    if (!item || typeof item !== 'object' || item.value === undefined) {
      throw new TypeError('Each cs-combobox option needs a value.');
    }

    const option = document.createElement('cs-option');
    option.setAttribute('value', String(item.value));
    option.textContent = String(item.label ?? item.value);
    if (item.disabled) {
      option.setAttribute('disabled', '');
    }
    return option;
  }

  protected get tags() {
    const options = this.tagOptions();

    return options.map((option, index) => {
      if (index < this.maxOptionsVisible || this.maxOptionsVisible <= 0) {
        // A string renders as text. Lit never parses it as HTML.
        return this.getTag(option, index) ?? null;
      } else if (index === this.maxOptionsVisible) {
        // Hit tag limit
        return html`
          <cs-tag
            part="tag"
            exportparts="
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__button:tag__remove-button__button
            "
            >+${options.length - index}</cs-tag
          >
        `;
      }
      return null;
    });
  }

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    this.customStates.set('blank', this.selectedValues.length === 0 && this.inputValue === '');
    this.customStates.set('loading', this.loading);
    this.customStates.set('showing-loading-row', this.open && this.statusRow === 'loading');
    this.syncActiveDescendant();

    // The create option renders after the state that asks for it, so it can be highlighted only now.
    if (this.createOptionElement) {
      this.createOptionElement.current = this.createIsCurrent;
    }
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange() {
    // Close the listbox when the control is disabled while open. Not here and now: a property set inside a @watch
    // handler joins the update already running, after the `open` watcher has looked, so the close would never run.
    if (this.disabled && this.open) {
      void this.updateComplete.then(() => {
        if (this.disabled) {
          this.open = false;
        }
      });
    }
  }

  @watch('value', { waitUntilFirstUpdate: true })
  handleValueChange() {
    this.syncOptions();
    this.updateValidity();

    // A value set from outside cleared the query, so an open list shows everything again.
    if (this.open && this.query === '' && !this.isServerMode) {
      this.applyFilter();
    }
  }

  @watch(['allowCustomValue', 'server', 'dataSource'], { waitUntilFirstUpdate: true })
  handleValueRulesChange() {
    // These decide which values the combobox can hold, so the value, and the label in the field, can change with them.
    this.syncOptions();
    this.syncValueState();
    this.requestUpdate('value');
  }

  @watch('multiple', { waitUntilFirstUpdate: true })
  handleMultipleChange() {
    this.finishEditing();
    this.inputValue = '';
    this.syncOptions();
    this.syncValueState();
    this.requestUpdate('value');
  }

  private get isOpenAndEnabled() {
    return this.open && !this.disabled;
  }

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
    if (this.isOpenAndEnabled) {
      // Show
      const csShowEvent = new CsShowEvent();
      this.dispatchEvent(csShowEvent);
      if (csShowEvent.defaultPrevented) {
        // Forget where an arrow key meant to start, or a later open would still apply it
        this.highlightBasis = 'none';
        this.open = false;
        return;
      }

      this.addOpenListeners();
      this.listbox.hidden = false;
      this.popup.active = true;
      this.lastAnnouncement = '';

      if (this.query.trim() !== '' || this.isEditing) {
        this.highlightBasis = 'query';
      }
      this.applyFilter();

      // In server mode the request goes out first, so placing the highlight sees it pending
      if (this.isServerMode) {
        void this.requestOptions();
      } else {
        this.scheduleAnnouncement();
      }
      this.placeHighlight();

      await animateWithClass(this.popup.popup, 'show');

      // Closed during the show animation: the hide that closed it owns the final state.
      if (!this.isOpenAndEnabled) {
        return;
      }

      // Make sure the highlighted option is scrolled into view (required for Safari)
      if (this.currentOption) {
        scrollIntoView(this.currentOption, this.listbox, 'vertical', 'auto');
      }

      this.dispatchEvent(new CsAfterShowEvent());
    } else {
      // Hide
      const csHideEvent = new CsHideEvent();
      this.dispatchEvent(csHideEvent);
      if (csHideEvent.defaultPrevented) {
        this.open = true;
        return;
      }

      this.removeOpenListeners();
      this.cancelRequest();
      clearTimeout(this.announceTimeout);

      // Every close but Escape (which restored the text before getting here) settles what was typed, as leaving the
      // field does: `hide()`, `open = false` and disabling included.
      if (this.isEditing) {
        this.settleText();
      }
      this.query = '';
      this.hasNavigated = false;
      this.highlightBasis = 'none';
      this.highlight(null);

      await animateWithClass(this.popup.popup, 'hide');

      // Reopened during the hide animation: the show branch has already made the listbox visible.
      if (this.isOpenAndEnabled) {
        return;
      }

      this.listbox.hidden = true;
      this.popup.active = false;

      // Show every option again only once the list is out of sight, so it doesn't flash full during the animation.
      this.applyFilter();

      this.dispatchEvent(new CsAfterHideEvent());
    }
  }

  /** Shows the listbox. */
  async show() {
    if (this.open || this.disabled) {
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'cs-after-show');
  }

  /**
   * Hides the listbox. Typed text is settled as leaving the field does: kept with `allow-custom-value`, cleared when the
   * field was emptied, otherwise replaced by the pick's label. So `hide()` can change the value and emit `input` and
   * `change`. Only Escape throws typed text away.
   */
  async hide() {
    if (!this.open) {
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'cs-after-hide');
  }

  /**
   * Requests options again for the current query, or an empty one when the list is closed. Useful after creating
   * something on the server. With a `dataSource`, resolves once the new options are in the list, unless typing
   * schedules a newer request first: then that answer is for older text, and it resolves without it. Without a
   * `dataSource`, resolves once `cs-options-request` has been emitted. Outside server mode it filters the list again.
   */
  async reload() {
    if (!this.isServerMode) {
      this.processSlotChange();
      return;
    }

    await this.requestOptions();
  }

  /** Sets focus on the control. */
  focus(options?: FocusOptions) {
    this.displayInput.focus(options);
  }

  /** Removes focus from the control. */
  blur() {
    this.displayInput.blur();
  }

  formResetCallback() {
    this._value = null;
    this.finishEditing();
    super.formResetCallback();
    this.syncOptions();
    this.requestUpdate('value');
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label', 'ssrLabel');
    const hasHintSlot = this.hasSlotController.test('hint', 'ssrHint');
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    const hasValue = this.selectedValues.length > 0;
    // Tags need to wait for first hydration before populating, otherwise they create a hydration mismatch.
    const hasTags = this.multiple && this.hasUpdated && hasValue;
    const isClearVisible =
      // prevents hydration mismatch errors.
      (!this.didSSR || this.hasUpdated) && this.withClear && !this.disabled && (hasValue || this.inputValue !== '');
    const status = this.open ? this.statusRow : null;
    const createLabel = this.query.trim();

    return html`
      <div
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control-has-label': hasLabel,
        })}
      >
        <label
          id="label"
          part="form-control-label"
          class=${classMap({
            label: true,
            'has-label': hasLabel,
          })}
          for="input"
          aria-hidden=${hasLabel ? 'false' : 'true'}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <cs-popup
            class=${classMap({
              'combobox-popup': true,
              open: this.open,
              disabled: this.disabled,
              enabled: !this.disabled,
              multiple: this.multiple,
            })}
            placement=${this.placement}
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10"
          >
            <div part="combobox" class="combobox" slot="anchor" @mousedown=${this.handleComboboxMouseDown}>
              <span part="start" class="start"><slot name="start"></slot></span>

              <div class="input-area">
                ${
                  hasTags
                    ? html`<div part="tags" class="tags" @cs-remove=${this.handleTagRemove}>${this.tags}</div>`
                    : ''
                }

                <input
                  id="input"
                  part="display-input"
                  class="display-input"
                  type="text"
                  role="combobox"
                  placeholder=${hasTags ? '' : this.placeholder}
                  .value=${live(this.inputValue)}
                  ?disabled=${this.disabled}
                  autocomplete="off"
                  autocapitalize=${ifDefined(this.autocapitalize)}
                  autocorrect=${this.autocorrect ? 'on' : 'off'}
                  spellcheck=${this.spellcheck ? 'true' : 'false'}
                  inputmode=${ifDefined(this.inputmode)}
                  enterkeyhint=${ifDefined(this.enterkeyhint)}
                  aria-autocomplete="list"
                  aria-expanded=${this.open ? 'true' : 'false'}
                  aria-haspopup="listbox"
                  aria-controls="listbox"
                  aria-describedby="hint"
                  aria-required=${this.required ? 'true' : 'false'}
                  aria-invalid=${this.hasInteracted && !this.validity.valid ? 'true' : 'false'}
                  @input=${this.handleInput}
                  @keydown=${this.handleKeyDown}
                  @focus=${this.handleInputFocus}
                  @mouseup=${this.handleInputMouseUp}
                  @blur=${this.handleInputBlur}
                />
              </div>

              ${
                isClearVisible
                  ? html`
                      <button
                        part="clear-button"
                        type="button"
                        aria-label=${this.localize.term('clearEntry')}
                        @mousedown=${this.handleClearMouseDown}
                        @click=${this.handleClearClick}
                        tabindex="-1"
                      >
                        <slot name="clear-icon">
                          <cs-icon name="cancel" library="system"></cs-icon>
                        </slot>
                      </button>
                    `
                  : ''
              }
              ${
                this.loading && status !== 'loading'
                  ? html`<cs-spinner part="spinner" class="spinner" aria-hidden="true"></cs-spinner>`
                  : ''
              }

              <span part="end" class="end"><slot name="end"></slot></span>

              <span part="expand-icon" class="expand-icon">
                <slot name="expand-icon">
                  <cs-icon library="system" name="keyboard_arrow_down"></cs-icon>
                </slot>
              </span>
            </div>

            <!--
              The panel scrolls, and Chromium and Firefox make a scroller a tab stop. Focus stays in the text field, so
              keep it out of the tab order: Tab moves on to the next control.
            -->
            <div
              part="listbox"
              class="listbox"
              tabindex="-1"
              @mousedown=${this.handleListboxMouseDown}
              @click=${this.handleListboxClick}
            >
              <div
                id="listbox"
                class="options"
                role="listbox"
                aria-labelledby="label"
                aria-multiselectable=${this.multiple ? 'true' : 'false'}
              >
                <slot @slotchange=${this.handleDefaultSlotChange}></slot>
                ${
                  this.showCreateOption
                    ? html`<cs-option id="create-option" class="create-option" value=${createLabel}
                        >${this.localize.term('createOption', createLabel)}</cs-option
                      >`
                    : ''
                }
              </div>

              <div part="status empty" class="status" ?hidden=${status !== 'empty'}>
                <slot name="empty">${this.localize.term('noOptions')}</slot>
              </div>
              <div part="status no-results" class="status" ?hidden=${status !== 'no-results'}>
                <slot name="no-results">${this.localize.term('noResults')}</slot>
              </div>
              <div part="status loading" class="status" ?hidden=${status !== 'loading'}>
                <slot name="loading">${this.localize.term('loading')}</slot>
              </div>
              <div part="status error" class="status" ?hidden=${status !== 'error'}>
                <slot name="error">${this.localize.term('optionsLoadError')}</slot>
              </div>
            </div>
          </cs-popup>
        </div>

        <div
          id="hint"
          part="hint"
          class=${classMap({
            'has-slotted': hasHint,
          })}
          aria-hidden=${hasHint ? 'false' : 'true'}
        >
          <slot name="hint">${this.hint}</slot>
        </div>
      </div>
    `;
  }
}

// The change-in-update warning is required for this component for the same reasons as `<cs-select>`: the
// form-associated base class calls updateValidity() in firstUpdated(), HasSlotController requests an update on initial
// slotchange events, and syncing options to the value sets state in response to slot content changes. See
// https://lit.dev/docs/tools/development/#development-build-runtime-warnings
CsCombobox.disableWarning?.('change-in-update');

declare global {
  interface HTMLElementTagNameMap {
    'cs-combobox': CsCombobox;
  }
}
