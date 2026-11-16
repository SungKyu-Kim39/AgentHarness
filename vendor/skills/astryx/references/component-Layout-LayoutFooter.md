# Astryx component reference: Layout/LayoutFooter.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Layout/LayoutFooter.doc.mjs. Original SHA-256: 477273cf53e93d37db63b921de82704d2286006fb6c48170652f03160fa0a6ae.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'LayoutFooter',
  subComponentOf: 'Layout',
  displayName: 'Layout Footer',
  isHiddenFromOverview: true,
  description: 'Bottom bar for action bars, pagination, and status bars.',
  playground: {
    defaults: {
      children: 'Footer content: status bar or actions',
      hasDivider: true,
    },
    wrapper: {
      component: 'Layout',
      slotProp: 'footer',
      props: {
        content: {
          __element: 'LayoutContent',
          props: {},
          children: 'Main content area',
        },
      },
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Footer content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        "Border at top edge. When unset, the parent Layout's defaultHasDividers decides.",
      default: 'false',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        'Footer height. Numbers are treated as pixels, strings are used as-is.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the landmark element.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Internal padding on every edge, using the spacing scale. Replaces the inset from the layout; 0 is full bleed.',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA landmark role.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the footer element.',
    },
  ],
}
```
