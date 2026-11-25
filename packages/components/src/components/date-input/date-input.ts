import { html, isServer, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CsAfterHideEvent } from '../../events/after-hide.js';
import { CsAfterShowEvent } from '../../events/after-show.js';
import { CsClearEvent } from '../../events/clear.js';
import { CsHideEvent } from '../../events/hide.js';
import { CsShowEvent } from '../../events/show.js';
import { animateWithClass } from '../../internal/animate.js';
import { CornerstoneFormAssociatedElement } from '../../internal/cornerstone-form-associated-element.js';
import { customElement } from '../../internal/custom-element.js';
import { isTopDismissible, registerDismissible, unregisterDismissible } from '../../internal/dismissible-stack.js';
import { waitForEvent } from '../../internal/event.js';
import { uniqueId } from '../../internal/math.js';
import { SegmentedFieldController } from '../../internal/segmented-field/segmented-field-controller.js';
import { HasSlotController } from '../../internal/slot.js';
import { MirrorValidator } from '../../internal/validators/mirror-validator.js';
import { RequiredValidator } from '../../internal/validators/required-validator.js';
import { watch } from '../../internal/watch.js';
import formControlStyles from '../../styles/component/form-control.styles.js';
import segmentedFieldStyles from '../../styles/component/segmented-field.styles.js';
import sizeStyles from '../../styles/component/size.styles.js';
import visuallyHidden from '../../styles/component/visually-hidden.styles.js';
import { LocalizeController } from '../../utilities/localize.js';
import '../date-picker/date-picker.js';
import type CsDatePicker from '../date-picker/date-picker.js';
import type { CsDatePickerFirstDayOfWeek } from '../date-picker/date-picker.js';
import {
  type CalendarDate,
  dayOfWeek,
  localToday,
  parseIsoDate,
  parseIsoDateList,
  parseWeekdays,
  resolveLocale,
  toIsoDate,
} from '../date-picker/internal/calendar-date.js';
import '../icon/icon.js';
import '../popup/popup.js';
import type CsPopup from '../popup/popup.js';
import styles from './date-input.styles.js';
import { DateEntryValidator } from './internal/date-entry-validator.js';
import {
  buildDateSegmentLayout,
  dateSegmentBounds,
  dateSegmentRules,
  dateSegmentsToIso,
  type DateField,
  type DateSegments,
  EMPTY_DATE_SEGMENTS,
  formatDateSegmentText,
  formatMonthName,
  isDateSegmentsEmpty,
  isoToDateSegments,
} from './internal/date-segments.js';

export type CsDateInputSize = 'xs' | 's' | 'm' | 'l' | 'xl';
export type CsDateInputAppearance = 'filled' | 'outlined' | 'filled-outlined';
export type CsDateInputPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
export type CsDateInputFirstDayOfWeek = CsDatePickerFirstDayOfWeek;

/** The controller groups segments; a single date is one group. */
const GROUP = 'single';

/** `YYYY-MM-DD` for a real date, else `''`. A `Date` gives its local calendar day. */
function toIsoValue(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return '';
    }
    const iso = toIsoDate({ year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() });
    return parseIsoDate(iso) ? iso : '';
  }
  return typeof value === 'string' && parseIsoDate(value) ? value : '';
}

/**
 * @summary Date inputs let users type a date into month, day and year segments in their locale's order, or pick one
 *  from a calendar in a popup.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/date-input
 * @status experimental
 * @since 0.14
 *
 * @dependency cs-date-picker
 * @dependency cs-icon
 * @dependency cs-popup
 *
 * @slot label - The date input's label. Alternatively, use the `label` attribute.
 * @slot hint - Text that describes how to use the date input. Alternatively, use the `hint` attribute.
 * @slot start - An element placed at the start of the input.
 * @slot end - An element placed at the end of the input.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot expand-icon - The icon to show on the popup toggle button. Defaults to a calendar icon.
 *
 * @event change - Emitted when the value changes: a date typed in full, a day picked from the calendar, or a clear.
 * @event input - Emitted on every segment edit, day picked and clear, even while the date is incomplete.
 * @event focus - Emitted when the control receives focus.
 * @event blur - Emitted when the control loses focus.
 * @event cs-clear - Emitted when the clear button is activated.
 * @event cs-show - Emitted when the popup is about to open. Cancelable.
 * @event cs-after-show - Emitted after the popup opens and animations complete.
 * @event cs-hide - Emitted when the popup is about to close. Cancelable.
 * @event cs-after-hide - Emitted after the popup closes and animations complete.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The input's wrapper.
 * @csspart hint - The hint's wrapper.
 * @csspart date-input - The component's outer wrapper.
 * @csspart input-wrapper - The container around the start slot, segmented input, clear button, and expand button.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart input - The segmented input group.
 * @csspart segment - Each month, day and year spinbutton. Use `[part~="segment"]` to style all.
 * @csspart segment-literal - Inert literal text between segments (separators).
 * @csspart clear-button - The clear button.
 * @csspart expand-button - The popup toggle button.
 * @csspart expand-icon - The expand icon wrapper.
 * @csspart popup - The popup container.
 * @csspart date-picker - The `<cs-date-picker>` in the popup.
 * @csspart date-picker__date-picker - The picker's `date-picker` part.
 * @csspart date-picker__header - The picker's `header` part.
 * @csspart date-picker__title - The picker's `title` part.
 * @csspart date-picker__navigation-button - The picker's `navigation-button` part.
 * @csspart date-picker__navigation-button-previous - The picker's `navigation-button-previous` part.
 * @csspart date-picker__navigation-button-next - The picker's `navigation-button-next` part.
 * @csspart date-picker__grid - The picker's `grid` part.
 * @csspart date-picker__weekday - The picker's `weekday` part.
 * @csspart date-picker__day - The picker's `day` part.
 * @csspart date-picker__day-selected - The picker's `day-selected` part.
 * @csspart date-picker__day-today - The picker's `day-today` part.
 * @csspart date-picker__day-disabled - The picker's `day-disabled` part.
 *
 * @cssproperty [--cs-show-duration=var(--cs-transition-fast)] - The duration of the show animation. `0ms` when the user
 *  prefers reduced motion.
 * @cssproperty [--cs-hide-duration=var(--cs-transition-fast)] - The duration of the hide animation. `0ms` when the user
 *  prefers reduced motion.
 *
 * @cssstate blank - The date input has no value.
 * @cssstate open - The popup is open.
 * @cssstate disabled - The date input is disabled.
 */
@customElement('cs-date-input')
export default class CsDateInput extends CornerstoneFormAssociatedElement {
  static css = [sizeStyles, formControlStyles, segmentedFieldStyles, visuallyHidden, styles];

  static shadowRootOptions = {
    ...CornerstoneFormAssociatedElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static get validators() {
    return [
      ...super.validators,
      // First, so a partial entry reads "Enter a valid date." rather than the required message: the value is empty
      // whenever the entry doesn't compose.
      DateEntryValidator(),
      RequiredValidator({
        validationElement: () => Object.assign(document.createElement('input'), { required: true }),
      }),
      // Mirrors the hidden `<input type="date">`, so `min` and `max` report rangeUnderflow and rangeOverflow.
      MirrorValidator(),
    ];
  }

  /** Every segment edit dispatches `input`, so a single observed `input` event marks the field as interacted with. */
  assumeInteractionOn = ['input'];

  private readonly hasSlotController = new HasSlotController(this, 'hint', 'label');
  private readonly localize = new LocalizeController(this);
  private readonly popupId = uniqueId('cs-date-input-');
  private readonly keyboardHelpId = `${this.popupId}-help`;

  private _value = '';
  private pendingValue: string | null = null;
  /** The value `change` last reported, so a value that hasn't moved doesn't report again. */
  private lastEmittedValue = '';
  /** Set by Alt+Down Arrow and the expand button: the next open moves focus into the calendar. */
  private moveFocusToPickerOnShow = false;

  private readonly segmentsController = new SegmentedFieldController(this, {
    getLayout: () => this.layout,
    isRtl: () => this.localize.dir() === 'rtl',
    isReadonly: () => this.readonly,
    isDisabled: () => this.disabled,
    rules: dateSegmentRules({ getSegments: () => this.segments, today: () => this.resolvedToday }),
    onCommit: (_group, field, value) => {
      this.segments = { ...this.segments, [field]: value as number | null };
      this.recomputeValue();
    },
  });

  @query('.date-input-popup') popup!: CsPopup;
  @query('.value-input') valueInput!: HTMLInputElement;
  @query('.date-picker') private datePicker!: CsDatePicker;

  /** The segments shown in the field. `value` is composed from them. */
  @state() private segments: DateSegments = { ...EMPTY_DATE_SEGMENTS };

  /** The date input's name, submitted as a name/value pair with form data. */
  @property({ reflect: true }) name = '';

  /**
   * The date as `YYYY-MM-DD`, or an empty string while the segments are empty, partly filled or don't name a real date.
   * The setter also accepts a `Date`, which gives its local calendar day, or `null`.
   */
  get value(): string {
    if (this.valueHasChanged) {
      return this._value;
    }
    return this._value || toIsoValue(this.defaultValue);
  }
  @state()
  set value(value: string | Date | null) {
    const normalized = toIsoValue(value);
    if (normalized === this._value) {
      return;
    }
    const oldValue = this._value;
    this._value = normalized;
    this.valueHasChanged = true;
    if (this.hasUpdated) {
      this.syncSegmentsFromValue();
    } else {
      this.pendingValue = normalized;
    }
    this.requestUpdate('value', oldValue);
  }

  /** The default value of the form control, as `YYYY-MM-DD`. Used for form reset. */
  @property({ attribute: 'value', reflect: true }) defaultValue: string = this.getAttribute('value') ?? '';

  /** Disables the date input. */
  @property({ type: Boolean }) disabled = false;

  /** Makes the date input required for form submission. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Makes the segments non-editable. The popup still opens for browsing. */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /** The date input's size. */
  @property({ reflect: true }) size: CsDateInputSize = 'm';

  /** The date input's visual appearance. */
  @property({ reflect: true }) appearance: CsDateInputAppearance = 'outlined';

  /** Draws a pill-style date input with rounded edges. */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** The date input's label. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /** The date input's hint. If you need to display HTML, use the `hint` slot instead. */
  @property({ attribute: 'hint' }) hint = '';

  /** Forwarded to the hidden form input to enable browser autofill (`on`, `off`, `bday` and other tokens). */
  @property() autocomplete = '';

  /** Shows a clear button once anything has been typed or picked. */
  @property({ attribute: 'with-clear', type: Boolean }) withClear = false;

  /** Only required for SSR. Set to `true` if you're slotting in a `label` element. */
  @property({ attribute: 'ssr-label', type: Boolean }) ssrLabel = false;

  /** Only required for SSR. Set to `true` if you're slotting in a `hint` element. */
  @property({ attribute: 'ssr-hint', type: Boolean }) ssrHint = false;

  /** The earliest date that can be picked or typed without `rangeUnderflow`, as `YYYY-MM-DD`. */
  @property({ reflect: true }) min = '';

  /** The latest date that can be picked or typed without `rangeOverflow`, as `YYYY-MM-DD`. */
  @property({ reflect: true }) max = '';

  /**
   * Dates that can't be picked, as a whitespace-separated list of `YYYY-MM-DD` dates. Typing one in makes the field
   * invalid with `badInput`.
   */
  @property({ attribute: 'disabled-dates' }) disabledDates = '';

  /**
   * Weekdays that can't be picked, as a space-separated list of `sun`, `mon`, `tue`, `wed`, `thu`, `fri` and `sat`.
   * Typing a date on one makes the field invalid with `badInput`.
   */
  @property({ attribute: 'disabled-days-of-week' }) disabledDaysOfWeek = '';

  /**
   * The date the calendar marks as today, and the date an empty segment steps from, as `YYYY-MM-DD`. When empty, today
   * comes from the user's clock and time zone.
   */
  @property() today = '';

  /** The weekday in the calendar's first column. `auto` takes it from the locale. */
  @property({ attribute: 'first-day-of-week' }) firstDayOfWeek: CsDateInputFirstDayOfWeek = 'auto';

  /**
   * The BCP-47 locale for the segment order and separators and for the calendar. When empty, the inherited `lang` is
   * used. The segment and button labels follow `lang`.
   */
  @property() locale = '';

  /** Whether the popup is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Preferred popup placement. */
  @property({ reflect: true }) placement: CsDateInputPlacement = 'bottom-start';

  /** Distance in pixels between the popup and the input. */
  @property({ type: Number, reflect: true }) distance = 0;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
  }

  protected willUpdate(changedProperties: PropertyValues<this>) {
    // The first render, on the server too, shows the starting value's segments rather than empty ones.
    if (!this.hasUpdated) {
      this.segments = isoToDateSegments(this.pendingValue ?? toIsoValue(this.defaultValue));
    }
    super.willUpdate(changedProperties);
  }

  firstUpdated(changedProperties: PropertyValues<typeof this>) {
    super.firstUpdated(changedProperties);

    if (this.pendingValue !== null) {
      this._value = this.pendingValue;
      this.pendingValue = null;
    } else if (!this._value && this.defaultValue) {
      this._value = toIsoValue(this.defaultValue);
    }
    this.syncSegmentsFromValue();
    // `MirrorValidator` reads `this.input`, the hidden `<input type="date">` that carries `min` and `max`.
    this.input = this.valueInput;
    this.updateValidity();
    this.lastEmittedValue = this._value;
    // Rendered open: the popup is already showing, so it needs the listeners that close it.
    if (this.open && !this.disabled) {
      this.addOpenListeners();
    }
  }

  protected updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    // Typing sets the value without going through the setter, so the state is read on every update.
    this.customStates.set('blank', !this._value);
    if (changedProperties.has('open')) {
      this.customStates.set('open', this.open);
    }
    if (
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('disabledDates') ||
      changedProperties.has('disabledDaysOfWeek')
    ) {
      // The mirror's `min` and `max` are bound during render, so validity is read again after it.
      this.updateValidity();
    }
  }

  /**
   * A blank date leaves the form data, as `<cs-known-date>`'s does, rather than submitting `name=`.
   *
   * @internal
   */
  protected updateFormValue(value: unknown) {
    super.updateFormValue(value === '' ? null : value);
  }

  /**
   * The message for a date the segments show but the field won't accept, or `''`. Read by `DateEntryValidator`.
   *
   * @internal
   */
  get entryError(): string {
    const value = this.value;
    const date = parseIsoDate(value);
    if (!date) {
      return isDateSegmentsEmpty(this.segments) ? '' : this.term('incompleteDate', 'Enter a valid date.');
    }
    const blocked =
      parseIsoDateList(this.disabledDates).has(value) || parseWeekdays(this.disabledDaysOfWeek).has(dayOfWeek(date));
    return blocked ? this.term('incompleteDate', 'Enter a valid date.') : '';
  }

  private get layout() {
    return buildDateSegmentLayout(this.resolvedLocale);
  }

  private get resolvedLocale(): string {
    return resolveLocale(this.locale || this.localize.lang());
  }

  private get resolvedToday(): CalendarDate {
    return parseIsoDate(this.today) ?? localToday();
  }

  private get isFocusInPopup(): boolean {
    const active = this.shadowRoot?.activeElement;
    return !!active && !!this.popup?.contains(active);
  }

  /** A localized term, or its English text if a translation doesn't have it yet. */
  private term(
    key: 'chooseDate' | 'datePickerKeyboardHelp' | 'date' | 'empty' | 'incompleteDate',
    fallback: string,
  ): string {
    return this.localize.term(key) || fallback;
  }

  private fieldLabel(field: DateField): string {
    return this.localize.term(field) || { year: 'Year', month: 'Month', day: 'Day' }[field];
  }

  /** Replaces the segments with the value's, dropping any digits still being typed. */
  private syncSegmentsFromValue() {
    this.segmentsController.clearBuffers();
    this.segments = isoToDateSegments(this._value);
    this.updateHiddenInput();
  }

  private updateHiddenInput() {
    if (this.valueInput) {
      this.valueInput.value = this._value;
    }
    this.setValue(this._value || null);
  }

  /**
   * Composes the value from the segments after an edit. Fires `input` every time and `change` when the value moved, as
   * a native date input does.
   */
  private recomputeValue() {
    const value = dateSegmentsToIso(this.segments);
    if (value !== this._value) {
      this._value = value;
      this.valueHasChanged = true;
      this.updateHiddenInput();
    }
    // Even an unchanged value can change validity: a first digit makes an empty field a partial one.
    this.updateValidity();

    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    if (value !== this.lastEmittedValue) {
      this.lastEmittedValue = value;
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
  }

  private addOpenListeners() {
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    registerDismissible(this);
  }

  private removeOpenListeners() {
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    unregisterDismissible(this);
  }

  /** Puts focus back on the segment the user was last in, else the first empty one. */
  private focusActiveSegment() {
    const active = this.segmentsController.getActiveSegment();
    const segment = active ? this.segmentsController.segmentElementFor(active.group, active.field) : null;
    (segment ?? this.firstFocusableSegment())?.focus({ preventScroll: true });
  }

  private firstFocusableSegment(): HTMLElement | null {
    return this.segmentsController.findFocusableSegment((_group, field) => this.segments[field as DateField] === null);
  }

  private handleDocumentFocusIn = (event: Event) => {
    if (!event.composedPath().includes(this)) {
      void this.hide();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open && isTopDismissible(this)) {
      event.stopPropagation();
      event.preventDefault();
      void this.hide();
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) => {
    if (!event.composedPath().includes(this)) {
      void this.hide();
    }
  };

  private handleLabelClick() {
    this.focus();
  }

  private handleSegmentFocus(event: FocusEvent) {
    this.segmentsController.eventHandlers().focus(event);
  }

  private handleSegmentBlur(event: FocusEvent) {
    this.segmentsController.eventHandlers().blur(event);
  }

  // The popup opens on a pointer press in the field but not when focus arrives by Tab, which would get in the way of
  // the tab order. It also opens from the expand button and Alt+Down Arrow.
  private handleInputWrapperPointerDown(event: PointerEvent) {
    if (this.disabled || this.readonly || this.open) {
      return;
    }
    // A press on a button in the field (clear, expand, a slotted action) has its own meaning; opening too would race it.
    // The whole composed path is walked so an icon inside a nested shadow root still counts as its button.
    for (const node of event.composedPath()) {
      if (node === this) {
        break;
      }
      if (
        node instanceof Element &&
        (node.tagName === 'BUTTON' || node.tagName === 'A' || node.getAttribute('role') === 'button')
      ) {
        return;
      }
    }
    void this.show();
  }

  private handleSegmentKeyDown(event: KeyboardEvent) {
    const segment = event.currentTarget as HTMLElement;
    const field = segment.dataset.segment as DateField;

    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.open) {
        this.datePicker.focus();
      } else {
        this.moveFocusToPickerOnShow = true;
        void this.show();
      }
      return;
    }
    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      void this.hide();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.segmentsController.getBuffer(GROUP, field)) {
        this.segmentsController.flushBuffer(GROUP, field);
      }
      void this.hide();
      return;
    }

    this.segmentsController.eventHandlers().keydown(event);
  }

  private handlePopupKeyDown(event: KeyboardEvent) {
    // The calendar leaves keys held with Alt to whatever it sits in.
    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      void this.hide();
    }
  }

  private handleExpandButtonClick() {
    if (this.open) {
      void this.hide();
    } else {
      this.moveFocusToPickerOnShow = true;
      void this.show();
    }
  }

  private handleClearMouseDown(event: MouseEvent) {
    // Keep focus where it is; the click handler moves it.
    event.preventDefault();
    event.stopPropagation();
  }

  private handleClearClick(event: MouseEvent) {
    event.stopPropagation();
    this.segmentsController.clearBuffers();
    this.segments = { ...EMPTY_DATE_SEGMENTS };
    this.dispatchEvent(new CsClearEvent());
    this.recomputeValue();
    this.focus();
  }

  private handleDatePickerChange(event: Event) {
    // The picker's own `cs-change` stays inside; the date input reports the pick as `input` and `change`.
    event.stopPropagation();
    this.segmentsController.clearBuffers();
    this.segments = isoToDateSegments(this.datePicker.value);
    this.recomputeValue();
    void this.hide();
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  async handleDisabledChange() {
    if (this.disabled && this.open) {
      // After this update: set during it, the change joins the update already running and `open`'s watcher, which
      // closes the popup and reports it, never sees it.
      await this.updateComplete;
      this.open = false;
    }
  }

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
    if (this.open && !this.disabled) {
      const showEvent = new CsShowEvent();
      this.dispatchEvent(showEvent);
      if (showEvent.defaultPrevented) {
        this.moveFocusToPickerOnShow = false;
        this.open = false;
        return;
      }
      this.addOpenListeners();
      this.popup.active = true;
      await this.updateComplete;
      await animateWithClass(this.popup.popup, 'show');
      // Closed during the show animation: the hide that closed it owns the final state, and the focus move belonged to
      // this open, so it is dropped rather than carried into the next one.
      if (!this.open || this.disabled) {
        this.moveFocusToPickerOnShow = false;
        return;
      }
      if (this.moveFocusToPickerOnShow) {
        this.moveFocusToPickerOnShow = false;
        this.datePicker.focus();
      }
      this.dispatchEvent(new CsAfterShowEvent());
    } else {
      // A show that `cs-show` cancelled never opened, so there is nothing to hide.
      if (!this.popup.active) {
        return;
      }
      const hideEvent = new CsHideEvent();
      this.dispatchEvent(hideEvent);
      if (hideEvent.defaultPrevented) {
        this.open = true;
        return;
      }
      this.removeOpenListeners();
      await animateWithClass(this.popup.popup, 'hide');
      // Reopened during the hide animation: the show branch has already made the popup active.
      if (this.open && !this.disabled) {
        return;
      }
      // Read before the popup goes inactive, which hides whatever had focus in it.
      const focusWasInPopup = this.isFocusInPopup;
      this.popup.active = false;
      this.dispatchEvent(new CsAfterHideEvent());
      if (focusWasInPopup) {
        this.focusActiveSegment();
      }
    }
  }

  /** Sets focus on the first empty segment, else the first segment. */
  focus(options?: FocusOptions) {
    this.firstFocusableSegment()?.focus(options);
  }

  /** Removes focus from the date input. */
  blur() {
    (this.shadowRoot?.activeElement as HTMLElement | null)?.blur();
  }

  /** Opens the popup. */
  async show(): Promise<void> {
    if (this.open || this.disabled) {
      return;
    }
    this.open = true;
    await waitForEvent(this, 'cs-after-show');
  }

  /** Closes the popup. */
  async hide(): Promise<void> {
    if (!this.open || this.disabled) {
      return;
    }
    this.open = false;
    await waitForEvent(this, 'cs-after-hide');
  }

  /** The date as a `Date` at local midnight, or `null` when the value is empty. */
  get valueAsDate(): Date | null {
    const date = parseIsoDate(this.value);
    if (!date) {
      return null;
    }
    // `setFullYear`, because the `Date` constructor reads years 0 to 99 as 1900 to 1999.
    const result = new Date(2000, 0, 1);
    result.setFullYear(date.year, date.month - 1, date.day);
    return result;
  }

  formResetCallback() {
    this._value = toIsoValue(this.defaultValue);
    this.syncSegmentsFromValue();
    super.formResetCallback();
    this.lastEmittedValue = this._value;
    this.requestUpdate();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === 'string') {
      // Through the setter, which handles a restore before the first update and keeps the segments in step.
      this.value = state;
    }
    this.updateValidity();
  }

  render() {
    const hasLabel = !!this.label || this.hasSlotController.test('label', 'ssrLabel');
    const hasHint = !!this.hint || this.hasSlotController.test('hint', 'ssrHint');
    const canClear = this.withClear && !this.disabled && !this.readonly && !isDateSegmentsEmpty(this.segments);

    return html`
      <div part="form-control" class=${classMap({ 'form-control': true, 'form-control-has-label': hasLabel })}>
        <label
          id="label"
          part="form-control-label"
          class=${classMap({ label: true, 'has-label': hasLabel })}
          aria-hidden=${hasLabel ? 'false' : 'true'}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <cs-popup
            class=${classMap({ 'date-input-popup': true, open: this.open })}
            placement=${this.placement}
            distance=${this.distance}
            ?active=${this.open}
            flip
            shift
          >
            <div
              part="date-input input-wrapper"
              class="input-wrapper"
              slot="anchor"
              @pointerdown=${this.handleInputWrapperPointerDown}
            >
              <span part="start" class="start"><slot name="start"></slot></span>

              <div
                part="input"
                class="segments"
                role="group"
                aria-labelledby=${hasLabel ? 'label' : nothing}
                aria-label=${hasLabel ? nothing : this.term('date', 'Date')}
              >
                ${this.renderSegments()}
              </div>

              <span id=${this.keyboardHelpId} class="cs-visually-hidden">
                ${this.term(
                  'datePickerKeyboardHelp',
                  'Use arrow keys to change values; press Alt+Down Arrow to open the calendar.',
                )}
              </span>

              <input
                class="value-input"
                type="date"
                tabindex="-1"
                aria-hidden="true"
                .value=${this._value}
                min=${ifDefined(this.min || undefined)}
                max=${ifDefined(this.max || undefined)}
                ?disabled=${this.disabled}
                ?required=${this.required}
                autocomplete=${ifDefined(this.autocomplete || undefined)}
              />

              ${
                canClear
                  ? html`<button
                      part="clear-button"
                      type="button"
                      class="clear-button"
                      aria-label=${this.localize.term('clearEntry')}
                      tabindex="-1"
                      @mousedown=${this.handleClearMouseDown}
                      @click=${this.handleClearClick}
                    >
                      <slot name="clear-icon"><cs-icon name="cancel" library="system"></cs-icon></slot>
                    </button>`
                  : nothing
              }

              <span part="end" class="end"><slot name="end"></slot></span>

              <button
                part="expand-button"
                type="button"
                class="expand-button"
                aria-label=${this.term('chooseDate', 'Choose date')}
                aria-haspopup="dialog"
                aria-expanded=${this.open ? 'true' : 'false'}
                aria-controls=${this.popupId}
                ?disabled=${this.disabled}
                @click=${this.handleExpandButtonClick}
              >
                <span part="expand-icon" class="expand-icon">
                  <slot name="expand-icon"><cs-icon library="system" name="calendar_today"></cs-icon></slot>
                </span>
              </button>
            </div>

            <div
              id=${this.popupId}
              part="popup"
              class="popup-body"
              role="dialog"
              aria-modal="true"
              aria-label=${this.term('chooseDate', 'Choose date')}
              @keydown=${this.handlePopupKeyDown}
            >
              <cs-date-picker
                part="date-picker"
                exportparts="
                  date-picker:date-picker__date-picker,
                  header:date-picker__header,
                  title:date-picker__title,
                  navigation-button:date-picker__navigation-button,
                  navigation-button-previous:date-picker__navigation-button-previous,
                  navigation-button-next:date-picker__navigation-button-next,
                  grid:date-picker__grid,
                  weekday:date-picker__weekday,
                  day:date-picker__day,
                  day-selected:date-picker__day-selected,
                  day-today:date-picker__day-today,
                  day-disabled:date-picker__day-disabled
                "
                class="date-picker"
                lang=${ifDefined(this.lang || undefined)}
                dir=${ifDefined(this.dir || undefined)}
                .value=${this._value}
                min=${this.min}
                max=${this.max}
                disabled-dates=${this.disabledDates}
                disabled-days-of-week=${this.disabledDaysOfWeek}
                today=${this.today}
                first-day-of-week=${this.firstDayOfWeek}
                locale=${this.locale}
                size=${this.size}
                ?readonly=${this.readonly}
                @cs-change=${this.handleDatePickerChange}
              ></cs-date-picker>
            </div>
          </cs-popup>
        </div>

        <div
          id="hint"
          part="hint"
          class=${classMap({ 'has-slotted': hasHint })}
          aria-hidden=${hasHint ? 'false' : 'true'}
        >
          <slot name="hint">${this.hint}</slot>
        </div>
      </div>
    `;
  }

  private renderSegments(): TemplateResult[] {
    const active = this.segmentsController.getActiveSegment();
    // One segment is in the tab order: the one last focused, else the first.
    const tabStop = active?.field ?? this.layout.order[0];
    return this.layout.tokens.map((token) =>
      token.kind === 'literal'
        ? html`<span part="segment-literal" class="segment-literal" aria-hidden="true">${token.text}</span>`
        : this.renderSegment(token.field as DateField, token.field === tabStop),
    );
  }

  private renderSegment(field: DateField, isTabStop: boolean): TemplateResult {
    const value = this.segments[field];
    const buffer = this.segmentsController.getBuffer(GROUP, field);
    const { min, max } = dateSegmentBounds(field);
    // The same test as the `user-invalid` state, from its inputs: WebKit can read `internals.states` as empty after
    // hydration while the element still has its states.
    const userInvalid = !isServer && this.hasInteracted && !this.validity.valid;

    let valueText: string;
    if (buffer) {
      valueText = buffer;
    } else if (value === null) {
      valueText = this.term('empty', 'Empty');
    } else {
      valueText = field === 'month' ? formatMonthName(this.resolvedLocale, value) : String(value);
    }

    return html`<span
      part="segment"
      class=${classMap({ segment: true, empty: value === null && !buffer, [`segment-${field}`]: true })}
      data-group=${GROUP}
      data-segment=${field}
      role="spinbutton"
      tabindex=${this.disabled ? -1 : isTabStop ? 0 : -1}
      aria-label=${this.fieldLabel(field)}
      aria-valuemin=${min}
      aria-valuemax=${max}
      aria-valuenow=${ifDefined(value ?? undefined)}
      aria-valuetext=${valueText}
      aria-readonly=${this.readonly ? 'true' : 'false'}
      aria-disabled=${this.disabled ? 'true' : 'false'}
      aria-required=${this.required ? 'true' : 'false'}
      aria-invalid=${userInvalid ? 'true' : nothing}
      aria-describedby="hint ${this.keyboardHelpId}"
      @keydown=${this.handleSegmentKeyDown}
      @focus=${this.handleSegmentFocus}
      @blur=${this.handleSegmentBlur}
      >${formatDateSegmentText(field, value, buffer)}</span
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-date-input': CsDateInput;
  }
}
