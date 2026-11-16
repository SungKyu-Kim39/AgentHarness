# Astryx component reference: DateInput/DateInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DateInput/DateInput.doc.mjs. Original SHA-256: e32a360e6aa7781d0c93ea343ef695a8d0fae3c08ed1ff25714be515b2cd4c62.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DateInput',
  displayName: 'Date Input',
  group: 'DateInput',
  category: 'Form Controls',
  keywords: [
    'dateinput',
    'datepicker',
    'datefield',
    'calendar',
    'dateselect',
    'dateentry',
    'datechooser',
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
        'Disable the input and calendar. The field stays focusable and exposes `aria-disabled`; typing and opening are blocked.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus (activation stays blocked). Use this instead of wrapping a disabled DateInput in Tooltip.',
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: 'Selected date in YYYY-MM-DD format.',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description: 'Callback invoked when the selected date changes.',
    },
    {
      name: 'changeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description:
        'Async action fired after onChange. Drives optimistic UI updates via useTransition.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether the input is in a loading state. The field stays focusable and exposes `aria-busy` with a spinner; typing, picking, and clearing are blocked until loading ends.',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: 'Minimum selectable date (YYYY-MM-DD).',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: 'Maximum selectable date (YYYY-MM-DD).',
    },
    {
      name: 'dateConstraints',
      type: 'ReadonlyArray<(date: Date) => boolean>',
      description:
        'Array of custom constraint functions that disable specific dates.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown in the text input. A caller placeholder replaces the calendar format hint.',
      default: "'Select a date'",
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
        'Status indicator object for error, warning, or success states with a message. For a date the field rejects, typed or picked in the native control, and for unreadable or unfinished text that Enter or blur keeps, the field shows its own error message instead; with onEntryErrorChange, an error status with a message shows in place of that message. A warning or success never replaces a rejection.',
    },
    {
      name: 'onEntryErrorChange',
      type: "(error: {kind: 'unreadable' | 'incomplete' | 'nonexistent' | 'outOfRange' | 'unavailable', text: string, date?: ISODateString} | null) => void",
      description:
        "Called each time the field's rejection of typed text changes, and with null when the rejection ends. kind is 'unreadable', 'incomplete' (part of a date that Enter or blur cannot finish), 'nonexistent' (a date the calendar does not have), 'outOfRange' (before min or after max), or 'unavailable' (a day dateConstraints rules out); text is the typed text; date is the Gregorian ISO date the text names, for 'outOfRange' and 'unavailable'. It also runs when a new min, max, dateConstraints, or value, a calendar pick, disabling the field, or Enter or blur changes the rejection, and never twice for the same rejection; it reports null when the typed field leaves while its rejection stands, as when a presentation or pointer change shows the native or touch picker. With it, an error status with a message replaces the field's own message, and a rejection that starts under an unchanged error message announces that message once. The native and touch pickers take no typed text, so it never reports a rejection there.",
    },
    {
      name: 'entryErrorBehavior',
      type: "'complete' | 'blur-or-enter'",
      description:
        "When the field shows its own entry error: a typed date it rejects, as onEntryErrorChange reports it. It sets when the error shows, not when validation runs, so it is not React Aria's validationBehavior (native versus ARIA validation), and it never changes a caller status. 'complete' shows a date the calendar does not have, or one outside min, max, or dateConstraints, as soon as the typed date is complete, and unreadable or unfinished text at Enter or blur. 'blur-or-enter' holds every rejection until Enter or blur: the message, aria-invalid, the invalid styling, the announcement, and the onEntryErrorChange report then appear together. Under both values, an edit that makes the text a date or empties it clears the error at once; under 'blur-or-enter', an edit that leaves the text wrong keeps the shown error until the next Enter or blur. A date the native control refuses shows at Enter or blur under both values. The field's own value wins over the nearest FormLayout's defaultEntryErrorBehavior.",
      default:
        "the nearest FormLayout's defaultEntryErrorBehavior, else 'complete'",
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        'How the status message is placed relative to the input. attached overlaps directly below the input (bordered treatment); detached floats below as a separate element with spacing; tooltip hides the message box and surfaces it in a tooltip on the status icon.',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed via an info icon at the end of the label.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear (\u00d7) button when a date value is set. Clicking it clears the value and returns focus to the input.',
      default: 'false',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        'Number of months displayed simultaneously in the calendar popover.',
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'First day of week in Astryx calendar surfaces. A number (0 = Sunday to 6 = Saturday) or a three-letter day name; native pickers remain browser/OS-owned.',
      default: '0',
    },
    {
      name: 'format',
      type: "'date' | 'date_long' | 'date_weekday' | 'system_date' | ((value: ISODateString) => string)",
      description:
        "How the committed date value is displayed. Named values are reused from Timestamp's format vocabulary: 'date' shows 'Mar 21, 2026', 'date_long' shows 'March 21, 2026', 'date_weekday' shows 'Wed, Mar 21, 2026', 'system_date' shows '2026-03-21'. 'date', 'date_long', and 'date_weekday' write the date in the field's calendar; 'system_date' stays the Gregorian ISO date. A function receives the ISO value and returns a custom string; the field cannot re-commit text it cannot read back. Applies only to the committed value, never to text being typed.",
      default: "'date_long'",
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        'The calendar the text field reads and writes dates in, and the calendar its popover and bottom sheet show. value, onChange, min, and max stay Gregorian ISO dates. People type a date the way the locale writes it in this calendar, in any decimal digits; the field reports a date only once it is complete, and names a date the calendar does not have. Years are years of this calendar: a Buddhist field reads 2026 as Buddhist year 2026, so set min and max on Buddhist and Minguo calendar fields to catch a Gregorian year typed by mistake. Calendars other than gregory, iso8601, buddhist, roc, and japanese need Temporal, native or a polyfill the application loads; without it the field shows Gregorian dates. With a calendar other than gregory or iso8601, a presentation that would show the native date control shows the popover on a fine pointer and the bottom sheet on a coarse pointer, because the native control is Gregorian; the bottom sheet shows the months, leap months, and era years of the calendar. A year in which the era changes is labeled with the era of the shown month, such as 平成31 in January 2019 and 令和元 in July.',
      default: "the InternationalizationProvider's calendar, else 'gregory'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "Which surface draws the date picker. 'adaptive-native' (the default) uses Astryx's calendar popover on a fine pointer and the browser/OS picker (input type=date) on a coarse pointer, keeping Astryx fallbacks where a native control cannot express the value; 'native' always uses the browser/OS picker with no fallback; 'adaptive-bottom-sheet' uses the popover on a fine pointer and Astryx's bottom-sheet picker on a coarse pointer; 'popover' and 'bottom-sheet' force that Astryx surface on every pointer. Every value opens a picker; a typed-only field is TimeInput's alone. Use a non-native presentation for a field that needs weekStartsOn, numberOfMonths or dateConstraints, none of which a native picker can express. With a calendar other than gregory or iso8601, 'native' and 'adaptive-native' use the popover on a fine pointer and the bottom sheet on a coarse pointer, and an explicit 'native' warns in development.",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "Deprecated: use presentation ('touch' = 'adaptive-native', 'always' = 'native', 'never' = 'adaptive-bottom-sheet'). Still works exactly as released; presentation wins when both are set. With a calendar other than gregory or iso8601, 'touch' and 'always' use the popover on a fine pointer and the bottom sheet on a coarse pointer.",
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
      name: 'containerClassName',
      type: 'string',
      description:
        'Class name for the Field box. Same targeting as containerXstyle.',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        'Inline styles for the Field box. Same targeting as containerXstyle.',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the visual control box: the bordered element that holds the text, icons, and end controls, never the native input. controlClassName and controlStyle take a class name and inline styles for the same box. Replaces root xstyle, className, and style, which this component does not accept.',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description:
        'Class name for the visual control box. Same targeting as controlXstyle.',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description:
        'Inline styles for the visual control box. Same targeting as controlXstyle.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {className: 'astryx-date-input-toggle-icon', states: ['state']},
    ],
  },
  usage: {
    description:
      'DateInput lets the user type or pick a date from a calendar popover. Use it for scheduling, deadlines, booking dates, or any form field that needs a specific calendar date.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Base props such as ref, id, data-*, aria-*, and DOM event handlers go to the date input, the element that is focused and announced. A DOM handler runs after DateInput's own handler for the same event and still receives events it handled (including ones it called preventDefault on), so it cannot cancel built-in behavior.",
      },
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what date is expected.',
      },
      {
        guidance: true,
        description:
          'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Set min and max on a Buddhist or Minguo calendar field, so a Gregorian year typed by mistake shows an error instead of a date centuries away.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the date is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          'Show a loading state with changeAction when the date triggers a server-side save.',
      },
      {
        guidance: true,
        description:
          'On a fine pointer the field follows the WAI-ARIA combobox pattern with a dialog popup, as in the APG date picker combobox: ArrowDown or Alt+ArrowDown opens the calendar, and Escape closes it and returns focus to the field.',
      },
      {
        guidance: true,
        description:
          'Use DateInput inside InputGroup when adding a short static prefix or suffix, such as a due-date hint.',
      },
      {
        guidance: false,
        description:
          'Use a DateInput for free-form text that does not represent a calendar date.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Rely on the calendar alone; the text input lets users type dates directly, which is faster for known dates.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateInput in Tooltip to explain why it is disabled. Use the disabledMessage prop instead, which ties the reason to the field.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: 'Text above the input describing what date is expected.',
      },
      {
        name: 'Text input',
        required: true,
        description:
          "A field where the user can type a date directly, written the way the locale writes it in the field's calendar.",
      },
      {
        name: 'Calendar icon',
        required: true,
        description:
          'A button that opens the calendar popover for visual date picking.',
      },
      {
        name: 'Calendar popover',
        required: false,
        description:
          'A month grid that appears when the icon or the input is clicked, or when ArrowDown is pressed in the input.',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          'A × button that resets the date value. Shown when hasClear is true and a date is set.',
      },
      {
        name: 'Status message',
        required: false,
        description: 'An error, warning, or success message below the input.',
      },
    ],
  },
}
```
