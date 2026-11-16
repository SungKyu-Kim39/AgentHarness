# Astryx component reference: CommandPalette/CommandPaletteGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CommandPalette/CommandPaletteGroup.doc.mjs. Original SHA-256: 189f87ef5caa1a4a4929b627bd46cddcbe1dcc80fe42bec571cb93c159498ed2.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CommandPaletteGroup',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Group',
  isHiddenFromOverview: true,
  description: 'Visual grouping with a heading label. Place inside CommandPaletteList.',
  props: [
    {
      name: 'heading',
      type: 'string',
      description: 'Group heading text.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'CommandPaletteItem children.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  playground: {
    defaults: {
      heading: 'Navigation',
      children: [
        {__element: 'CommandPaletteItem', props: {value: 'home', onSelect: undefined}, children: 'Go Home'},
        {__element: 'CommandPaletteItem', props: {value: 'settings', onSelect: undefined}, children: 'Open Settings'},
        {__element: 'CommandPaletteItem', props: {value: 'profile', onSelect: undefined}, children: 'View Profile'},
      ],
    },
  },
}
```
