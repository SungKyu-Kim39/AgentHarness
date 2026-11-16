# Astryx component reference: ContextMenu/ContextMenuItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/ContextMenu/ContextMenuItem.doc.mjs. Original SHA-256: af04da886b40feede7e3d98b65451ff6dbe8c51e120761b555a5e21578b1a138.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ContextMenuItem',
  subComponentOf: 'ContextMenu',
  displayName: 'Context Menu Item',
  isHiddenFromOverview: true,
  description: 'Menu item component for compound mode. Re-exported from DropdownMenuItem for discoverability.',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: 'Icon to display before the label.',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Additional content rendered after the label and description.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
  ],
  playground: {
    defaults: {
      label: 'Edit',
      description: 'Modify this item',
    },
  },
}
```
