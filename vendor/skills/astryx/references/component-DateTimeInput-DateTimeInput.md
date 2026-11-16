# Astryx component reference: DateTimeInput/DateTimeInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DateTimeInput/DateTimeInput.doc.mjs. Original SHA-256: ab1ec32757c1e62f8e3c5f5386d0f5f77a794b26dc774cb8e09e3429868f93d1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  group: 'DateInput',
  category: 'Form Controls',
  keywords: [
    'datetimepicker',
    'datetime',
    'datepicker',
    'timepicker',
    'calendar',
    'schedule',
    'event',
    'deadline',
    'timestamp',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text displayed below the label.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Show an "(optional)" indicator next to the label.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Mark the field as required.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disable the input and picker. The fields stay focusable and expose `aria-disabled`; typing and opening are blocked.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and describes the fields (activation stays blocked). Use this instead of wrapping a disabled DateTimeInput in Tooltip.',
    },
    {
      name: 'value',
      type: 'ISODateTimeString',
      description:
        'Selected datetime in ISO 8601 format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS).',
    },
    {
      name: 'onChange',
      type: '(value: ISODateTimeString | undefined) => void',
      description: 'Callback invoked when the selected datetime changes.',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(value: ISODateTimeString | undefined) => void | Promise<void>',
      description:
        'Async action fired after onChange. Drives optimistic UI updates via useTransition.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether the input is in a loading state. Disables interaction and shows a spinner.',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateTimeString',
      description:
        'Minimum selectable datetime. Constrains both date and time selection.',
    },
    {
      name: 'max',
      type: 'ISODateTimeString',
      description:
        'Maximum selectable datetime. Constrains both date and time selection.',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description:
        'Array of custom constraint functions that disable specific dates.',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description:
        "Include seconds in the time portion. Keeps Astryx's time field even when nativePicker selects native surfaces, because iOS has no seconds wheel.",
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "Hour display format. '12h' shows the locale's day period; '24h' uses 24-hour notation. When unset, follows the InternationalizationProvider locale's hour cycle (en-US 12-hour, en-GB 24-hour); a person's own preference rides on the locale tag (e.g. 'en-US-u-hc-h23').",
      default: "the locale's hour cycle",
    },
    {
      name: 'timeIncrement',
      type: '1 | 5 | 10 | 15 | 30',
      description:
        "Minute step for arrow keys in Astryx's typed time field. A non-default value keeps the Astryx time field in nativePicker modes because iOS treats native step as validation, not picker cadence. Ignored by the Astryx touch sheet, which uses wheels.",
      default: '1',
    },
    {
      name: 'timeOptionInterval',
      type: '5 | 10 | 15 | 30 | 60',
      description:
        "Minute cadence for the preset-time combobox on Astryx's fine-pointer time field. Setting it keeps that Astryx time field even in nativePicker modes because the OS picker has no equivalent preset list. The Astryx touch sheet uses wheels.",
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Shows a clear button when a datetime value is set.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown in the date portion when no date is selected. A caller placeholder replaces the calendar format hint.',
      default: "'Select a date'",
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        'The calendar the date segment reads and writes typed dates in, and the calendar its popover and bottom sheet show. value, onChange, min, and max stay Gregorian ISO datetimes. People type a date the way the locale writes it in this calendar, in any decimal digits; the field reports a date only once it is complete, and names a date the calendar does not have. Years are years of this calendar, so set min and max on Buddhist and Minguo calendar fields to catch a Gregorian year typed by mistake. Calendars other than gregory, iso8601, buddhist, roc, and japanese need Temporal, native or a polyfill the application loads; without it the field shows Gregorian dates. With a calendar other than gregory or iso8601, a presentation that would show native controls shows the popovers on a fine pointer and the bottom sheet on a coarse pointer, because the native date control is Gregorian; the Date panel of the bottom sheet shows the months, leap months, and era years of the calendar. A year in which the era changes is labeled with the era of the shown month, such as 平成31 in January 2019 and 令和元 in July.',
      default: "the InternationalizationProvider's calendar, else 'gregory'",
    },
    {
      name: 'timePlaceholder',
      type: 'string',
      description:
        'Placeholder text shown in the time portion when no time is selected. On touch, this appears in the closed time segment before a time is chosen.',
      default: "'Select a time'",
    },
    {
      name: 'timeLabel',
      type: 'string',
      description:
        'Accessible label for the time portion. Defaults to "{label} time" so it is tied to the field label and localizable.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of the input control.',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        'Status indicator object for error, warning, or success states with a message. For a date the field rejects, typed or picked in the native control, and for unreadable or unfinished text that Enter or blur keeps, the field shows its own error message instead; with onEntryErrorChange, an error status with a message shows in place of that message. A warning or success never replaces a rejection. A typed time the time segment rejects shows once it is complete, or at Enter or blur, and stays in the field; its own error message shows unless the date segment shows its message or an error status with a message shows in its place.',
    },
    {
      name: 'onEntryErrorChange',
      type: "(error: {kind: 'unreadable' | 'incomplete' | 'nonexistent' | 'outOfRange' | 'unavailable', text: string, date?: ISODateString} | null) => void",
      description:
        "Called each time the date segment's rejection of typed text changes, and with null when the rejection ends. kind is 'unreadable', 'incomplete' (part of a date that Enter or blur cannot finish), 'nonexistent' (a date the calendar does not have), 'outOfRange' (before the date of min or after the date of max), or 'unavailable' (a day dateConstraints rules out); text is the typed text; date is the Gregorian ISO date the text names, for 'outOfRange' and 'unavailable'. It also runs when a new min, max, dateConstraints, or value, a calendar pick, disabling the field, or Enter or blur changes the rejection, and never twice for the same rejection; it reports null when the typed field leaves while its rejection stands, as when a presentation or pointer change shows the native or touch picker. With it, an error status with a message replaces the field's own message, and a rejection that starts under an unchanged error message announces that message once. The native and touch pickers take no typed text, so it never reports a rejection there.",
    },
    {
      name: 'entryErrorBehavior',
      type: "'complete' | 'blur-or-enter'",
      description:
        "When both segments show their own entry errors: a typed date or time the field rejects. It sets when the error shows, not when validation runs, so it is not React Aria's validationBehavior (native versus ARIA validation), and it never changes a caller status. 'complete' shows a complete typed date the calendar does not have or that is out of range, a complete typed time outside the range, and a time the native control reports outside the range at once, and other rejected text at Enter or blur. 'blur-or-enter' holds every rejection until Enter or blur in its segment: the message, aria-invalid, the invalid styling, the announcement, and the date segment's onEntryErrorChange report then appear together. Under both values, an edit the field accepts or that empties the segment clears the error at once; under 'blur-or-enter', an edit that leaves the entry wrong keeps the shown error until the next Enter or blur. A date the native control refuses shows at Enter or blur under both values. The field's own value wins over the nearest FormLayout's defaultEntryErrorBehavior.",
      default:
        "the nearest FormLayout's defaultEntryErrorBehavior, else 'complete'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed via an info icon at the end of the label.',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        "Number of months displayed simultaneously in Astryx's pointer calendar popover. Ignored by native date controls and the mobile touch sheet, whose Date panel always shows one swipe-paged month at a time.",
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'First day of week in Astryx calendars. A number (0 = Sunday to 6 = Saturday) or a three-letter day name. Ignored by native date controls.',
      default: '0',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "Which surfaces draw the date and time pickers. 'adaptive-native' (the default) uses Astryx's typed fields and popovers on a fine pointer and browser/OS controls on a coarse pointer — with per-segment Astryx fallbacks: hasSeconds, non-default timeIncrement, or timeOptionInterval retain Astryx's time field because iOS cannot express them faithfully; 'native' always uses both browser/OS controls with no fallback; 'adaptive-bottom-sheet' uses popovers on a fine pointer and Astryx's coordinated bottom sheet on a coarse pointer; 'popover' and 'bottom-sheet' force that Astryx surface on every pointer. Every value opens pickers; typed-only fields are TimeInput's alone. Use a non-native presentation when numberOfMonths, weekStartsOn, or visible dateConstraints behavior matters. Constraints are enforced on commit; min/max are forwarded as hints. hourFormat formats the closed time, while the OS picker follows the user's locale. With a calendar other than gregory or iso8601, 'native' and 'adaptive-native' use the popovers on a fine pointer and the bottom sheet on a coarse pointer, and an explicit 'native' warns in development.",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "Deprecated: use presentation ('touch' = 'adaptive-native', 'always' = 'native', 'never' = 'adaptive-bottom-sheet'). Still works exactly as released; presentation wins when both are set. With a calendar other than gregory or iso8601, 'touch' and 'always' use the popovers on a fine pointer and the bottom sheet on a coarse pointer.",
      default: "'touch'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the Field box around the label, control, and status. containerClassName and containerStyle take a class name and inline styles for the same box. No effect (development warning) where no Field box renders: inside InputGroup (style the group) and in a horizontal-labels FormLayout.',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the visual control box: the row that holds the bordered date and time segments with their icons and end controls, never a native input. controlClassName and controlStyle take a class name and inline styles for the same box. Replaces root xstyle, className, and style, which this component does not accept.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {
        className: 'astryx-date-time-input-date-segment',
        visualProps: ['size', 'status'],
      },
      {
        className: 'astryx-date-time-input-time-segment',
        visualProps: ['size', 'status'],
      },
      {className: 'astryx-date-time-input-toggle-icon', states: ['state']},
      {className: 'astryx-date-time-input-clock-icon'},
      {className: 'astryx-date-time-input-time-listbox'},
      {className: 'astryx-date-time-input-time-option'},
    ],
  },
  usage: {
    description:
      'DateTimeInput combines date and time selection in one field. With presentation="adaptive-native" (the default), mouse/trackpad devices use Astryx typed fields and popovers, while coarse-pointer devices use browser/OS date and time controls in the same two-segment field. presentation="native" uses both native controls on every pointer; presentation="adaptive-bottom-sheet" keeps Astryx\'s own surfaces — pointer fields on fine pointers and the coordinated Date/Time bottom sheet on coarse pointers; "popover" and "bottom-sheet" force one Astryx surface on every pointer. The closed segments stay side by side when at least 400px is available and wrap into full-width rows below 400px, independent of viewport width. Use it for scheduling, event creation, deadline setting, or any form field that needs a specific datetime.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Base props such as ref, id, data-*, aria-*, and DOM event handlers go to the date input, the element that is focused and announced. A DOM handler runs after DateTimeInput's own handler for the same event and still receives events it handled (including ones it called preventDefault on), so it cannot cancel built-in behavior.",
      },
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what datetime is expected.',
      },
      {
        guidance: true,
        description:
          'Use min and max to restrict selectable datetimes to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Set min and max on a Buddhist or Minguo calendar field, so a Gregorian year typed by mistake shows an error instead of a date centuries away.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the datetime is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          "Leave hourFormat unset so the field follows the InternationalizationProvider locale's hour cycle (12-hour in en-US, 24-hour in en-GB or de-DE). Set it only when the field itself needs a fixed format, and carry a person's own 12/24-hour preference on the provider locale (e.g. 'en-US-u-hc-h23') rather than on each field.",
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a date is needed; use DateInput instead.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a time is needed; use TimeInput instead.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateTimeInput in Tooltip to explain why it is disabled. Use the disabledMessage prop instead, which ties the reason to the field.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          'Text above the input describing what datetime is expected.',
      },
      {
        name: 'Segment row',
        required: true,
        description:
          'The unbordered layout row that holds the two bordered segments and wraps them when its container is narrow.',
      },
      {
        name: 'Date input',
        required: true,
        description:
          'A typed date field with calendar popover on the fine-pointer Astryx surface, a real input type=date in native modes, or a read-only segment opening the Astryx touch sheet under presentation="adaptive-bottom-sheet" on a coarse pointer.',
      },
      {
        name: 'Calendar icon',
        required: true,
        description:
          'A button that opens the active date surface: the platform picker, Astryx calendar popover, or Astryx touch sheet.',
      },
      {
        name: 'Date picker',
        required: false,
        description:
          'The browser/OS picker in native modes, an Astryx month-grid popover on a fine pointer, or the Date panel of the Astryx bottom sheet on a coarse pointer with presentation="adaptive-bottom-sheet".',
      },
      {
        name: 'Time input',
        required: true,
        description:
          'A real input type=time for the default minute-precision native mode, a text/combobox time field when seconds, custom increments, or preset options are requested, or a read-only segment opening accessible time wheels under presentation="adaptive-bottom-sheet" on a coarse pointer.',
      },
      {
        name: 'Clock icon',
        required: true,
        description:
          'The time glyph shown as a leading identifier on the Astryx pointer field and as the picker affordance in native and touch-sheet time segments.',
      },
      {
        name: 'Time options popover',
        required: false,
        description:
          "A list of preset times at the timeOptionInterval cadence. Setting the prop retains Astryx's text/combobox time field even when nativePicker otherwise selects native controls; the Astryx touch sheet uses wheels instead.",
      },
      {
        name: 'Time option',
        required: false,
        description:
          'One selectable preset time in the optional time-options popover.',
      },
      {
        name: 'Clear button',
        required: false,
        description: 'A × button that resets the datetime value.',
      },
      {
        name: 'Status message',
        required: false,
        description: 'An error, warning, or success message below the inputs.',
      },
    ],
  },
}
```
