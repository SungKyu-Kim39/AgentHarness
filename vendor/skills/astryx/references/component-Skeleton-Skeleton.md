# Astryx component reference: Skeleton/Skeleton.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Skeleton/Skeleton.doc.mjs. Original SHA-256: 76e6767f1e5650d2cdf6f78b0becf28c69ec8af756acd6a5581fce09f1f99573.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Skeleton',
  displayName: 'Skeleton',
  category: 'Feedback & Status',
  keywords: ["skeleton","placeholder","loading","shimmer","pulse","loader","bone","ghost","preloader"],
  props: [
    {
      name: 'width',
      type: 'number | string',
      description: 'Width in pixels (number) or CSS value (string).',
      default: "'100%'",
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Height in pixels (number) or CSS value (string).',
      default: "'100%'",
    },
    {
      name: 'radius',
      type: "'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'",
      description: 'Border radius using design token scale. Use none for sharp corners, rounded for fully rounded (avatars, pills, circles).',
      default: '3',
    },
    {
      name: 'index',
      type: 'number',
      description:
        'Index for staggered animation timing. For element at index n, animation starts at DELAY_TIME + (STAGGER_TIME × n).',
      default: '0',
    },
  ],
  playground: {
    // Skeleton width/height default to '100%', which collapses to a zero-size
    // (invisible) element in the properties-tab preview. Give the example
    // explicit pixel dimensions so the shimmer placeholder is visible.
    defaults: {
      width: 320,
      height: 80,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-skeleton'},
    ],
  },
  usage: {
    anatomy,
    description:
      'An animated shimmer placeholder that previews the shape of content while it loads. Use it to build loading screens that match the layout of the real content. For content with unknown dimensions, use Spinner instead.',
    bestPractices: [
      {guidance: true, description: 'Match the size and shape of the content being loaded to create a realistic placeholder.'},
      {guidance: true, description: 'Stagger multiple skeletons with the `index` prop for a natural wave animation.'},
      {guidance: false, description: 'Use when the content dimensions are unknown; use Spinner instead.'},
      {guidance: false, description: 'Combine with a Spinner on the same content area; pick one loading pattern.'},
      {guidance: false, description: 'Show skeletons indefinitely; if loading takes too long, show an error or empty state instead.'},
    ],
  },
}
```
