# Astryx component reference: CommandPalette/CommandPaletteFooter.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CommandPalette/CommandPaletteFooter.doc.mjs. Original SHA-256: 8d373a76154c80f191a34be5408e8ef9e832bb163b97f776c9ae9885bb28e859.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CommandPaletteFooter',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Footer',
  isHiddenFromOverview: true,
  description:
    'Footer with keyboard guidance. CommandPalette renders the default arrow, Enter, and Escape hints automatically.',
  usage: {
    description:
      'CommandPalette renders CommandPaletteFooter automatically. Pass a CommandPaletteFooter to the footer slot only when replacing the default guidance.',
    anatomy: [
      {
        name: 'Footer',
        required: true,
        description:
          'Supporting region that presents default guidance or caller-provided footer content.',
      },
      {
        name: 'Keyboard shortcut',
        required: false,
        description:
          'Default Kbd badges for navigation, selection, and dismissal.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Custom footer content. When omitted, renders default keyboard hints via Kbd.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-command-palette-footer'}],
  },
}
```
