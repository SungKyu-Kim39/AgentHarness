# Astryx component reference: hooks/useDevWarning.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useDevWarning.doc.mjs. Original SHA-256: 52c5e221be62ef0141c60125968a9eddebbee3494ce634d7cb417539aa15fd15.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useDevWarning',
  displayName: 'useDevWarning',
  keywords: [
    'warning',
    'dev',
    'development',
    'console',
    'guardrail',
    'misuse',
    'invariant',
    'debug',
    'devWarn',
  ],
  params: [
    {
      name: 'component',
      type: 'string',
      description: 'Component or hook name, used as the message prefix.',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'What went wrong and how to fix it.',
      required: true,
    },
    {
      name: 'condition',
      type: 'boolean',
      description: 'Whether to warn.',
      default: 'true',
    },
  ],
  returns: [],
  usage: {
    description:
      'Fires a dev-only "Component: message" console warning once per mount while the condition holds. It is the render-safe way for a component to flag misuse: warning straight from the render body repeats on every render, and gating it with state adds a re-render, so this uses a ref and an effect instead. For a warning outside a component, use the imperative devWarn utility.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Say what is wrong and what the builder should do instead; the message is the whole value of the warning.',
      },
      {
        guidance: true,
        description:
          'Warn about combinations the types cannot express, such as two mutually exclusive props being set together.',
      },
      {
        guidance: false,
        description:
          'Use it for anything a user could see or for runtime error handling; it is stripped from production builds.',
      },
    ],
  },
  relatedComponents: [],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'utility',
}
```
