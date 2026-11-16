# Astryx component reference: hooks/useAnimatedLayout.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useAnimatedLayout.doc.mjs. Original SHA-256: d3c6a96dca6a628b238f978ff0f4bdf33dbb9caef707afee44776cccc8ce9055.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useAnimatedLayout',
  displayName: 'useAnimatedLayout',
  keywords: [
    'animated layout',
    'layout shift',
    'glide',
    'expand',
    'collapse',
    'disclosure',
    'reflow',
    'jump',
    'motion',
    'transition',
  ],
  params: [
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'The area the glide stays inside: the ref you already give your scroll container or panel. A ScrollableArea ref reaches its native scroll viewport, so pass that.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'animatedLayout',
      type: 'AnimatedLayout',
      description:
        'An opaque handle with no public members. Pass it to the animatedLayout prop of a component whose size changes, such as TreeList or Collapsible.',
    },
  ],
  usage: {
    description:
      'Returns a handle to pass to a component whose size changes, such as TreeList or Collapsible. When that component changes size, it and the content after it inside `containerRef` animate together on one shared motion role. Fixed and stuck sticky elements stay put, the glide never scrolls the area, and Reduce Motion is respected. It applies under every pointer, a mouse included. Without the handle a component keeps its jump: content after it takes its place at once. Content after the change may mix Astryx components and your own elements; none of it opts in.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Create one handle per scroll container or panel and pass the same handle to every component in it whose size changes.',
      },
      {
        guidance: true,
        description:
          'Pass the ref you already give ScrollableArea as containerRef; ScrollableArea does not register itself.',
      },
      {
        guidance: false,
        description:
          'Wrap the content after a disclosure in an extra element to make it move; everything after the change inside the container moves on its own.',
      },
      {
        guidance: false,
        description:
          'Animate height yourself alongside it; the glide moves content with a compositor translate and never animates height.',
      },
    ],
  },
  relatedComponents: ['TreeList', 'Collapsible', 'ScrollableArea'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
}
```
