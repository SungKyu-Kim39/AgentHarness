# Astryx component reference: NumberInput/NumberInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/NumberInput/NumberInput.doc.mjs. Original SHA-256: 9da5cbe72eaaacd821527343ca75477a59d0d106f12aac9dbc6b888b996b431c.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'NumberInput',
  playground: {
    defaults: {label: 'Count', value: 3},
  },
  displayName: 'Number Input',
  category: 'Form Controls',
  keywords: [
    'numberinput',
    'numberfield',
    'stepper',
    'spinner',
    'counter',
    'increment',
    'decrement',
    'quantity',
    'numberpicker',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'number | null | undefined',
      description: 'Current value of the input.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        'Callback fired when a valid text edit commits on blur or Enter, or when a step or clear control changes the value.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant.',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers).',
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
        'Whether the field is optional (mutually exclusive with isRequired).',
    },
    {
      name: 'onKeyDown',
      type: '(e: KeyboardEvent<HTMLInputElement>) => void',
      description: 'Callback fired on keydown events on the input.',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Whether the field is required (mutually exclusive with isOptional).',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        'Makes the input read-only: the value is shown at full opacity and still submits with the form, but cannot be edited. Unlike isDisabled, a read-only input is not dimmed and keeps its form value. Stepping is off in every form while read-only: arrow keys, the wheel, and the number steppers. isDisabled takes precedence when both are set.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled NumberInput in Tooltip.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text to display in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description:
        'Icon to display at the start of the input. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description:
        'Icon to display before the label text. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        'Validation status with optional message. Typing never shows a rejection: a typed number is complete only at commit. When Enter or blur meets text that is not a number, a fraction in an integer-only field, or any number while min is above max, the text stays in the field and the field shows its own error message in place of status. An error status with a message shows instead of that message, and the rejection is still announced and marks the field invalid. A warning or success status, or an error status without a message, never replaces it. A number outside an ordinary range clamps instead.',
    },
    {
      name: 'onEntryErrorChange',
      type: "(error: {kind: 'unreadable' | 'fractional' | 'outOfRange', text: string, value?: number} | null) => void",
      description:
        "Called each time the field's rejection of typed text changes, and with null when the rejection ends. A rejection starts only at Enter or blur. kind is 'unreadable' (text that is not a number), 'fractional' (a fraction when isIntegerOnly), or 'outOfRange' (any number while min is above max); text is the typed text; value is the number it names, for 'fractional' and 'outOfRange'. It also runs when an edit makes the text valid or empty, when a new value, min, max, or isIntegerOnly changes or ends the rejection, and when disabling the field drops the text, and never twice for the same rejection; it reports null when the field unmounts while a rejection stands. Pass an error status with a message to word the rejection yourself.",
    },
    {
      name: 'entryErrorBehavior',
      type: "'complete' | 'blur-or-enter'",
      description:
        "When the field shows its own entry error: typed text it rejects, as onEntryErrorChange reports it. It sets when the error shows, not when validation runs, so it is not React Aria's validationBehavior (native versus ARIA validation), and it never changes a caller status. A typed number is complete only at Enter or blur, so 'complete' and 'blur-or-enter' behave the same: the message, aria-invalid, the invalid styling, the announcement, and the onEntryErrorChange report appear together at Enter or blur, never while a person types, and an edit that makes the text valid or empty clears the error at once. Set it to match the other fields of a form; the field's own value wins over the nearest FormLayout's defaultEntryErrorBehavior.",
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
      name: 'min',
      type: 'number | null',
      description:
        'Minimum value allowed. A smaller entry commits at this value on blur or Enter.',
    },
    {
      name: 'max',
      type: 'number | null',
      description:
        'Maximum value allowed. A larger entry commits at this value on blur or Enter.',
    },
    {
      name: 'step',
      type: 'number | null',
      description: 'Step increment for the input.',
      default: '1',
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        'Formats the committed value while the input is not focused. The raw numeric value is shown on focus for editing and the formatted value is exposed through aria-valuetext.',
    },
    {
      name: 'isWheelEnabled',
      type: 'boolean',
      description:
        'Whether scrolling the wheel over the focused input steps the value. Disable this when page scrolling should always take priority.',
      default: 'true',
    },
    {
      name: 'hasNumberSteppers',
      type: 'boolean',
      description:
        'Shows increment and decrement buttons at the end of the input on fine pointers. Hidden on coarse pointers (such as touch screens); text entry and keyboard stepping remain available. Holding a button with a mouse or a pen repeats the step and commits once, when the hold ends.',
      default: 'false',
    },
    {
      name: 'units',
      type: 'string | null',
      description:
        'Units text to display at the end of the input (e.g., "%" or "GB").',
    },
    {
      name: 'isIntegerOnly',
      type: 'boolean',
      description: 'Only allow integer values (no floating point).',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear (\u00d7) button when the input has a value. When true, the onChange callback also accepts null to signal the user cleared the input.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'HTML name attribute for form submissions. While blur keeps rejected text, the form posts the committed number, until the person edits the text or a new value replaces it.',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: 'HTML autocomplete attribute.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Whether to focus the input on mount.',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input loses focus.',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: 'Callback fired when the user presses the Enter key.',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the field container (label, control, and status together). No effect inside InputGroup (style the InputGroup instead) or in a `horizontal-labels` FormLayout. Root `xstyle`, `className`, and `style` are not accepted.',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        'Class name for the field container. Same targeting as `containerXstyle`.',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        'Inline styles for the field container. Same targeting as `containerXstyle`.',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the visual control box: the element that paints the border and background and holds icons and end controls. Never the native input.',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: 'Class name for the visual control box.',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: 'Inline styles for the visual control box.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-number-input',
        visualProps: ['size', 'status'],
        states: ['disabled', 'readonly'],
      },
    ],
    derived: [
      // `padding` in any spelling — the shorthand, `paddingBlock`, or a lone
      // `paddingBlockStart` — is parsed by the shared container expansion and
      // emitted as normalized per-side `--astryx-number-input-padding-*`
      // tokens. The wrapper and the number-stepper column both read those, so
      // the column stays flush with the field edges under a themed padding.
      {property: 'padding', expand: 'container'},
      // Scoped to this component's own subtree: the stepper column's outer
      // corners follow the field radius, so a themed `number-input`
      // borderRadius has to reach the var the column reads, not just the
      // wrapper's own `border-radius`.
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  usage: {
    description:
      'A form input for numeric values with built-in validation, min/max constraints, and step controls. Use NumberInput for quantities, measurements, percentages, and similar inputs.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Let people paste formatted numbers: a pasted 1,234,234,234 is read under the field's locale and commits as 1234234234 on blur. Typing is never intercepted.",
      },
      {
        guidance: true,
        description:
          'Set min, max, and step to guide users toward valid values.',
      },
      {
        guidance: true,
        description:
          'Show units (e.g. "%" or "GB") so users know what the number represents.',
      },
      {
        guidance: true,
        description:
          'Set isWheelEnabled={false} when the input appears in a scrolling surface where wheel gestures should always scroll the page.',
      },
      {
        guidance: false,
        description:
          'Use NumberInput for free-form text that happens to contain numbers; use TextInput instead.',
      },
      {
        guidance: false,
        description: 'Set both isOptional and isRequired on the same field.',
      },
      {
        guidance: false,
        description:
          "Wrap a disabled NumberInput in Tooltip to explain why it's disabled. Use the disabledMessage prop, which attaches the reason to the field itself.",
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: 'The label for the number input.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Additional description text below the label.',
      },
      {
        name: 'Icon',
        required: false,
        description: 'An optional icon within the input.',
      },
      {
        name: 'Placeholder',
        required: false,
        description: 'Placeholder text shown when the input is empty.',
      },
      {
        name: 'Number steppers',
        required: false,
        description:
          'Optional buttons that increment or decrement by the configured step.',
      },
    ],
  },
}
```
