# Astryx component reference: theme/useTheme.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/theme/useTheme.doc.mjs. Original SHA-256: 8f4f6b17a4c9b1aa1cd9c2b3d9658b038fda54622d33b120b850901369cfb478.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTheme',
  displayName: 'useTheme',
  group: 'Utilities',
  category: 'Utility',
  keywords: [
    'theme',
    'tokens',
    'color',
    'mode',
    'dark',
    'light',
    'provider',
    'data visualization',
    'canvas',
    'svg',
    'chart',
  ],
  params: [],
  returns: [
    {
      name: 'name',
      type: 'string',
      description:
        'Name of the nearest theme, or default when no provider is present.',
    },
    {
      name: 'mode',
      type: "'light' | 'dark'",
      description:
        'Resolved effective color mode. system mode is resolved to light or dark.',
    },
    {
      name: 'token',
      type: '(name: string) => string',
      description:
        'Resolve a single design token to its current CSS value for the effective mode.',
    },
    {
      name: 'tokens',
      type: 'Record<string, string>',
      description:
        'All tokens resolved for the current mode, including defaults and theme overrides. Stable until the active theme or mode changes; uses the same resolution logic as resolveThemeTokens(theme, {mode}).',
    },
  ],
  usage: {
    description:
      'Programmatic access to theme tokens for non-CSS consumers like SVG, canvas, Vega, D3, maps, or chart libraries that need values in JavaScript instead of CSS custom property references.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use tokens or token(name) when integrating theme colors into SVG attributes, canvas drawing, chart options, or other non-CSS configuration objects inside React components.',
      },
      {
        guidance: true,
        description:
          'Use resolveThemeTokens(theme, {mode}) for the same token resolution outside React hooks.',
      },
      {
        guidance: true,
        description:
          'Prefer CSS variables or StyleX tokens for ordinary component styling; use this hook only when JavaScript needs token values.',
      },
      {
        guidance: true,
        description:
          'Use data visualization tokens such as --color-data-categorical-blue for chart series instead of arbitrary UI colors.',
      },
      {
        guidance: false,
        description:
          'Hardcode light/dark colors in data visualizations: resolve them through the current theme instead.',
      },
      {
        guidance: false,
        description:
          'Assume the hook reflects every CSS cascade override. It resolves tokens for the current Theme mode; local media-surface overrides and arbitrary external CSS may not be represented.',
      },
    ],
  },
  relatedComponents: ['Theme'],
  relatedHooks: ['useMediaQuery'],
  importPath: '@astryxdesign/core/theme',
}
```
