# Astryx component reference: Table/TableFooter.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/TableFooter.doc.mjs. Original SHA-256: a340c8546140f2f9f6dd61e9f91b667c4a6ffba89ddcb52e537efcc206d7d6ff.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TableFooter',
  subComponentOf: 'Table',
  displayName: 'Table Footer',
  isHiddenFromOverview: true,
  description:
    '<tfoot> wrapper for children mode. Holds summary or total rows beneath the body. A row must sit inside a section: <table> cannot contain a <tr> directly, because the HTML parser inserts an implied <tbody> when it parses server-rendered markup and React does not when it renders on the client, so the two trees mismatch on hydration. Children mode only: the data-driven data={...} path renders a header and a body, never a footer.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The <tfoot> rows.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-table-footer'}],
  },
}
```
