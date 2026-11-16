# Astryx component reference: Outline/useOutlineFromDOM.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Outline/useOutlineFromDOM.doc.mjs. Original SHA-256: 2f6aa77138455cdc5ee0e39e7ae0026129c5a684bd0386718dc1181ee179afdb.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useOutlineFromDOM',
  displayName: 'useOutlineFromDOM',
  keywords: [
    'outline',
    'table of contents',
    'toc',
    'headings',
    'dom',
    'same-page navigation',
  ],
  params: [
    {
      name: 'containerRef',
      type: 'React.RefObject<HTMLElement | null>',
      description:
        'The element that holds the headings. The hook reads h1 through h6 inside it.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'items',
      type: 'OutlineItem[]',
      description:
        "One item per heading that has both an id and text, in document order, ready for Outline's items prop. id is the heading's id, label is its trimmed text, and level is its depth from 1 to 6.",
    },
  ],
  usage: {
    description:
      'Builds outline items from the headings already in the page. Use it when the article is not a Markdown string, and pass the items to Outline. The list updates when headings are added, removed, renamed, or given a new id. A null ref returns an empty list.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put an id on every heading the outline should list. A heading with no id, or with no text, is omitted.',
      },
      {
        guidance: true,
        description:
          'Point the ref at the article, not the page, so headings outside the article stay out of the outline.',
      },
      {
        guidance: false,
        description:
          'Expect the hook to invent ids. It only reads the ids the headings already have.',
      },
      {
        guidance: false,
        description:
          'Use it for a Markdown string. useOutlineFromMarkdown follows the same parser and slugs as Markdown.',
      },
    ],
  },
  relatedComponents: ['Outline'],
  relatedHooks: ['useOutlineFromMarkdown'],
  importPath: '@astryxdesign/core/Outline',
  category: 'Navigation',
}
```
