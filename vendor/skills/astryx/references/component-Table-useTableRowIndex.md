# Astryx component reference: Table/useTableRowIndex.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableRowIndex.doc.mjs. Original SHA-256: 0c3a34f1b58970b137c769e64ee38efb86a86aba48aedef32956b7084a261813.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableRowIndex',
  subComponentOf: 'Table',
  displayName: 'useTableRowIndex',
  description:
    'Hook that returns a TablePlugin which prepends a right-aligned, monospaced row-number column, starting at 1 by default. Without data, Table supplies row positions; with data, ordinary numbers follow that array. Windowed rows use the parent Table logical position directly; nondefault startFrom values use full rendering.',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description:
        'Optional: the array whose order the numbers follow. Omit it to number rows from the positions Table gives them.',
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description:
        'Optional key extractor used with data, returning a unique string per row. When provided, rows match data by the returned string; otherwise by reference identity. Memoize with useCallback for a stable plugin identity.',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Header label for the index column.',
      default: "'#'",
    },
    {
      name: 'startFrom',
      type: 'number',
      description: 'First index value.',
      default: '1',
    },
  ],
}
```
