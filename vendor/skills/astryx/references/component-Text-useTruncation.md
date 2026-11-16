# Astryx component reference: Text/useTruncation.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Text/useTruncation.doc.mjs. Original SHA-256: 70972f783be9fef39dc9c68a8c0513007916613d2a10219ca2d0766fe2cd99ca.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTruncation',
  displayName: 'useTruncation',
  group: 'Text',
  keywords: [
    'truncation',
    'truncate',
    'ellipsis',
    'overflow',
    'line-clamp',
    'clamp',
    'tooltip',
    'full text',
    'text cut off',
    'table cell',
  ],
  params: [
    {
      name: 'options',
      type: 'UseTruncationOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.maxLines',
      type: 'number',
      description:
        'Maximum number of lines before truncation. 1 detects single-line overflow (scrollWidth against offsetWidth); values above 1 detect a -webkit-line-clamp cut by measuring the real content height with a Range, bypassing the clamped scrollHeight. 0 disables detection: isTruncated stays false and fullText stays empty.',
      required: true,
    },
    {
      name: 'options.isExpanded',
      type: 'boolean',
      description:
        'Pass true while the text is shown in full; the hook keeps reporting whether it is cut off when clamped.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<HTMLElement>',
      description:
        'Ref callback to attach to the text element being measured. Re-attaching to another element re-observes it and cleans up the previous observation.',
    },
    {
      name: 'isTruncated',
      type: 'boolean',
      description:
        'Whether the text is currently cut off. Drives composing a Tooltip with the full text: render the tooltip only when this is true, so a cell that fits shows none.',
    },
    {
      name: 'fullText',
      type: 'string',
      description:
        "The element's current text content, captured on every measurement, for the tooltip a truncated cell shows. Follows content changes that resize nothing (a fixed-width status line whose text swaps).",
    },
  ],
  usage: {
    description:
      "Detects whether an element's text is cut off — single-line overflow or clamped to several lines — and gives back the full text, updating when the size or the content changes. Built on a shared ResizeObserver and a shared MutationObserver, so hundreds of table cells create one observer of each kind, and a first measurement runs batched in a microtask after the commit instead of forcing a layout pass per text during mount. Use it wherever a truncated cell should show its full content only when it is actually truncated: compose a Tooltip off isTruncated and fullText instead of always rendering one. Text and Heading build their truncation tooltips on it; reach for it directly when composing truncation feedback into your own component.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Render the full-content Tooltip only when isTruncated is true, and read the tooltip text from fullText: a cell that fits shows no tooltip, and the text always matches what was measured.',
      },
      {
        guidance: true,
        description:
          'Apply the matching clamp yourself next to the hook — white-space: nowrap for maxLines 1, -webkit-line-clamp for more — so what the user sees and what the hook measures stay the same shape.',
      },
      {
        guidance: true,
        description:
          'Reuse one useTruncation instance per measured element; the ref callback cleans up its own observers, so swapping elements is safe.',
      },
      {
        guidance: false,
        description:
          'Compare scrollHeight to offsetHeight yourself for clamped text: with -webkit-line-clamp active browsers report the clamped size, which is exactly the case the Range measurement exists for.',
      },
    ],
  },
  relatedComponents: ['Text', 'Heading', 'Tooltip'],
  importPath: '@astryxdesign/core/Text',
  category: 'text',
}
```
