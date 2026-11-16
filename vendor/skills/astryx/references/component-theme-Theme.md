# Astryx component reference: theme/Theme.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/theme/Theme.doc.mjs. Original SHA-256: 3c8bd15f018a5aaebe85e03574416d69dcd39d8c89a8890510e17105a514e32c.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Theme',
  displayName: 'Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['theme', 'theming', 'provider', 'color-scheme'],
  playground: {
    defaults: {
      theme: '@astryxdesign/theme-matcha',
      mode: 'light',
      children: {
        __element: 'Card',
        props: {padding: 4, style: {maxWidth: 360}},
        children: {
          __element: 'VStack',
          props: {gap: 3},
          children: [
            {
              __element: 'Heading',
              props: {level: 4},
              children: 'Theme preview',
            },
            {
              __element: 'Text',
              props: {type: 'body', color: 'secondary'},
              children:
                'Cards, text, and buttons inherit tokens from the selected theme.',
            },
            {__element: 'Button', props: {label: 'Primary action'}},
          ],
        },
      },
    },
  },
  usage: {
    description:
      'Wraps a subtree with a specific Astryx theme. For static production themes, use `astryx theme build` and import the generated CSS plus built theme object for first-paint and SSR performance. Use runtime `defineTheme()` when themes are dynamic or for prototyping.\n\n`defineTheme` accepts a `tokens` object whose keys are CSS custom property names (always prefixed with `--`). Common token names include `--color-accent`, `--color-background-surface`, `--color-background-body`, `--color-text-primary`, `--color-text-secondary`, `--radius-container`, `--spacing-1` through `--spacing-6`. Values can be a string (same for light/dark) or a `[light, dark]` tuple.\n\nExample:\n```ts\nimport {defineTheme} from \'@astryxdesign/core/theme\';\nconst myTheme = defineTheme({\n  name: \'ocean\',\n  tokens: {\n    \'--color-accent\': [\'#0077B6\', \'#48CAE4\'],\n    \'--color-background-surface\': [\'#F0F8FF\', \'#0A1628\'],\n    \'--color-text-primary\': [\'#0A1317\', \'#FFFFFF\'],\n    \'--radius-container\': \'16px\',\n  },\n});\n```',
    bestPractices: [
      {
        guidance: true,
        description:
          'Build app themes that are known ahead of time with `astryx theme build`, then import the generated CSS and built theme object.',
      },
      {
        guidance: true,
        description:
          'Use runtime themes when the theme is created or edited in the browser, such as theme editors, user branding, or prototypes.',
      },
      {
        guidance: true,
        description:
          'Token names always start with `--` (e.g. `--color-accent`, `--color-background-surface`). Do not omit the prefix.',
      },
      {
        guidance: false,
        description:
          'Default to runtime themes in SSR production apps. Component overrides inject after hydration instead of shipping as static CSS.',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'DefinedTheme',
      required: true,
      description:
        "Theme object to apply. Prefer built theme objects for static production themes; use runtime `defineTheme()` for dynamic themes. Its `motion` can set `tempo` (0.75–1.5) and `character` (`'crisp' | 'standard' | 'expressive'`).",
    },
    {
      name: 'mode',
      type: "'light' | 'dark' | 'system'",
      default: "'system'",
      description: 'Color mode. System follows OS preference.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Content to render with the theme.',
    },
  ],
}
```
