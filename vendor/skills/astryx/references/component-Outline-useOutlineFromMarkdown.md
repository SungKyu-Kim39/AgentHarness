# Astryx component reference: Outline/useOutlineFromMarkdown.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Outline/useOutlineFromMarkdown.doc.mjs. Original SHA-256: 7da27b31bc5f28ada2d4c6e5e53892b380012e8ebf658048b9900e33ec95c92d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useOutlineFromMarkdown',
  displayName: 'useOutlineFromMarkdown',
  keywords: [
    'outline',
    'table of contents',
    'toc',
    'markdown',
    'headings',
    'heading ids',
    'same-page navigation',
  ],
  params: [
    {
      name: 'markdown',
      type: 'string',
      description:
        'The Markdown source. Pass the same string you render with Markdown.',
      required: true,
    },
    {
      name: 'options',
      type: 'ParseOutlineFromMarkdownOptions',
      description:
        'Parse options. Omit them for a document that Markdown renders without plugins.',
      required: false,
    },
    {
      name: 'options.plugins',
      type: 'ReadonlyArray<MarkdownPluginEntry>',
      description:
        'The ordered Markdown plugin list. Pass the same list to Markdown, so transforms, labels and ids agree. The outline is recomputed when the list reference changes.',
      required: false,
    },
    {
      name: 'options.isFinal',
      type: 'boolean',
      description:
        "Whether the source is complete. Pass false while Markdown's isStreaming is true, so both apply the same transforms.",
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'items',
      type: 'OutlineItem[]',
      description:
        "One item per root heading, in document order, ready for Outline's items prop. id is the id Markdown renders on the heading in a complete document without sources, label is the heading's text, and level is its depth from 1 to 6.",
    },
  ],
  usage: {
    description:
      'Extracts the headings of a Markdown string for an Outline next to the rendered document. It uses the parser and heading slugs that Markdown uses, so in a complete document each item links to its heading, and fenced code never counts as a heading. The result is memoized on the source and the options. Outside React, use parseOutlineFromMarkdown.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the same string, plugin list and finality to Markdown and this hook, so items match the rendered headings once the content is complete.',
      },
      {
        guidance: true,
        description:
          'Declare the plugin list outside the component or memoize it. A new array on each render recomputes the outline.',
      },
      {
        guidance: true,
        description:
          'For several documents on one page, install one createMarkdownHeadingLinks per document with headingIdPrefix, so their ids do not collide.',
      },
      {
        guidance: false,
        description:
          'Write the items by hand or find headings with a regular expression. They drift from the rendered ids.',
      },
      {
        guidance: false,
        description:
          'Expect every item to have a target while content streams. Markdown reveals text gradually and trims unfinished syntax, so a heading can be absent or have another id until the content is complete.',
      },
      {
        guidance: false,
        description:
          "Expect an item to link to a heading that cites a Markdown sources entry. The hook does not receive sources, so the ids differ: for '# Intro [ref]', Markdown renders intro and the hook returns intro-ref.",
      },
      {
        guidance: false,
        description:
          'Expect an item for a nested heading, such as one in a blockquote. Only root headings become items.',
      },
    ],
  },
  relatedComponents: ['Outline', 'Markdown'],
  importPath: '@astryxdesign/core/Outline',
  category: 'Navigation',
}
```
