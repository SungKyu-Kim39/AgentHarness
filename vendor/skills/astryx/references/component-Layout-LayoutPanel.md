# Astryx component reference: Layout/LayoutPanel.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Layout/LayoutPanel.doc.mjs. Original SHA-256: 2f7d7b328be8054b0b8866ff5f6f4d88cce8c2f67744eac77e12651414d880b6.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'LayoutPanel',
  subComponentOf: 'Layout',
  displayName: 'Layout Panel',
  isHiddenFromOverview: true,
  description: 'Sidebar for navigation, settings, or inspector panels.',
  playground: {
    defaults: {
      children: 'Panel Content',
      hasDivider: true,
      width: 200,
    },
    wrapper: {
      component: 'Layout',
      slotProp: 'start',
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
      description: 'Panel content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        "Line on the edge that faces the content: the inline end in the start slot, the inline start in the end slot. Without it and without padding, the panel and the content share one gap. The Layout's defaultHasDividers does not apply. Beside a ResizeHandle that draws its own line, leave it false.",
      default: 'false',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Internal padding on every edge, using the spacing scale. Replaces the automatic inset and the gap shared with the content. 0 is full bleed.',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description: 'Enable scrollable overflow.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the landmark element. While the region scrolls, it also names the scrolling region, which otherwise takes a translated "Content".',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA landmark role.',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        "Width of the panel. Numbers are treated as pixels, strings are used as-is. Ignored when resizable is provided; the hook controls width. Beside a ResizeHandle given a useResizable region's props, a panel at width={region.size} is inert while the region is collapsed, and focus inside it moves to the handle as it collapses.",
    },
    {
      name: 'resizable',
      type: 'ResizableRegion | ResizableProps',
      description:
        "The output of useResizable(), or its props. When provided, the hook drives the panel width and a ResizeHandle should be placed adjacent to the panel. Carries the region's axis ('horizontal' | 'vertical'), which must match the adjacent ResizeHandle's direction. With the hook's own value, the panel slides closed and open from the edge facing its ResizeHandle; a hand-built object does not slide. Either way, focus inside the panel moves to its ResizeHandle as it collapses, and the panel is inert while collapsed.",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the panel element.',
    },
  ],
}
```
