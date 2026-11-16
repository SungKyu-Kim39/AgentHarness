# Astryx component reference: Table/plugins/sortable/useTableSortableState.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/plugins/sortable/useTableSortableState.doc.mjs. Original SHA-256: 2d4fad803440a22d58ec1da61241c4c9fe94f8ceba0f3488099835355dc2aae3.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableSortableState',
  displayName: 'useTableSortableState',
  group: 'Table',
  keywords: [
    'table',
    'sort',
    'sorting',
    'multi-sort',
    'sort state',
    'comparator',
    'useTableSortable',
    'local sort',
  ],
  params: [
    {
      name: 'config',
      type: 'UseTableSortableStateConfig<T, TSortKey>',
      description: 'The rows to sort and how the sort state is owned.',
      required: true,
    },
    {
      name: 'config.data',
      type: 'T[]',
      description:
        'Rows to sort. The hook returns a sorted copy and never mutates the array.',
      required: true,
    },
    {
      name: 'config.defaultSort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description:
        'Initial sort state when the hook owns it. Ignored when sort is passed.',
      default: '[]',
      required: false,
    },
    {
      name: 'config.sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description:
        'Controlled sort state. Pass it with onSortChange to own the state yourself.',
      required: false,
    },
    {
      name: 'config.onSortChange',
      type: "(sort: Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>) => void",
      description:
        'Called with the next sort state. Required when sort is passed.',
      required: false,
    },
    {
      name: 'config.comparators',
      type: 'Partial<Record<TSortKey, (a: T, b: T) => number>>',
      description:
        'Ascending comparators per sort key; the hook flips the result for descending. Keys without one compare numbers numerically, compare other values as strings with a numeric collator in the active InternationalizationProvider locale, and put null, undefined and NaN last in ascending order and first in descending.',
      required: false,
    },
    {
      name: 'config.allowUnsortedState',
      type: 'boolean',
      description:
        "Passed to useTableSortable: a third click on a header returns the column to unsorted instead of 'ascending'.",
      default: 'true',
      required: false,
    },
    {
      name: 'config.isMultiSortEnabled',
      type: 'boolean',
      description:
        'Passed to useTableSortable: Shift+click on a header adds that column as the next sort key, or steps its direction if it is already sorted, instead of replacing the sort.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'sortedData',
      type: 'T[]',
      description:
        'A sorted copy of data, memoized on data and the sort state. Ties keep their order in data.',
    },
    {
      name: 'sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description: 'The current sort state, first entry first.',
    },
    {
      name: 'sortConfig',
      type: 'UseTableSortableConfig<TSortKey>',
      description:
        'Pass to useTableSortable(sortConfig) and give the resulting plugin to Table.',
    },
    {
      name: 'applySort',
      type: '(data: T[]) => T[]',
      description:
        'Sorts another array with the current sort state and comparators, for a second data source or a subset.',
    },
  ],
  usage: {
    description:
      "Owns a Table's sort state and sorts the rows locally, as a convenience layer over useTableSortable. Pass the rows in, render sortedData, and hand sortConfig to useTableSortable. The hook keeps the state (or reads it from sort and onSortChange when controlled), so header clicks re-sort the rows with no sort code in the component. With isMultiSortEnabled, Shift+click adds tiebreaker columns. For data sorted on a server, use useTableSortable directly and sort where the data lives.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it when the full data set is in memory, and pass sortedData to Table.',
      },
      {
        guidance: true,
        description:
          'Add a comparator for values whose order is not their string or number value, such as a status rank.',
      },
      {
        guidance: false,
        description:
          'Use it for server-side or paginated-on-server data; the hook only sorts the rows it is given.',
      },
    ],
  },
  relatedComponents: ['Table'],
  relatedHooks: ['useTableSortable', 'useCollator'],
  importPath: '@astryxdesign/core/Table',
  category: 'utilities',
}
```
