# Astryx component reference: hooks/useOverflow.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useOverflow.doc.mjs. Original SHA-256: e6fed9e03a0066b7fcef0abf04799c54624e9b2d84d00c273f9c7a2df3a8a386.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useOverflow',
  displayName: 'useOverflow',
  keywords: [
    'overflow',
    'truncate',
    'responsive',
    'collapse',
    'resize',
    'measure',
    'hidden',
    'more',
    'breadcrumb',
  ],
  params: [
    {
      name: 'itemCount',
      type: 'number',
      description: 'Total number of items to measure for overflow.',
      required: true,
    },
    {
      name: 'options',
      type: 'UseOverflowOptions',
      description: 'Configuration object for overflow behavior.',
      required: false,
    },
    {
      name: 'options.gap',
      type: 'number',
      description: 'Gap between items in pixels. Used in width calculations.',
      default: '0',
      required: false,
    },
    {
      name: 'options.minVisibleItems',
      type: 'number',
      description:
        "Minimum number of items to always show, even if they don't fit.",
      default: '0',
      required: false,
    },
    {
      name: 'options.collapseFrom',
      type: "'start' | 'end'",
      description: 'which end to collapse items from.',
      default: "'end'",
      required: false,
    },
    {
      name: 'options.behavior',
      type: "'observeParent' | 'observeSelf'",
      description:
        "Which element to observe for overflow calculations. 'observeParent' uses the container's parent element width, allowing the visible container to remain content-sized.",
      default: "'observeSelf'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'containerRef',
      type: 'React.RefCallback<HTMLElement>',
      description: 'Ref callback to attach to the visible container element.',
    },
    {
      name: 'measureRef',
      type: 'React.RefCallback<HTMLElement>',
      description:
        'Ref callback to attach to the hidden measurement container that holds all items.',
    },
    {
      name: 'visibleCount',
      type: 'number',
      description: 'Number of items that fit in the visible container.',
    },
    {
      name: 'hasOverflow',
      type: 'boolean',
      description:
        'Whether any items are overflowing (visibleCount < itemCount).',
    },
  ],
  usage: {
    description:
      'Measures children rendered in a hidden container to determine how many fit in the available width without flickering. Uses ResizeObserver to react to container and measured-child size changes. The measurement container should hold all items plus an optional overflow indicator element (identified by a data-overflow-indicator attribute).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render all items into the measureRef container (hidden) and only the first visibleCount items into the containerRef container (visible).',
      },
      {
        guidance: true,
        description:
          'Include an overflow indicator (e.g., "+N more" button) as the last child of the measurement container with a data-overflow-indicator attribute.',
      },
      {
        guidance: false,
        description:
          'Use for vertical overflow; this hook measures horizontal width only.',
      },
    ],
  },
  relatedComponents: ['OverflowList', 'Breadcrumb'],
  relatedHooks: ['useScrollOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
}
```
