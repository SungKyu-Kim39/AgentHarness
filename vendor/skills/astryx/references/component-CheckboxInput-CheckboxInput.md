# Astryx component reference: CheckboxInput/CheckboxInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CheckboxInput/CheckboxInput.doc.mjs. Original SHA-256: 65a2357215cc25473c74b41092825eac949a6431925f45ac4bff7a40fba25437.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CheckboxInput',
  playground: {
    defaults: {label: 'Add to calendar', value: true},
  },
  displayName: 'Checkbox Input',
  group: 'Checkbox',
  category: 'Form Controls',
  keywords: [
    'checkbox',
    'check',
    'toggle',
    'tick',
    'indeterminate',
    'boolean',
    'tristate',
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: 'Ref forwarded to the underlying <input> element.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the checkbox (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Whether to visually hide the label (still accessible to screen readers).',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed below the label.',
    },
    {
      name: 'value',
      type: "boolean | 'indeterminate'",
      description:
        'Whether the checkbox is checked, unchecked, or indeterminate.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox state changes.',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action on change. Fires after onChange if not prevented. Shows loading spinner while pending.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether the checkbox is in a loading state. Shows spinner and prevents interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the checkbox is disabled.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'The HTML name attribute for the underlying checkbox input, useful for form submissions (submits "on" when checked).',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the checkbox is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkbox focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxInput in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        'Whether the checkbox is read-only. Displays the current state at full opacity but prevents interaction. Unlike `isDisabled`, read-only checkboxes are not visually dimmed.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Whether the field is optional. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Whether the checkbox is required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description:
        'The size of the checkbox. sm for compact layouts, md for default. Under a coarse pointer a labelled checkbox’s target grows toward 44 px through an invisible hit area. It never shrinks below the row and stops at half the gap to a closer neighbour; nothing changes size.',
      default: "'md'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox loses focus.',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description:
        'Semantic icon name or custom content displayed before the label text. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description:
        'Status indicator. Displays a colored message box below the checkbox and sets aria-invalid for errors.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-checkbox-input', visualProps: ['size']},
      {
        className: 'astryx-checkbox-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-checkbox-label'},
    ],
    vars: [
      {
        name: '--_indicator-press-image',
        description:
          "The row's press image, handed down to a first-party indicator that paints its own press. Set from the press paint only while the row itself is pressed, or, under a CheckboxList row that owns the press, from that row's press paint. Only this row declares it.",
        default: 'none',
        private: true,
      },
      {
        name: '--_indicator-active-press',
        description:
          "Transparent while the press controller paints the row's press, and always under a CheckboxList row that owns the press, so a first-party indicator that paints its own press draws no `:active` fill under the press image. Only this row declares it.",
        default: 'var(--color-overlay-pressed)',
        private: true,
      },
    ],
  },
  usage: {
    accessibility: [
      {
        name: 'Checkbox box',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Rest', 'Hover', 'Pointer down', 'Checked'],
        description:
          'The box edge (unchecked) and fill (checked) must have at least 3:1 contrast with the surface behind them. For Hover and Pointer down, measure the final colors after the tint and the pressed overlay are applied.',
      },
    ],
    description:
      'CheckboxInput toggles a single on/off value. Use it for settings like "Enable notifications", terms acceptance, or opt-in choices. For multiple checkboxes in a group, use CheckboxList instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a visible label so the user knows what they are toggling. Use isLabelHidden only when surrounding context makes it obvious.',
      },
      {
        guidance: true,
        description:
          'Add a description for choices that need extra context, like explaining what "Share usage data" actually shares.',
      },
      {
        guidance: true,
        description:
          'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.',
      },
      {
        guidance: false,
        description:
          'Use a checkbox for mutually exclusive choices; use RadioList when only one option can be selected.',
      },
      {
        guidance: false,
        description:
          'Use a checkbox for actions that take effect immediately; use a toggle switch or button instead.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled checkbox in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Checkbox',
        required: true,
        description:
          'The check box itself: unchecked, checked, or indeterminate.',
      },
      {
        name: 'Label',
        required: true,
        description:
          'Text describing what the checkbox controls. Always present for accessibility.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Helper text below the label with additional context.',
      },
      {
        name: 'Status message',
        required: false,
        description:
          'An error, warning, or success message below the checkbox.',
      },
    ],
  },
}
```
