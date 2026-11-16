# Astryx component reference: TreeList/TreeList.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TreeList/TreeList.doc.mjs. Original SHA-256: 7e506f201e3c10b8ad54d6a43efe1091af21f4aca1a42ee37e27aea170f04dc1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TreeList',
  displayName: 'Tree List',
  group: 'TreeList',
  category: 'Table & List',
  keywords: ['tree', 'hierarchy', 'nested', 'accordion', 'folder', 'expand', 'collapse', 'treeview', 'outline'],
  playground: {
    defaults: {
      items: [
        {id: '1', label: 'Documents', children: [
          {id: '1a', label: 'Report.pdf'},
          {id: '1b', label: 'Notes.md'},
        ]},
        {id: '2', label: 'Images', children: [
          {id: '2a', label: 'Photo.jpg'},
        ]},
        {id: '3', label: 'README.md'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-tree-list', visualProps: ['density', 'variant']},
      {className: 'astryx-tree-list-item', visualProps: ['density'], states: ['selected', 'disabled']},
      {className: 'astryx-tree-list-chevron', states: ['state']},
      {className: 'astryx-tree-list-item-label', states: ['selected']},
      {className: 'astryx-tree-list-guide'},
    ],
    vars: [
      {name: '--tree-list-indent', description: 'Per-level indentation step. Each nesting level indents its rows by this distance, and the guide lines follow it so they stay aligned. Set it on the `tree-list` target to retune the metric (e.g. `var(--spacing-5)` for a wider indent).', default: 'var(--spacing-4)'},
      {name: '--tree-list-row-gap', description: 'Vertical gap between adjacent rows. Default `2px` (var(--spacing-0-5)) gives a subtle separation; set it on the `tree-list` target to widen or close the gap. The connector guides span the gap automatically (the line stays continuous) and do not overhang the last row, so no guide-height tuning is needed.', default: 'var(--spacing-0-5)'},
      {name: '--_tree-indent', description: 'Distance one row is indented, computed per row from --tree-list-indent and the row depth. Set --tree-list-indent to retune indentation; this is the resolved value.', default: '0px', private: true},
      {name: '--_tree-focus-z', description: 'Stacking order of a row while its treeitem has keyboard focus, published by each treeitem so its focused row paints above the guide lines. Not a theming lever.', default: 'auto', private: true},
    ],
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description:
        'Tree list container. Accepts items data and rendering configuration. Expansion state is managed internally.',      props: [
        {
          name: 'items',
          type: 'TreeListItemData[]',
          description:
            'Recursive tree item data with id, label, optional children and isExpanded, plus optional xstyle, className, and style applied to that item row.',
          required: true,
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Spacing density for items.',
          default: "'balanced'",
        },
        {
          name: 'variant',
          type: "'lineGuides' | 'noGuides'",
          description:
            'Visual treatment of the hierarchy guide lines. lineGuides shows connector lines; noGuides hides them, keeping indentation. Orthogonal to density.',
          default: "'lineGuides'",
        },
        {
          name: 'animatedLayout',
          type: 'AnimatedLayout',
          description:
            'The handle from useAnimatedLayout({containerRef}). With it, expanding or collapsing a row glides the rows and content after it, up to that container, on one shared motion role instead of jumping, and the shown rows and the chevron move on the same motion. Without it, the content after the row takes its place at once.',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Header content, associated with the tree via aria-labelledby.',
          slotElements: [{__element: 'Text', props: {type: 'body'}, children: 'Header'}],
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      'An expandable tree structure for displaying hierarchical data with branch connector lines. Use it for file explorers, nested category browsers, or any interface that visualizes parent-child relationships. Under a finger, expanding a row glides the rows below it while its children fade in on the same timing, and a collapse plays it back; pass an `animatedLayout` handle for content after the tree to glide too.',
    bestPractices: [
      {guidance: true, description: 'Provide meaningful labels and icons for each node to make the hierarchy easy to scan.'},
      {guidance: true, description: 'Pre-expand important branches so users see key content immediately.'},
      {guidance: true, description: 'Leaf rows reserve space for a chevron column whenever the tree has any expandable item to line up under; only a fully flat tree (no expandable items at all) renders its rows flush. Rely on this rather than nudging indentation with custom CSS.'},
      {guidance: false, description: 'Nest more than 4–5 levels deep; flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data; use a List instead.'},
    ],
  },
}
```
