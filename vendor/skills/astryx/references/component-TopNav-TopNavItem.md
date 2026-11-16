# Astryx component reference: TopNav/TopNavItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNavItem.doc.mjs. Original SHA-256: 0c165a8244ebd08d0ee435a78ca61110185ad35c59cd6282207575cfc00ef105.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNavItem',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Item',
  isHiddenFromOverview: true,
  description: 'Navigation link item for use in TopNav startContent: renders as an anchor with hover and selected states.',
  playground: {
    defaults: {label: 'Projects', href: '#', isSelected: true},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the nav item. Rendered as visible text by default. When isIconOnly is true, used as aria-label instead.',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: 'Navigation target URL.',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: 'Whether this nav item is currently selected. Sets aria-current="page" and applies highlighted styles.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the nav item is disabled. Sets aria-disabled, drops href/target so the item cannot navigate, and prevents interaction.',
      default: 'false',
    },
    {
      name: 'isIconOnly',
      type: 'boolean',
      description: 'Renders the item as a square icon-only element. When true, label becomes the aria-label and visible text is hidden. Requires icon to be set.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional icon to display before the label.',
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
      name: 'children',
      type: 'ReactNode',
      description: 'Custom content to render instead of the label text.',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: 'Custom component to render instead of <a>. Overrides the provider-level default set by LinkProvider. Must accept href, className, style, and children props.',
    },
  ],
}
```
