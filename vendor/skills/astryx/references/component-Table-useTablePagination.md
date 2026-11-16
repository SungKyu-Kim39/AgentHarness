# Astryx component reference: Table/useTablePagination.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTablePagination.doc.mjs. Original SHA-256: 55d399231429d3e188d6b99abb946a8058e2448418964dadd2917b0be864ee6d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTablePagination',
  subComponentOf: 'Table',
  displayName: 'useTablePagination',
  description: 'Headless pagination plugin for Table. Call with a config object: `useTablePagination({ page, onPageChange, totalItems })`. Returns a TablePlugin to pass to `<Table plugins={{ pagination: paginationPlugin }} />`.',
  usage: {
    description: 'Call useTablePagination with a config object containing page state and callback. Pass the returned plugin to Table via the plugins prop.',
  },
  props: [
    {
      name: 'page',
      type: 'number',
      description: 'Current page number (1-based).',
      required: true,
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description: 'Called when the page changes.',
      required: true,
    },
    {
      name: 'totalItems',
      type: 'number',
      description: 'Total number of items across all pages. Used to calculate total page count.',
    },
    {
      name: 'totalPages',
      type: 'number',
      description: 'Total number of pages. Use when you know the page count but not item count.',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description: 'Whether more pages exist. Use for cursor-based pagination where the total is unknown.',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: 'Number of items per page.',
      default: '10',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description: 'Called when the user changes the page size. Shows a page size dropdown when provided with pageSizeOptions.',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description: 'Available page size options. Shows a page size selector when provided.',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description: 'Visual variant for the pagination controls.',
      default: "'pages'",
    },
    {
      name: 'position',
      type: "'below' | 'above' | 'both' | 'none'",
      description: 'Where to render pagination controls relative to the table.',
      default: "'below'",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      description: 'Horizontal alignment of the pagination controls.',
      default: "'center'",
    },
    {
      name: 'label',
      type: 'string',
      description: "Accessible name for the pagination nav landmark. With position='both' the two navs get distinct names (the label suffixed as '(top)' and '(bottom)') so same-type landmarks stay unique (axe landmark-unique).",
      default: "'Table pagination'",
    },
  ],
}
```
