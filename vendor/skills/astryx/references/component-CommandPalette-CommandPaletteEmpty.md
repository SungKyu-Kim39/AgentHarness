# Astryx component reference: CommandPalette/CommandPaletteEmpty.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CommandPalette/CommandPaletteEmpty.doc.mjs. Original SHA-256: 76850b086e6cfc704d3b31247e92c4cfca218e9c64f987cd534a9d23b3bc962a.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CommandPaletteEmpty',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Empty',
  isHiddenFromOverview: true,
  description:
    'Empty state display for the results area. CommandPalette renders it automatically when a search returns no results, or when there is no query and bootstrap() returns nothing.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Message or content to display.',
      required: true,
    },
  ],
  playground: {
    defaults: {
      children: 'No results found. Try a different search.',
    },
  },
}
```
