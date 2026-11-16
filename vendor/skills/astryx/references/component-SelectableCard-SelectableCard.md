# Astryx component reference: SelectableCard/SelectableCard.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SelectableCard/SelectableCard.doc.mjs. Original SHA-256: a0afa4fcc5492409ed6caa818bc6d0b4a7ac58ee4a2574fe2a4b8d2a876b2d70.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SelectableCard',
  displayName: 'Selectable Card',
  group: 'Card',
  category: 'Container',
  keywords: ['card', 'selectable', 'toggle', 'checkbox', 'radio', 'selection'],
  usage: {
    description: 'A card that toggles between selected and unselected states with an accent border. For navigation use ClickableCard.',
    bestPractices: [
      {guidance: true, description: 'Use for multi-select choices: filter chips, feature add-ons, or option grids where several can be on.'},
      {guidance: true, description: 'Use for multi-select groups; track the selected IDs in a Set.'},
      {guidance: true, description: 'When focused, toggle selection with Space or Enter.'},
      {guidance: false, description: 'Use for navigation; use ClickableCard for that.'},
      {guidance: false, description: 'Use for a single-select group: each card is a checkbox, so assistive technology announces a multi-select group with one tab stop per card.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'Interactive div with accent border on selection.'},
      {name: 'Content', required: true, description: 'Children rendered inside the card.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label.', required: true},
    {name: 'isSelected', type: 'boolean', description: 'Controlled selection state.', required: true},
    {name: 'onChange', type: '(isSelected: boolean) => void', description: 'Called when toggled.', required: true},
    {name: 'isDisabled', type: 'boolean', description: 'Disables the card.', default: 'false'},
    {name: 'children', type: 'ReactNode', description: 'Card content.'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Inner padding.', default: '4'},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: 'Background color variant.', default: "'default'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: 'Resting shadow depth. The selection ring composes on top, so a selected card keeps its shadow.', default: "'none'"},
    {name: 'width', type: 'SizeValue', description: 'Card width.'},
    {name: 'height', type: 'SizeValue', description: 'Card height.'},
    {name: 'maxWidth', type: 'SizeValue', description: 'Maximum card width.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.'},
  ],
  theming: {
    container: true,
    targets: [{className: 'astryx-selectable-card', visualProps: ['selected', 'variant']}],
    vars: [
      {name: '--selectable-card-ring-color', description: 'Colour of the selection ring drawn for a variant a theme added. The built-in variants each ring in their own border token and ignore this; a theme that adds a variant sets it in the same rule as that variant\'s `backgroundColor`, because no token the component could pick is guaranteed to contrast with a fill it cannot know.', default: 'var(--color-accent)'},
      {name: '--_press-overlay', description: 'Colour of the ::after interaction overlay for the hover and mouse states: transparent at rest, the hover overlay token on hover (hover-capable pointers), the pressed overlay token while a mouse holds `:active`. A press the touch press controller paints (`data-astryx-press`) is the overlay\'s image instead, at the press\'s strength, and the colour yields to it. Set on the card element by its own interaction arms.', default: 'transparent', private: true},
    ],
  },
  playground: {
    defaults: {
      label: 'Pro plan',
      isSelected: true,
      padding: 4,
      children: {
        __element: 'XDSVStack',
        props: {gap: 1},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Pro plan'},
          {__element: 'XDSText', props: {type: 'body'}, children: '$29/month, unlimited projects and priority support.'},
        ],
      },
    },
  },
}
```
