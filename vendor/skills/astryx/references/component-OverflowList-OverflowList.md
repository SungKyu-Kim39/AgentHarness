# Astryx component reference: OverflowList/OverflowList.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/OverflowList/OverflowList.doc.mjs. Original SHA-256: a5ee9ef54f326dc0ff2f1c0d96a7a5c32f431260a9f18c4926ed27310b3aee57.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'OverflowList',
  displayName: 'Overflow List',
  category: 'Table & List',
  keywords: [
    'overflow',
    'truncate',
    'collapse',
    'breadcrumb',
    'toolbar',
    'tag-list',
    'pill-list',
    'more',
    'clamp',
    'responsive',
  ],
  playground: {
    // children is required; without seeded items the properties-tab preview
    // renders an empty list. Provide a few items so the preview is meaningful.
    // `observeParent` measures the (full-width) preview container instead of
    // the list's own collapsed content box, so the row shows all items rather
    // than collapsing to one.
    defaults: {
      behavior: 'observeParent',
      children: [
        {__element: 'Button', props: {label: 'Overview', variant: 'secondary'}},
        {__element: 'Button', props: {label: 'Activity', variant: 'secondary'}},
        {__element: 'Button', props: {label: 'Settings', variant: 'secondary'}},
        {__element: 'Button', props: {label: 'Members', variant: 'secondary'}},
        {__element: 'Button', props: {label: 'Billing', variant: 'secondary'}},
      ],
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Items to render. Each child should be a single element.',
      required: true,
    },
    {
      name: 'overflowRenderer',
      type: '(overflowItems: OverflowItem[]) => ReactNode',
      description:
        'Render function for the overflow indicator. Receives the list of hidden items (each with child and index). Only called when items are overflowing.',
    },
    {
      name: 'onOverflowChange',
      type: '(overflowItems: OverflowItem[]) => void',
      description:
        'Called whenever the collapsed set changes: with the collapsed items once something collapses, and with an empty array once the row widens back out. Membership and order changes report even when the count stays the same; unrelated re-renders and callback identity changes do not. Silent while nothing overflows, including on mount. Use stable React keys for dynamic items.',
    },
    {
      name: 'gap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Gap between items as a spacing token step (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10).',
      default: '2',
    },
    {
      name: 'minVisibleItems',
      type: 'number',
      description:
        'Minimum number of items to always show, even when overflowing.',
      default: '0',
    },
    {
      name: 'maxVisibleItems',
      type: 'number',
      description:
        'Maximum number of items to ever show, even when they all fit. The ceiling partner to minVisibleItems; extra items collapse into the overflow indicator. If less than minVisibleItems, the floor wins.',
      default: 'undefined (no cap)',
    },
    {
      name: 'maxRows',
      type: 'number',
      description:
        'Wrap items across up to this many rows before collapsing the rest into the overflow indicator. A number, not a boolean. Leave undefined (or set 1) for single-line behavior. Assumes uniform row height.',
      default: 'undefined (single line)',
    },
    {
      name: 'collapseFrom',
      type: "'start' | 'end'",
      description: 'Which end to collapse items from when overflow occurs.',
      default: "'end'",
    },
    {
      name: 'behavior',
      type: "'observeSelf' | 'observeParent'",
      description:
        "Controls which element is measured for available width. 'observeSelf' uses the container's own width. 'observeParent' observes the parent element, useful when the list should stay content-sized while still detecting available space.",
      default: "'observeSelf'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-overflow-list'}],
  },
  usage: {
    anatomy,
    description:
      'A horizontal list that automatically hides items when they exceed the available width. Use OverflowList for breadcrumbs, toolbars, tag lists, or any row that needs to collapse gracefully at smaller sizes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a meaningful overflowRenderer: a "+N more" badge, a dropdown, or a count indicator.',
      },
      {
        guidance: true,
        description:
          'When the row already has its own menu, use onOverflowChange to feed the collapsed items into it instead of adding a second anchor with overflowRenderer.',
      },
      {
        guidance: true,
        description:
          'Set minVisibleItems to keep key items visible, and maxVisibleItems to cap the row at a fixed count regardless of available width.',
      },
      {
        guidance: true,
        description:
          'Use maxRows to let items wrap onto a bounded number of rows (e.g. a two-row tag cloud) before collapsing the rest into the indicator.',
      },
      {
        guidance: false,
        description:
          'Use OverflowList for a vertical stack; horizontal multi-row wrap is supported via maxRows, but items still flow left-to-right, not top-to-bottom.',
      },
    ],
  },
}
```
