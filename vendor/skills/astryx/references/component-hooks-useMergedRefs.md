# Astryx component reference: hooks/useMergedRefs.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useMergedRefs.doc.mjs. Original SHA-256: e656c5374e0804dd3ff2cbd8e64614cd6f7060a23f173a04c53956911e4bee5f.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useMergedRefs',
  displayName: 'useMergedRefs',
  keywords: [
    'ref',
    'refs',
    'merge',
    'forwardRef',
    'callback ref',
    'stable ref',
  ],
  params: [
    {
      name: 'refs',
      type: 'Array<Ref<T> | undefined>',
      description: 'Up to six refs that should all receive the same element.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<T>',
      description:
        'A merged callback ref that remains stable until an input ref changes.',
    },
  ],
  usage: {
    description:
      'Combines multiple object or callback refs into one stable callback ref. Use it when a component must forward a consumer ref while also attaching internal refs. Unlike calling mergeRefs during render, the callback identity stays stable across unrelated rerenders, so React does not detach and reattach the element.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use useMergedRefs when one element must receive both a forwarded ref and one or more internal refs.',
      },
      {
        guidance: false,
        description:
          'Call mergeRefs directly in a JSX ref prop; that creates a new callback on every render and forces unnecessary detach and attach work.',
      },
    ],
  },
  relatedComponents: [],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'utility',
}
```
