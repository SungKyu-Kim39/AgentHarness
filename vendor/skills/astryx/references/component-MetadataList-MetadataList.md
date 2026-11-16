# Astryx component reference: MetadataList/MetadataList.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/MetadataList/MetadataList.doc.mjs. Original SHA-256: f21a2bb9a3e5ac79794d65e8d9295d77cfea670047b025b4ec9cd47f07c0e678.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'MetadataList',
  displayName: 'Metadata List',
  group: 'MetadataList',
  category: 'Table & List',
  keywords: ["metadata","description","definition","keyvalue","properties","details","attributes","summary","descriptionlist","descriptions"],
  theming: {
    targets: [
      {
        className: 'astryx-metadata-list',
        visualProps: ['columns', 'orientation'],
      },
      {className: 'astryx-metadata-list-item'},
    ],
  },
  description: 'Container for metadata items with column layout, orientation, and collapse support.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Metadata items (MetadataListItem components).',
      slotElements: [
        {
          __element: 'MetadataListItem',
          props: {
            label: 'Key',
          },
          children: 'Value',
        },
      ],
      required: true,
    },
    {
      name: 'columns',
      type: "'multi' | 'single' | number",
      description: 'Column layout mode.',
      default: "'single'",
    },
    {
      name: 'label',
      type: "{ position?: 'start' | 'top', width?: number | string }",
      description: "Label display configuration. position controls label placement, width sets a custom label column width. Defaults to { position: 'top' } for multi-column layouts. Position is ignored in horizontal mode, which always uses { position: 'top' }.",
      default: "{ position: 'start' } (vertical single-column) / { position: 'top' } (multi-column or horizontal)",
    },
    {
      name: 'maxNumOfItems',
      type: 'number',
      description: 'Maximum items to show before collapsing with a show more/less toggle.',
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      description: 'Layout orientation. Horizontal mode flows items in a row with flex-wrap.',
      default: "'vertical'",
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Optional title or heading above the list.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name for the root element. Prefer xstyle for styling; className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline styles for the root element. Prefer xstyle for styling; inline styles bypass StyleX optimization.',
    },
  ],
  components: [
    {name: 'MetadataListItem'},
  ],
  usage: {
    description:
      'MetadataList displays key-value pairs for object attributes like quality, condition, and status, in a structured layout. Use it for detail panels, settings summaries, and record information.',
    bestPractices: [
      { guidance: true, description: 'Choose label position based on content: "start" for short values, "top" for long or complex values.' },
      { guidance: true, description: 'Collapse long lists with `maxNumOfItems` to keep the page scannable.' },
      { guidance: true, description: 'Give each MetadataListItem a short label that names its value. Assistive technology reads each label with its value as a term and its definition.' },
      { guidance: true, description: 'The title does not name the list or add a heading. Pass a heading element as the title when the list needs a place in the page outline.' },
      { guidance: false, description: 'Use for extensive form input; use a form layout instead.' },
      { guidance: false, description: "Use for data that doesn't have a clear key-value structure." },
    ],
    anatomy: [
      {name: 'Title', required: false, description: 'Optional title for the metadata list.'},
      {name: 'Label', required: true, description: 'The key label for each metadata entry.'},
      {name: 'Metadata', required: true, description: 'The value displayed in various formats.'},
      {name: 'Disclosure', required: false, description: 'Collapse/expand control for the list.'},
    ],
  },
}
```
