# Astryx component reference: Pagination/Pagination.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Pagination/Pagination.doc.mjs. Original SHA-256: ab355d6e495c53987f4a8070bc443753d2dd431ddd105ed2399777c273868291.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Pagination',
  displayName: 'Pagination',
  category: 'Navigation',
  keywords: ["pagination","pager","paginator","pagenavigation","paging","paginate","pages","pagecontrol"],
  props: [
    {
      name: 'page',
      type: 'number',
      description: 'Current page number (1-based). Page 1 is the first page.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(page: number) => void',
      description: 'Called when the page changes.',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(page: number) => void | Promise<void>',
      description:
        'Async action on page change. Fires after onChange and uses React transitions for built-in loading state.',
    },
    {
      name: 'totalItems',
      type: 'number',
      description:
        'Total number of items. Used to calculate page count. Takes precedence over totalPages if both provided.',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        'Total number of pages. Use when you know page count but not item count.',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description:
        'Whether more pages exist after the current one. Use for cursor-based pagination where total is unknown.',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: 'Number of items per page. Coerced to a positive integer; non-finite values fall back to the default.',
      default: '10',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description:
        'Available page size options. Shows a page size selector dropdown when provided.',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description:
        'Called when the page size changes. Automatically resets to page 1.',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'input' | 'none'",
      description:
        "Visual variant controlling what appears between prev/next buttons. 'pages' shows page number buttons with ellipsis, 'count' shows 'X-Y of Z' text, 'compact' shows 'Page X of Y' (add first/last buttons with hasFirstLast), 'dots' shows dot indicators, 'input' shows an editable page-number box with a leading label ('Page [ n ] / N') flanked by first/last buttons by default (the box needs a known total to clamp against, so it is disabled in cursor/hasMore mode), 'none' shows just prev/next buttons.",
      default: "'pages'",
    },
    {
      name: 'pageLabel',
      type: 'string',
      description:
        "The noun rendered before the editable box in the 'input' variant, e.g. 'Page' or 'Row'. Navigation is always page-based (via onChange); this only relabels the box. Defaults to the localized 'Page'.",
    },
    {
      name: 'hasFirstLast',
      type: 'boolean',
      description:
        "Whether to show first/last («/») double-chevron buttons flanking prev/next. Applies to the 'input' variant (shown unless false) and the 'compact' variant (shown only when true); other variants ignore it. Omitted when the page count is unknown (cursor/hasMore pagination).",
      default: "true for 'input'; false for 'compact'",
    },
    {
      name: 'step',
      type: 'number',
      description:
        'Number of pages the previous/next buttons advance per click. Clamped to the valid page range, so a step that would overshoot lands on the first/last page. When greater than 1, the buttons\' accessible names reflect the stride. Non-integer or values < 1 fall back to 1.',
      default: '1',
    },
    {
      name: 'siblingCount',
      type: 'number',
      description:
        "Number of page buttons to show on each side of the current page. Only applies when variant='pages'.",
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Size of the pagination controls.',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the component is disabled.',
      default: 'false',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the navigation landmark.',
      default: "'Pagination'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-pagination', visualProps: ['size', 'variant']},
      {className: 'astryx-pagination-dot', visualProps: ['size'], states: ['active']},
      {className: 'astryx-pagination-input-label', visualProps: ['size']},
      {className: 'astryx-pagination-input-total', visualProps: ['size']},
    ],
  },
  playground: {
    defaults: {
      page: 1,
      totalItems: 100,
      pageSize: 10,
      variant: 'pages',
    },
  },
  usage: {
    anatomy,
    description:
      'Pagination lets users step through pages of content. Place it below a table, list, or card grid so users can move forward and backward through results. Pick a variant to match the context: numbered pages for data tables, a count for large lists, compact for tight spaces, or dots for carousels.',
    bestPractices: [
      { guidance: true, description: 'Place pagination below the content it controls so users see results before navigating.' },
      { guidance: true, description: 'Use the pages variant for data tables where users need to jump to a specific page.' },
      { guidance: true, description: 'Use the count variant with a page size selector when users need to control how many items they see at once.' },
      { guidance: true, description: 'Use the dots variant for carousels and walkthroughs where the total is small and position matters more than a number.' },
      { guidance: true, description: 'Pass totalItems when the total is known so users can see how much content remains.' },
      { guidance: false, description: 'Show pagination when all items fit on a single page; there is nothing to paginate.' },
      { guidance: false, description: 'Use the dots variant for more than about 10 pages; the dots become too small to be useful.' },
      { guidance: false, description: 'Place pagination above the content; users expect it at the bottom.' },
    ],
  },
}
```
