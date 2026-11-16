# Astryx component reference: MetadataList/MetadataListItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/MetadataList/MetadataListItem.doc.mjs. Original SHA-256: ed1dd433b3296f42c774caad131ab1788bf61002f97926b758293da2bd31f0ff.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'MetadataListItem',
  subComponentOf: 'MetadataList',
  displayName: 'Metadata List Item',
  isHiddenFromOverview: true,
  description: 'A single labeled metadata value within an MetadataList.',
  playground: {
    defaults: {label: 'Status', children: 'Active'},
    wrapper: {component: 'MetadataList'},
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content value for this metadata item.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text for this metadata item.',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon rendered before the label text.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
  ],
}
```
