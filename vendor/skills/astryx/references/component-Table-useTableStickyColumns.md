# Astryx component reference: Table/useTableStickyColumns.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableStickyColumns.doc.mjs. Original SHA-256: 530fd495d8cdd15b0ae94d2b28f6a19a5bb19550e5aebb98b5c657333a9fca30.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableStickyColumns',
  subComponentOf: 'Table',
  displayName: 'useTableStickyColumns',
  description:
    'Hook that returns a TablePlugin which pins a contiguous run of columns to the start and/or end edge of the table. Pinned columns get cumulative offsets and a soft, scroll-aware shadow over the scrolling content. An empty config ({}) is a valid no-op that pins nothing.',
  props: [
    {
      name: 'startKeys',
      type: 'string[]',
      description:
        'Column keys pinned to the start (inline-start / left in LTR) edge: the contiguous run from the first column through the last listed key.',
    },
    {
      name: 'endKeys',
      type: 'string[]',
      description:
        'Column keys pinned to the end (inline-end / right in LTR) edge: the contiguous run from the first listed key through the last column.',
    },
  ],
}
```
