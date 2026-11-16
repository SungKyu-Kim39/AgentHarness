# Astryx component reference: theme/SyntaxTheme.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/theme/SyntaxTheme.doc.mjs. Original SHA-256: 12a3228a733947b98f3973d53ddc9eeddce2165cd882661c57ed638fdd503670.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SyntaxTheme',
  displayName: 'Syntax Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'syntax',
    'highlighting',
    'code',
    'theme',
    'codeblock',
    'prism',
    'shiki',
  ],
  playground: {
    defaults: {
      theme: 'github-light',
      children: {
        __element: 'CodeBlock',
        props: {
          code: "const status = response.ok ? 'success' : 'error';",
          language: 'tsx',
          title: 'status.ts',
        },
      },
    },
  },
  usage: {
    description:
      'Applies syntax highlighting colors to CodeBlock and any code component in the subtree. By default, code components use the theme-level syntax colors (set via defineTheme({ syntax: ... })), which derive from the palette (--color-text-accent for keywords, --color-text-green for strings, etc.). SyntaxTheme lets you override those per-region. The system uses 14 semantic tokens (keyword, string, comment, number, function, type, variable, operator, constant, tag, attribute, property, punctuation, background) validated against 11 community themes. Custom themes are created with defineSyntaxTheme() and can use [light, dark] tuples for automatic color-scheme adaptation. Built-in presets: oneDarkPro, dracula, monokai, nord, tokyoNight, catppuccinMocha, githubLight, githubDark, solarizedLight, oneLight (import from @astryxdesign/core/theme/syntax).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the syntax field in defineTheme() for app-wide code styling. Use SyntaxTheme only when a specific section needs a different look.',
      },
      {
        guidance: true,
        description:
          'Pick from built-in presets or create a custom theme with defineSyntaxTheme() for brand-specific colors.',
      },
      {
        guidance: true,
        description:
          'Syntax themes support light-dark() tuples: each token can have different values for light and dark mode, resolved automatically by the color scheme.',
      },
      {
        guidance: true,
        description:
          'For a single CodeBlock, pass the syntaxTheme prop directly: it is shorthand for wrapping that block in SyntaxTheme. Use the SyntaxTheme wrapper when theming a whole region of code components.',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'SyntaxTheme',
      required: true,
      description:
        'Syntax highlighting theme: a preset from @astryxdesign/core/theme/syntax or a custom theme created with defineSyntaxTheme().',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        'Content subtree. All CodeBlock components within will use this syntax theme.',
    },
  ],
}
```
