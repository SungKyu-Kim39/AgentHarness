# Astryx component reference: Layout/LayoutHeader.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Layout/LayoutHeader.doc.mjs. Original SHA-256: 4589ae0464d2a8c122a94f08417bad1a8e0ab8c71b0ab2304e85f683c8a09fef.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'LayoutHeader',
  subComponentOf: 'Layout',
  displayName: 'Layout Header',
  keywords: ['pageheader', 'appheader', 'header'],
  isHiddenFromOverview: true,
  description: 'Top bar for page titles, app bars, and toolbars.',
  playground: {
    defaults: {
      children: 'Page Title',
      hasDivider: true,
    },
    wrapper: {
      component: 'Layout',
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Header content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        "Border at bottom edge. When unset, the parent Layout's defaultHasDividers decides.",
      default: 'false',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        'Header height. Numbers are treated as pixels, strings are used as-is.',
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
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Block-end (bottom) padding, using the spacing scale. Overrides padding on that edge only; paddingBlockEnd={0} docks the last child on the header bottom edge.',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA landmark role.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the header element.',
    },
  ],
}
```
