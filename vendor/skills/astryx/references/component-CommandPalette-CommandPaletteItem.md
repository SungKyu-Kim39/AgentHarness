# Astryx component reference: CommandPalette/CommandPaletteItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CommandPalette/CommandPaletteItem.doc.mjs. Original SHA-256: 4435796b21638556265e244efde46ab2e118edf241c79699806733794cfaac7c.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CommandPaletteItem',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Item',
  isHiddenFromOverview: true,
  description:
    'One option in a command palette result list. CommandPalette context supplies selection, highlight, identity, and close behavior.',
  usage: {
    description:
      'Use CommandPaletteItem for one non-interactive result row inside CommandPaletteList or CommandPaletteGroup. CommandPalette owns the composite keyboard model; standalone items expose only their explicit visual state and pointer activation.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep each value unique within the result list so highlight, active-descendant identity, and selection resolve to the same item.',
      },
      {
        guidance: true,
        description:
          'Inside CommandPalette, each item is an option in the listbox popup of the WAI-ARIA combobox pattern: keyboard focus stays in the query field, arrow keys move the highlight through aria-activedescendant, and Enter selects the highlighted item.',
      },
      {
        guidance: false,
        description:
          'Nest buttons, links, or other interactive controls inside an item. Option semantics make descendants presentational, so use non-interactive content such as icons, descriptions, and shortcut hints, and activate the option itself.',
      },
      {
        guidance: false,
        description:
          'Treat isHighlighted as selection. Highlight is the active keyboard result; isSelected represents the chosen value.',
      },
    ],
    anatomy: [
      {
        name: 'Item',
        required: true,
        description:
          'The option root that carries selection, disabled, item identity, interaction, and theme state.',
      },
      {
        name: 'Content',
        required: true,
        description:
          'Caller-provided non-interactive label and supporting presentation.',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-command-palette-item',
        states: ['highlighted', 'selected', 'disabled'],
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        'Unique value used for item identity, highlight lookup, and selection.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Non-interactive item content such as a label, icon, description, or keyboard shortcut.',
      required: true,
    },
    {
      name: 'onSelect',
      type: '(value: string) => void',
      description:
        'Called after this item is activated by pointer. Keyboard selection in CommandPalette reports through CommandPalette onValueChange.',
    },
    {
      name: 'isHighlighted',
      type: 'boolean',
      description:
        'Whether this item is the active keyboard result. Derived from context when omitted inside CommandPalette.',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description:
        'Whether this item represents the selected value in picker mode. Derived from the CommandPalette value when omitted inside CommandPalette.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Whether the item is unavailable and suppresses pointer activation.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  playground: {
    defaults: {
      value: 'go-home',
      children: 'Go to Dashboard',
    },
  },
}
```
