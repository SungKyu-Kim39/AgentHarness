# Astryx component reference: hooks/useMediaQuery.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useMediaQuery.doc.mjs. Original SHA-256: f7e8ef62c2c63ee49ca6d0dd1df4636c072908de1151274d8975ff984d971a74.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useMediaQuery',
  displayName: 'useMediaQuery',
  keywords: ['responsive', 'breakpoint', 'media', 'mobile', 'desktop', 'screen', 'matchmedia'],
  params: [
    {
      name: 'query',
      type: 'string',
      description: 'CSS media query string to evaluate.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'matches',
      type: 'boolean',
      description: 'Whether the media query currently matches. Always false on first render (SSR-safe).',
    },
  ],
  usage: {
    description: 'SSR-safe media query hook that subscribes to window.matchMedia changes. Returns whether the given media query matches. Always returns false on first render for SSR compatibility. Where `window.matchMedia` is missing, it returns its server default and never throws.',
    bestPractices: [
      { guidance: true, description: 'Use for responsive layout switching based on viewport width, color scheme, or motion preferences.' },
      { guidance: true, description: 'Prefer Astryx responsive tokens and component props over manual breakpoint logic when possible.' },
      { guidance: false, description: 'Use for server-rendered content that must match on first paint; the hook always returns false initially.' },
    ],
  },
  relatedComponents: [],
  relatedHooks: ['useImageMode'],
  importPath: '@astryxdesign/core/hooks',
  category: 'media',
}
```
