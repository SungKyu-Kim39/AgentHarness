# Astryx component reference: i18n/useTranslator.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/i18n/useTranslator.doc.mjs. Original SHA-256: aee1c853850ebbfe6e94e1cf9a8f97b6c2ed44770e8665dcbe49d5f3984d58ae.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTranslator',
  displayName: 'useTranslator',
  category: 'utilities',
  keywords: [
    'i18n',
    'internationalization',
    'localization',
    'translation',
    'translate',
    'locale',
    'hook',
  ],
  params: [],
  returns: [
    {
      name: 'value',
      type: '(key: string, values?: Record<string, string | number | Date>) => string',
      description:
        'A stable translator function bound to the current InternationalizationProvider context. Call it with a message key and optional ICU MessageFormat values to get the formatted string in the active locale. Safe to use in render, event handlers, effects, or any code that runs during the parent component\'s lifecycle.',
    },
  ],
  usage: {
    description:
      'Returns a translator function that resolves keys against the current locale, provider overrides, and the shipped English fallback catalog. Call inside a component; the returned function can be used anywhere within that component\'s scope.',
  },
  relatedComponents: ['InternationalizationProvider'],
  importPath: '@astryxdesign/core',
}
```
