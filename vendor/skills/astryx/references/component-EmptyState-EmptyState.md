# Astryx component reference: EmptyState/EmptyState.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/EmptyState/EmptyState.doc.mjs. Original SHA-256: 70b2a4fdc063f21619bfd205ae99712ec2366600fa97c217ba51a45341d011d5.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'EmptyState',
  displayName: 'Empty State',
  category: 'Content',
  keywords: ["emptystate","empty","placeholder","nodata","blank","noresults","illustration","blankslate"],
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        'Primary message rendered as the configured heading level inside the empty state.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Optional secondary text providing additional context below the title.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Optional icon or illustration displayed above the title; rendered as decorative (aria-hidden="true").',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        'Optional action buttons displayed below the description, laid out horizontally by default and stacked vertically when isCompact is true.',
      slotElements: [{__element: 'Button', props: {label: 'Action', variant: 'secondary'}}],
    },
    {
      name: 'headingLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'Controls only the rendered HTML heading tag (h1-h6) so the title fits the document outline. This is a semantic change for accessibility and does not change the visual size of the title, which stays fixed regardless of level.',
      default: '3',
    },
    {
      name: 'isCompact',
      type: 'boolean',
      description:
        'Enables the compact variant with reduced spacing for constrained content areas.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  playground: {
    defaults: {
      title: 'No results found',
      description: 'Try adjusting your search or filter criteria.',
      actions: {__element: 'Button', props: {label: 'Clear filters', variant: 'secondary'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-empty-state', visualProps: ['variant']},
      {className: 'astryx-empty-state-title', visualProps: ['variant']},
      {className: 'astryx-empty-state-description', visualProps: ['variant']},
    ],
  },
  usage: {
    description: 'EmptyState shows a placeholder when a content area has no data. Use it for empty lists, zero search results, first-time setups, or cleared inboxes. Always include a title and a next step so the user is not stuck.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: true, description: 'Use the compact variant inside cards or sidebars where space is limited.' },
      { guidance: false, description: 'Leave an empty state without guidance; always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use a generic message like "No data"; be specific about what is empty and why.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action; use a Banner instead.' },
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'The centered root that owns spacing, reading order, and the compact layout variant.'},
      {name: 'Icon', required: false, description: 'A visual cue above the title that reinforces the context, like a search icon for no results.'},
      {name: 'Title', required: true, description: 'Primary message explaining what is empty: "No projects yet" not "No data".'},
      {name: 'Description', required: false, description: 'Additional context explaining why it is empty or what the user can do.'},
      {name: 'Actions', required: false, description: 'One or two buttons guiding the user to a next step, like "Create project" or "Clear filters".'},
    ],
  },
}
```
