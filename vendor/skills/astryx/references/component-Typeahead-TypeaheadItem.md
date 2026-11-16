# Astryx component reference: Typeahead/TypeaheadItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Typeahead/TypeaheadItem.doc.mjs. Original SHA-256: c06e4de8d308955b53d21cdc17cdb3da04ddbb4aa1fd0744766b10d585f4c2ed.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TypeaheadItem',
  subComponentOf: 'Typeahead',
  displayName: 'Typeahead Item',
  description:
    'Default dropdown item renderer for typeahead results. Shows label with optional icon, description, and avatar. Exported for use in custom renderItem implementations.',
  props: [
    {
      name: 'item',
      type: 'SearchableItem',
      description: 'The search result item to render.',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon or avatar to display before the label.',
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
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed below the label.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether this item is visually disabled.',
      default: 'false',
    },
    {
      name: 'group',
      type: 'string',
      description:
        'This prop has no effect. Set `item.auxiliaryData.group` on search-source items to group results in Typeahead or BaseTypeahead.',
    },
  ],
}
```
