# Astryx component reference: Table/useTableColumnResize.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableColumnResize.doc.mjs. Original SHA-256: 855ecf95b5445b3affc4541647e42b17465aaf891fc032f7520aca8af42ee331.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableColumnResize',
  subComponentOf: 'Table',
  displayName: 'useTableColumnResize',
  description:
    'Hook that returns a TablePlugin adding draggable resize handles to column header borders. Supports pointer + keyboard (WAI-ARIA window splitter) resizing, RTL, per-column min/max widths, and proportional-column preservation (resizes the neighbor so the table stays full-width). Commits widths on release.',
  props: [
    {
      name: 'columnWidths',
      type: 'Record<string, number>',
      description:
        'Controlled pixel-width overrides keyed by column key. When a key is present it overrides the column\'s declared width.',
    },
    {
      name: 'onColumnResizeEnd',
      type: '(updates: Record<string, number>) => void',
      description:
        'Called when a resize completes (pointerup / Enter). Receives a map of every column key whose width changed; merge it into your columnWidths state.',
    },
    {
      name: 'minWidth',
      type: 'number',
      description:
        'Global minimum column width in pixels during resize. Overrides per-column defaults when set.',
    },
    {
      name: 'maxWidth',
      type: 'number',
      description: 'Global maximum column width in pixels during resize.',
      default: 'Infinity',
    },
    {
      name: 'columns',
      type: 'TableColumn<T>[]',
      description:
        'Column definitions, needed to derive per-column min widths and detect proportional vs pixel columns for neighbor/last-column resize behavior.',
    },
  ],
}
```
