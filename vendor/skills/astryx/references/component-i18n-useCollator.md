# Astryx component reference: i18n/useCollator.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/i18n/useCollator.doc.mjs. Original SHA-256: 4e34d26fee944837870d05d4c16166a37d7b283319d37870d40b1126db3f469b.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useCollator',
  displayName: 'useCollator',
  category: 'utilities',
  keywords: [
    'i18n',
    'internationalization',
    'locale',
    'collation',
    'compare',
    'sort',
    'table',
    'hook',
  ],
  params: [
    {
      name: 'options',
      type: 'Intl.CollatorOptions',
      description:
        'Optional collation behavior such as numeric ordering, sensitivity, punctuation handling, and case order.',
      required: false,
    },
  ],
  returns: [
    {
      name: 'collator',
      type: 'Intl.Collator',
      description:
        'A memoized collator bound to the active InternationalizationProvider locale.',
    },
  ],
  usage: {
    description:
      'Returns the sanctioned locale-aware comparator for custom sorting. The collator is recreated when the provider locale or an option changes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reuse collator.compare in custom Table comparators and other user-visible string ordering.',
      },
      {
        guidance: false,
        description:
          'Construct Intl.Collator directly or call localeCompare; those bypass the provider-backed locale contract.',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider', 'Table'],
  relatedHooks: ['useLocale'],
  importPath: '@astryxdesign/core',
}
```
