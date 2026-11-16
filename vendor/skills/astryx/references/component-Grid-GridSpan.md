# Astryx component reference: Grid/GridSpan.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Grid/GridSpan.doc.mjs. Original SHA-256: 86a258912b6c068d045c108b1d21889395415b744fb3ae996d95bd299e274e01.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'GridSpan',
  subComponentOf: 'Grid',
  displayName: 'Grid Span',
  isHiddenFromOverview: true,
  description: 'Grid item that spans multiple columns or rows.',
  playground: {
    wrapper: {component: 'Grid', props: {columns: 3, gap: 2}},
    defaults: {
      columns: 2,
      children: 'Spans 2 columns',
    },
  },
  props: [
    {
      name: 'columns',
      type: "number | 'full'",
      description:
        "Columns to span; use `'full'` to span all explicit columns.",
    },
    {
      name: 'rows',
      type: 'number',
      description: 'Rows to span.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles applied to the span wrapper. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name applied to the span wrapper.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline styles applied to the span wrapper. When `columns` or `rows` is set, its `grid-column` or `grid-row` replaces the same property in `style`.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the span wrapper.',
    },
  ],
}
```
