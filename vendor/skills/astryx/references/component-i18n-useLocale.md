# Astryx component reference: i18n/useLocale.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/i18n/useLocale.doc.mjs. Original SHA-256: 25e2a92791d8a5dca37d223c75cca29da0df7ab2a13499fe6cc81492488806c0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useLocale',
  displayName: 'useLocale',
  category: 'utilities',
  keywords: [
    'i18n',
    'internationalization',
    'localization',
    'locale',
    'language',
    'provider',
    'hook',
  ],
  params: [],
  returns: [
    {
      name: 'locale',
      type: 'Locale',
      description:
        "The active InternationalizationProvider BCP 47 locale. Falls back to 'en' when no provider is present.",
    },
  ],
  usage: {
    description:
      'Reads the authoritative Astryx locale. Use it to thread the provider locale into pure formatting helpers and sibling-package APIs; do not derive a second locale from navigator.language or a hardcoded literal.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the returned locale to pure Astryx helpers or package APIs that require an explicit locale.',
      },
      {
        guidance: false,
        description:
          'Use navigator.language or a hardcoded display locale as a fallback; InternationalizationProvider is the locale source.',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider'],
  relatedHooks: ['useCollator', 'useTranslator', 'useDirection'],
  importPath: '@astryxdesign/core',
}
```
