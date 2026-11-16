# Astryx component reference: theme/useThemeName.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/theme/useThemeName.doc.mjs. Original SHA-256: 4172b4e61eab2759ad9b62ce4a4a04a069936142ada07bc4d34c11f71c228409.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useThemeName',
  displayName: 'useThemeName',
  keywords: ['theme', 'name', 'identity', 'provider', 'icon'],
  params: [],
  returns: [
    {
      name: 'name',
      type: 'string | null',
      description:
        'The nearest Theme name. Null when no Theme context is present and the root has not set a theme name.',
    },
  ],
  usage: {
    description:
      'Reads only the active theme name. Use it when code needs to know which theme is on, and does not need tokens or the color mode. It reads ThemeContext when a Theme is above the caller, and otherwise the root theme name on the document element.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use this hook for theme identity, such as picking a semantic icon for the active theme.',
      },
      {
        guidance: true,
        description:
          'Use useTheme when the caller also needs token values or the resolved light or dark mode.',
      },
      {
        guidance: false,
        description:
          'Treat null as the name default. Null means no theme name is available.',
      },
    ],
  },
  relatedComponents: ['Theme'],
  relatedHooks: ['useTheme'],
  importPath: '@astryxdesign/core/theme',
  category: 'Utility',
}
```
