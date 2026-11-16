# Astryx component reference: i18n/useDirection.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/i18n/useDirection.doc.mjs. Original SHA-256: 17337918755ae2db1e2eae025d736a4d9080ea0a547c83c930f010ca4d7fc992.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useDirection',
  displayName: 'useDirection',
  category: 'utilities',
  keywords: [
    'i18n',
    'internationalization',
    'direction',
    'dir',
    'ltr',
    'rtl',
    'bidirectional',
    'text direction',
    'canvas',
    'sparkline',
  ],
  params: [],
  returns: [
    {
      name: 'direction',
      type: "'ltr' | 'rtl'",
      description:
        "The ambient text direction ('ltr' or 'rtl') from the enclosing InternationalizationProvider, falling back to 'ltr' when called outside a provider.",
    },
  ],
  usage: {
    description:
      'Reads the current text direction during render. Reach for this hook as a last resort when render-time direction is strictly required (such as canvas drawing that cannot use CSS logical properties). In order of preference, always favor: CSS logical properties (margin-inline, inset-inline); shared mirror styles for directional icons (CSS scaleX); and DOM reads for keyboard or gesture logic.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Prefer CSS logical properties and directional CSS mirroring before using useDirection.',
      },
      {
        guidance: true,
        description:
          'Use useDirection when drawing on an HTML canvas or calculating non-CSS layout coordinates where the start edge depends on text direction.',
      },
      {
        guidance: false,
        description:
          'Use useDirection to conditionally swap margins, paddings, or inline alignments that can be solved with CSS logical properties.',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider'],
  relatedHooks: ['useLocale', 'useTranslator'],
  importPath: '@astryxdesign/core',
}
```
