# Astryx component reference: Table/useTableColumnsVirtualization.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableColumnsVirtualization.doc.mjs. Original SHA-256: d212a7dec3cc71466ce1b018e8c99c523901600eac9f52482a2a7248442139c1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableColumnsVirtualization',
  subComponentOf: 'Table',
  displayName: 'useTableColumnsVirtualization',
  description:
    "Returns an opaque capability for Table column windowing. Pass the capability to Table.virtualization and keep the complete data, columns, explicit stable idKey and plugins on Table. Columns keep their declared widths: an overflowing Table renders at its minimum width, and the window uses the width each column has there. Pinned columns from useTableStickyColumns always mount; only the columns between the pinned runs window, with a few overscan columns on each side. When the Table's scroll area is at least as wide as the Table's minimum width, every column mounts. A focused cell keeps its column mounted while it scrolls out of view, until focus leaves the Table or moves to another cell. Changing column order, widths, visibility or pinning keeps the first visible column and its scroll offset. Supported tables have one header row, flat rows, no cell that spans columns and single-line content; explicit wrapping, arbitrary custom renderers, non-flat rows, invalid identity, a caller-provided scrollWrapper or a min-width wider than the column floors render every column. To window rows and columns together, pass both capabilities as a list: Table.virtualization={[rows, columns]}. Mounted cells keep native table semantics and full-table column positions; unmounted columns are not promised screen-reader discovery. Keep the capability on the Table for its whole life: adding or removing it remounts the table, which resets focus and scroll position. Changing initialViewportWidth does not remount it.",
  props: [
    {
      name: 'initialViewportWidth',
      type: 'number',
      required: true,
      description:
        "The inline viewport width in CSS pixels that the first window plans for, on the server and before the viewport is measured. It does not size the Table: after mount, the measured width of the Table's scroll area sets the window. Table accounts for its pinned columns.",
    },
  ],
}
```
