# Astryx component reference: TimeInput/TimeInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TimeInput/TimeInput.doc.mjs. Original SHA-256: f4f02458f39907f6e31b3c526deec8c218c32f7a2496ad1cca5e3733343897b5.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TimeInput',
  displayName: 'Time Input',
  category: 'Form Controls',
  keywords: [
    'timeinput',
    'timepicker',
    'time',
    'clock',
    'hour',
    'minute',
    'ampm',
    'timeselect',
    'timefield',
    'schedule',
  ],

  usage: {
    description:
      "TimeInput uses a browser/OS time picker on coarse pointers by default and Astryx's typed field on fine pointers. It converts values to a standard format and supports arrow-key adjustment on the typed surface. Use it in forms, scheduling flows, or any interface where users need to select a specific time.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Base props such as ref, id, data-*, aria-*, and DOM event handlers go to the time input, the element that is focused and announced. A DOM handler runs after TimeInput's own handler for the same event and still receives events it handled (including ones it called preventDefault on), so it cannot cancel built-in behavior.",
      },
      {
        guidance: true,
        description:
          "Leave hourFormat unset so the field follows the InternationalizationProvider locale's hour cycle (12-hour in en-US, 24-hour in en-GB or de-DE). Set it only when the field itself needs a fixed format, and carry a person's own 12/24-hour preference on the provider locale (e.g. 'en-US-u-hc-h23') rather than on each field.",
      },
      {
        guidance: true,
        description:
          'Set min and max constraints when the context has a valid range, like business hours or event windows, so users cannot submit an out-of-bounds time.',
      },
      {
        guidance: true,
        description:
          'Provide a description or placeholder that hints at the expected format or purpose, like "Business hours: 9 AM \u2013 5 PM".',
      },
      {
        guidance: true,
        description:
          'Use the status prop to surface validation errors inline: show a message like "Time must be during business hours" so users know exactly what to fix.',
      },
      {
        guidance: true,
        description:
          'Enable hasClear when the field is optional, so users can remove a previously selected time.',
      },
      {
        guidance: true,
        description:
          'Place TimeInput inside InputGroup when the time needs a single-line prefix or suffix addon, like a start/end label or timezone marker.',
      },
      {
        guidance: false,
        description:
          "Don't use TimeInput for combined date-and-time selection; pair it with a separate DateInput instead.",
      },
      {
        guidance: false,
        description:
          "Don't hide the label; even when space is tight, keep the label visible or provide a description so the purpose is clear.",
      },
      {
        guidance: false,
        description:
          'Wrap a disabled TimeInput in Tooltip to explain why it is disabled. Use the disabledMessage prop instead, which ties the reason to the field.',
      },
    ],
    anatomy: [
      {
        name: 'Clock icon',
        required: false,
        description:
          'A leading clock icon that identifies the field and opens the browser/OS picker in native mode.',
      },
      {
        name: 'Time control',
        required: true,
        description:
          'A real input type=time in native modes, or Astryx\'s editable text field for fine pointers, presentation="text-input", seconds, and custom increments.',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          'A trailing button to reset the value, shown when hasClear is true and a value is set.',
      },
      {
        name: 'Status icon',
        required: false,
        description:
          'A trailing icon indicating error, warning, or success state.',
      },
      {
        name: 'Spinner',
        required: false,
        description:
          'Replaces trailing content during loading to show an async action is in progress.',
      },
    ],
  },

  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the input (required for accessibility).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Shows an "(optional)" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Marks the field as required and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input and suppresses interactions. The input stays focusable and exposes `aria-disabled`.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and describes the input (activation stays blocked). Use this instead of wrapping a disabled TimeInput in Tooltip.',
    },
    {
      name: 'value',
      type: 'ISOTimeString',
      description: 'Controlled time value in ISO format (HH:MM or HH:MM:SS).',
    },
    {
      name: 'onChange',
      type: '(value: ISOTimeString | undefined) => void',
      description:
        'Callback fired when the time changes. Receives undefined when the input is cleared.',
    },
    {
      name: 'changeAction',
      type: '(value: ISOTimeString | undefined) => void | Promise<void>',
      description:
        'Async action fired after onChange. Wrapped in a React transition to provide optimistic UI; triggers the loading spinner while pending.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Puts the input into a loading state, displaying a spinner.',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISOTimeString',
      description:
        'Minimum selectable time in ISO format. Values outside the range are rejected.',
    },
    {
      name: 'max',
      type: 'ISOTimeString',
      description:
        'Maximum selectable time in ISO format. Values outside the range are rejected.',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: 'Includes seconds in the time display and parsing.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear button when a value is set and the input is not disabled.',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "Controls the display format. '12h' shows the locale's day period (e.g. '2:30 PM', '오후 2:30'); '24h' uses 24-hour notation (e.g. '14:30'). When unset, follows the InternationalizationProvider locale's hour cycle: en-US reads 12-hour, en-GB and de-DE read 24-hour. To honor a person's own preference, pass it on the locale tag (e.g. 'en-US-u-hc-h23') rather than per field.",
      default: "the locale's hour cycle",
    },
    {
      name: 'increment',
      type: 'number',
      description:
        'Number of minutes to add or subtract when the user presses the up or down arrow key. Steps are whole minutes; a fractional value leaves the time unchanged.',
      default: '1',
    },
    {
      name: 'presentation',
      type: "'text-input' | 'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "Which surface selects the time. 'adaptive-native' (the default) uses Astryx's typed field on a fine pointer and the browser/OS input type=time on a coarse pointer — except hasSeconds or increment other than 1, which retain the typed field because iOS has no seconds wheel and treats step as validation rather than picker cadence; 'native' always uses the browser/OS control with no Astryx fallback; 'adaptive-bottom-sheet' uses the typed field on a fine pointer and Astryx's bottom-sheet time wheels on a coarse pointer; 'bottom-sheet' forces the wheels on every pointer; 'text-input' (like 'popover', which has no distinct TimeInput surface) keeps only the typed field. Native mode forwards min/max and enforces them on commit. hourFormat formats the closed value; the open OS picker follows the device locale.",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "Deprecated: use presentation ('touch' = 'adaptive-native', 'always' = 'native', 'never' = 'text-input'). Still works exactly as released; presentation wins when both are set.",
      default: "'touch'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown when no time is selected. When the input is focused and empty, a format hint overrides this text.',
      default: "'Select a time'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Controls the height of the input element.',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        "Status indicator that colors the border and displays an icon. When a message is provided it is rendered below the input. A typed time the field rejects, and a native edit outside min or max, show the field's own error message instead; an error status with a message shows in its place, and the rejection is still announced. A warning or success never replaces a rejection.",
    },
    {
      name: 'onEntryErrorChange',
      type: "(error: {kind: 'unreadable' | 'outOfRange', text: string, value?: ISOTimeString} | null) => void",
      description:
        "Called each time the field's rejection of typed text changes, and with null when the rejection ends. kind is 'unreadable' (text that is not a time) or 'outOfRange' (a time before min or after max); text is the typed text; value is the ISO time the text names, for 'outOfRange'. Under entryErrorBehavior 'complete', a rejection shows once the typed time is complete (in 12-hour text, with its day period unless the hour reads 0 or 13–23), or at Enter or blur; under 'blur-or-enter', only at Enter or blur. Rejected text stays in the field. It also runs when a new min, max, or value, or disabling the field, changes the rejection, never twice for the same rejection, and with null when the field unmounts while a rejection stands. The native and bottom-sheet surfaces take no typed text, so they never report.",
    },
    {
      name: 'entryErrorBehavior',
      type: "'complete' | 'blur-or-enter'",
      description:
        "When the field shows its own entry error: a typed time it rejects, as onEntryErrorChange reports it, or a native edit outside min or max. It sets when the error shows, not when validation runs, so it is not React Aria's validationBehavior (native versus ARIA validation), and it never changes a caller status. 'complete' shows a complete typed time outside min or max, and a native edit outside them, at once, and other rejected text at Enter or blur. 'blur-or-enter' holds every rejection until Enter or blur: the message, aria-invalid, the invalid styling, the announcement, and the onEntryErrorChange report then appear together. Under both values, an edit the field accepts or empties clears the error at once; under 'blur-or-enter', an edit that leaves the entry wrong keeps the shown error until the next Enter or blur. The field's own value wins over the nearest FormLayout's defaultEntryErrorBehavior.",
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
        'Tooltip text rendered as an info icon at the end of the label row.',
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
        'StyleX styles for the visual control box: the bordered element that holds the text, icons, and end controls, never the native input. controlClassName and controlStyle take a class name and inline styles for the same box. Replaces root xstyle, className, and style, which this component does not accept.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
    ],
  },
}
```
