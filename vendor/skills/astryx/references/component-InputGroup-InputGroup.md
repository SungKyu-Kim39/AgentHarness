# Astryx component reference: InputGroup/InputGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/InputGroup/InputGroup.doc.mjs. Original SHA-256: 1cb28949befb362032acd86b342d1cb2631a93b078a0ee48be610d49070bfc95.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'InputGroup',
  displayName: 'Input Group',
  group: 'Field',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  keywords: [
    'inputgroup',
    'addon',
    'prefix',
    'suffix',
    'connected',
    'grouped',
    'input',
  ],
  theming: {
    targets: [
      {className: 'astryx-input-group', visualProps: ['size', 'status']},
      {className: 'astryx-input-group-text'},
    ],
  },
  description:
    'Groups an input with prefix and suffix addons in one connected row. A focused member stays above its neighbours, so its focus ring shows in full.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'InputGroupText, Button addons, and compatible input children: TextInput, NumberInput, TimeInput, DateInput, Typeahead, Tokenizer, Selector, or MultiSelector.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the group.',
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
      description: 'Helper text between label and input group.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disable the entire group.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Show the "Optional" indicator after the label.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Mark the field as required.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Default size for inputs in the group.',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        'Validation status. Its message shows below the group. The group border does not change; a theme can style the row from `data-status`.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text at the end of the label.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector.',
    },
  ],
  components: [{name: 'InputGroupText'}],
  usage: {
    description:
      'InputGroup connects an input with prefix/suffix addons in a single visual unit. Use it for URL fields, currency inputs, search fields with action buttons, or any input that needs contextual decorations.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use text addons to show units, prefixes, or suffixes that clarify the input format (e.g., "$", "kg", "https://").',
      },
      {
        guidance: true,
        description:
          'Use InputGroupText for static prefixes/suffixes like "$", "kg", or "https://".',
      },
      {
        guidance: true,
        description:
          'Use Button for an action attached to the input; InputGroup connects its corners automatically.',
      },
      {
        guidance: true,
        description:
          'Use InputGroup with compatible single-line inputs: TextInput, NumberInput, TimeInput, DateInput, Typeahead, Tokenizer, Selector, and MultiSelector.',
      },
      {
        guidance: true,
        description:
          "Keep each inner input's label specific; grouped inputs automatically combine the group label with their own label and inherit the group description/status context.",
      },
      {
        guidance: true,
        description:
          'Keep multi-value controls (Tokenizer, MultiSelector) short inside a group — the group is a fixed-height single-line surface, so cap or summarize selections instead of letting them fill the row.',
      },
      {
        guidance: false,
        description:
          "Don't put multiple text inputs in one group; use separate fields instead.",
      },
      {
        guidance: false,
        description:
          "Don't use InputGroup for unrelated inputs; it's for a single input with decorations.",
      },
      {
        guidance: false,
        description:
          "Don't use InputGroup with TextArea, Slider, Switch, CheckboxInput, or RadioList.",
      },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text above the group.'},
      {
        name: 'Prefix addon',
        required: false,
        description: 'Content before the input (text, icon, or button).',
      },
      {
        name: 'Input',
        required: true,
        description:
          'The main input element (TextInput, NumberInput, TimeInput, DateInput, Typeahead, Tokenizer, Selector, or MultiSelector).',
      },
      {
        name: 'Suffix addon',
        required: false,
        description: 'Content after the input (text, icon, or button).',
      },
      {
        name: 'Status message',
        required: false,
        description: 'An error, warning, or success message below the group.',
      },
    ],
  },
}
```
