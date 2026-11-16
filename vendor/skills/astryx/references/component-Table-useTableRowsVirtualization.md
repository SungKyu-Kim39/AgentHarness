# Astryx component reference: Table/useTableRowsVirtualization.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableRowsVirtualization.doc.mjs. Original SHA-256: b7a73b67370d8e5f92e487ae3f78dbf2655fbcfe04fc57e28331243163de3e3a.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableRowsVirtualization',
  subComponentOf: 'Table',
  displayName: 'useTableRowsVirtualization',
  description:
    "Returns an opaque capability for fixed-height flat-row Table windowing. Pass the capability to Table.virtualization and keep the complete data, columns, explicit stable idKey and plugins on Table. Sizes are positive finite CSS pixels. The Table scrolls inside the height its parent gives it and fills all of it. Give the Table's parent a height, fixed or relative, or a flex child, so windowing can bound the rows; with no height every row renders. Make the Table the parent's only child, or a flex child with min-height: 0 beside a heading or toolbar. Supported rows use single-line content; explicit wrapping, arbitrary custom renderers, non-flat rows or invalid identity use ordinary full rendering. Windowing uses the Table-owned scroll wrapper; a caller-provided scrollWrapper takes diagnostic full-render fallback. Mounted rows retain native table semantics and full-table positions; unmounted rows are not promised screen-reader discovery.",
  props: [
    {
      name: 'rowHeight',
      type: 'number',
      required: true,
      description:
        'Total body-row pitch in CSS pixels, including existing density padding and collapsed borders. Must fit text and supported controls without reducing their size. When every row measures taller, as with enlarged text or zoom, the Table windows at the measured height and warns in development; rows of unequal height render every row.',
    },
    {
      name: 'initialViewportHeight',
      type: 'number',
      required: true,
      description:
        'The viewport height in CSS pixels that the first window plans for, on the server and before the viewport is measured. It does not size the Table: the Table scrolls inside the height its parent gives it, and after mount the measured viewport sets the window. Table accounts for its headers and chrome.',
    },
  ],
}
```
