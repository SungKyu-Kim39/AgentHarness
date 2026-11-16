# Astryx component reference: CommandPalette/CommandPaletteInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CommandPalette/CommandPaletteInput.doc.mjs. Original SHA-256: a48b347b05157c842fd2c7c28f3e208b81f03824c689e3738876857121d7f237.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CommandPaletteInput',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Input',
  isHiddenFromOverview: true,
  description:
    'Search input slot. Auto-focuses on mount. Wires to command palette context when used inside CommandPalette.',
  usage: {
    description:
      'Use CommandPaletteInput inside CommandPalette for a popup-backed command query, or as an independent search field when no result popup is present.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a concise label that identifies what can be searched when "Search commands" does not describe it; the placeholder is never the field\'s name.',
      },
      {
        guidance: true,
        description:
          'Use endContent for short supporting controls or shortcut hints at the trailing edge.',
      },
      {
        guidance: false,
        description:
          'Override combobox role or popup state. CommandPaletteInput owns those semantics when connected to CommandPalette.',
      },
    ],
    anatomy: [
      {
        name: 'Input',
        required: true,
        description:
          'The surrounding inline layout for the search glyph, query field, and trailing content.',
      },
      {
        name: 'Search glyph',
        required: true,
        description: 'A decorative search icon before the query field.',
      },
      {
        name: 'Query field',
        required: true,
        description:
          'The native text field. It is a searchbox when standalone without popup attributes and a combobox when popup relationships are supplied or CommandPalette context is present.',
      },
      {
        name: 'Loading spinner',
        required: false,
        description:
          'A delayed pending indicator shown before trailing content while search is busy.',
      },
      {
        name: 'Trailing content',
        required: false,
        description:
          'Caller-provided supporting content such as a clear control or shortcut hint.',
      },
    ],
  },
  theming: {
    targets: [{className: 'astryx-command-palette-input'}],
  },
  props: [
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text for the input.',
      default: "'Search…'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the query field, announced by screen readers. Defaults to the translated "Search commands"; the placeholder is never used as the name.',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description:
        'Auto-focus the input when mounted. Automatically disabled when inside an inline command palette.',
      default: 'true',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered at the trailing end of the input, after the spinner. Use for clear buttons or keyboard shortcut hints.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Search value. When omitted inside CommandPalette, reads from context.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description:
        'Called when search value changes. When omitted inside CommandPalette, writes to context.',
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
      placeholder: 'Search commands, files, or actions...',
      hasAutoFocus: false,
    },
  },
}
```
