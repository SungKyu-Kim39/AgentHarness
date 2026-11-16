# Astryx component reference: TopNav/TopNavMegaMenuItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNavMegaMenuItem.doc.mjs. Original SHA-256: 5e9e8176d7ec93ec0e729f05f1ef3ae89b08a708df60a249873d9b50d19d702e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNavMegaMenuItem',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu Item',
  isHiddenFromOverview: true,
  description: 'An individual item inside an TopNavMegaMenu. Renders itself in both desktop (popover grid) and mobile drawer modes via render mode context.',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Display title for the menu item.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Optional description text displayed below the title.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional icon element displayed to the left.',
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
      name: 'href',
      type: 'string',
      description: 'URL to navigate to when clicked.',
    },
    {
      name: 'onClick',
      type: '() => void',
      description: 'Callback when item is clicked.',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: 'Custom component to render instead of <a> for link items. Overrides the provider-level default set by LinkProvider.',
    },
  ],
}
```
