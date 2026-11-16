# Astryx component reference: Table/useTableSortable.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableSortable.doc.mjs. Original SHA-256: 710047938fbd39209af5b4014f5e22fd7e8304f2fcc5baf94712cadfc9ecf228.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableSortable',
  subComponentOf: 'Table',
  displayName: 'useTableSortable',
  description: 'Headless multi-sort plugin for Table. Call with a config object: `useTableSortable({ sort, onSortChange })`. Returns a TablePlugin to pass to `<Table plugins={{ sort: sortPlugin }} />`.',
  usage: {
    description: 'Call useTableSortable with a config object containing sort state and callback. Pass the returned plugin to Table via the plugins prop.',
  },
  props: [
    {
      name: 'sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description: "Current sort state (TableSortState<TSortKey>). Ordered array of entries; the first is the primary sort, the rest are tiebreakers. An empty array means unsorted. Direction is the full word: 'ascending' / 'descending', not 'asc' / 'desc'.",
      required: true,
    },
    {
      name: 'onSortChange',
      type: "(sort: Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>) => void",
      description: 'Called when the user clicks a header cell to change sort. Receives the next sort state.',
      required: true,
    },
    {
      name: 'allowUnsortedState',
      type: 'boolean',
      description: "Allow cycling back to unsorted. When true: 'ascending', 'descending', unsorted. When false: 'ascending', 'descending', 'ascending'.",
      default: 'false',
    },
    {
      name: 'isMultiSortEnabled',
      type: 'boolean',
      description: 'Enable multi-sort via Shift+click. Regular click still replaces the entire sort state.',
      default: 'false',
    },
  ],
}
```
