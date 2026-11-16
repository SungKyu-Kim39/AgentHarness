# Astryx component reference: Link/useLinkify.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Link/useLinkify.doc.mjs. Original SHA-256: 2517449a5264e49bde1e46ac350bfa58870d59b4c2820ac6f587fa0fe5d77461.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useLinkify',
  displayName: 'useLinkify',
  keywords: [
    'linkify',
    'link',
    'autolink',
    'url',
    'email',
    'mailto',
    'plain text',
    'custom pattern',
    'issue reference',
    'LinkProvider',
    'routing',
  ],
  params: [
    {
      name: 'text',
      type: 'string',
      description:
        'The plain text to scan. Empty text returns a single-element array of itself.',
      required: true,
    },
    {
      name: 'options',
      type: 'UseLinkifyOptions',
      description: 'Configuration object.',
      required: false,
    },
    {
      name: 'options.patterns',
      type: 'LinkifyPattern[]',
      description:
        'Custom patterns to detect, in addition to (or, with hasBuiltins false, replacing) the built-in URL and email detection. Each pattern is a global-flag regex plus an href builder (capture groups available) and an optional label builder and isExternal flag. When matches overlap, the earliest one wins; at the same start, custom patterns win over the built-in ones.',
      required: false,
    },
    {
      name: 'options.hasBuiltins',
      type: 'boolean',
      description:
        'Include the built-in http(s) URL and email detection. Default true; set false when patterns should fully define what links.',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: '(return value)',
      type: 'ReactNode[]',
      description:
        'The text as a mix of plain strings and Link elements, one per match, ready to render inside a text container. Matched URLs open externally (isExternal), emails link as mailto:, and every link renders through Link — so a LinkProvider routes clicks client-side the same as a hand-written Link.',
    },
  ],
  usage: {
    description:
      'Finds URLs, email addresses and custom patterns in plain text and returns React nodes with a Link for each match; the links respect LinkProvider for client-side routing. Use it wherever user- or tool-authored plain text should grow safe, styled links without pre-parsing it into markup: activity feeds, comment threads, description fields. Custom patterns turn project-specific references (issue numbers like #123, ticket IDs) into links by supplying a regex plus an href builder — e.g. an issue tracker pattern that maps captures onto its URL scheme. When matches overlap, the earliest one wins, and at the same start a custom pattern wins over the built-in ones, so a custom #123 pattern coexists with URL detection in the same string.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render the returned nodes directly inside a text container (<p>{nodes}</p>); the hook already interleaves the unmatched plain text.',
      },
      {
        guidance: true,
        description:
          'Wrap the app (or the region) in LinkProvider so detected links route client-side instead of full-page navigating.',
      },
      {
        guidance: true,
        description:
          'Give a custom pattern the global flag (g). Without it the scan never advances, and when the text contains a match the render never finishes.',
      },
      {
        guidance: false,
        description:
          'Pre-parse the text into your own markup before linkifying — the hook exists so the plain string can be rendered as-is with links composed in.',
      },
    ],
  },
  relatedComponents: ['Link', 'LinkProvider'],
  importPath: '@astryxdesign/core',
  category: 'link',
}
```
