# Astryx component reference: hooks/useTreeFocus.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useTreeFocus.doc.mjs. Original SHA-256: 12a0daba4ea8715b18454a7e1dd78e6488f64f5717f29899a4a62d241066c89e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTreeFocus',
  displayName: 'useTreeFocus',
  keywords: ['tree', 'treeview', 'focus', 'keyboard', 'navigation', 'arrow', 'expand', 'collapse', 'roving', 'tabindex', 'a11y', 'wai-aria', 'apg'],
  params: [
    {
      name: 'options',
      type: 'UseTreeFocusOptions',
      description: 'Configuration object for tree focus behavior.',
      required: false,
    },
    {
      name: 'options.itemSelector',
      type: 'string',
      description: 'Selector for visible treeitems within the tree, in DOM order.',
      default: "'[role=\"treeitem\"]'",
      required: false,
    },
    {
      name: 'options.isItemDisabled',
      type: '(item: HTMLElement) => boolean',
      description: 'Predicate for whether a treeitem is disabled and must be skipped during navigation. Defaults to reading `data-tree-disabled` / `aria-disabled`.',
      required: false,
    },
    {
      name: 'options.getLevel',
      type: '(item: HTMLElement) => number',
      description: 'Reads the 1-based nesting level of a treeitem. Defaults to the `aria-level` attribute.',
      required: false,
    },
    {
      name: 'options.onToggleExpand',
      type: '(id: string) => void',
      description: 'Called to expand/collapse the treeitem with the given id (ArrowRight on a collapsed parent, ArrowLeft on an expanded parent, Enter/Space on a parent without its own action).',
      required: false,
    },
    {
      name: 'options.onActivate',
      type: '(item: HTMLElement, id: string | undefined) => boolean | void',
      description: 'Called when Enter/Space activates a treeitem. Return true when handled; return false/undefined to let the hook fall back to toggling expansion.',
      required: false,
    },
    {
      name: 'options.onActiveChange',
      type: '(id: string | undefined) => void',
      description: 'Notified when the hook moves focus to a treeitem. Consumers use this to move a single roving tab stop.',
      required: false,
    },
    {
      name: 'options.hasRovingTabIndex',
      type: 'boolean',
      description: 'When true, the hook owns a single roving tab stop across the visible treeitems (stamps tabindex 0/-1, repairs on mount, moves with navigation). Preserves an existing tabindex="0" seed on mount. Attach the returned `handleFocus` to keep the stop in sync after clicks.',
      default: 'false',
      required: false,
    },
    {
      name: 'options.typeahead',
      type: 'boolean',
      description: 'Whether typeahead (jump to next item whose text starts with the typed characters, ignoring case, accents, the stroked letters đ ł ø ħ ŧ ƀ and Turkish ı/İ in every locale) is enabled.',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'treeRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'Ref to attach to the tree container element (role="tree").',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: 'Key down handler to attach to the tree container.',
    },
    {
      name: 'handleFocus',
      type: '(e: React.FocusEvent) => void',
      description: 'Focus handler to attach to the container\'s onFocus. Keeps the roving tab stop in sync when hasRovingTabIndex is enabled; a no-op otherwise, so always safe to attach.',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: 'Focus the first enabled visible treeitem.',
    },
    {
      name: 'focusLast',
      type: '() => void',
      description: 'Focus the last enabled visible treeitem.',
    },
  ],
  usage: {
    description:
      'Manages roving-tabindex focus and the WAI-ARIA tree keyboard model. ArrowUp/ArrowDown/Home/End roam linearly over the visible treeitems (skipping disabled ones), while ArrowRight/ArrowLeft carry tree semantics (expand/collapse, move to first-child/parent). Enter/Space activate, and printable characters trigger typeahead.',
    bestPractices: [
      { guidance: true, description: 'Use for hierarchical tree widgets: wire onToggleExpand to your expansion state and onActiveChange to a single roving tab stop.' },
      { guidance: true, description: 'Attach both treeRef and handleKeyDown to the role="tree" container element.' },
      { guidance: false, description: 'Use for linear lists (prefer useListFocus) or 2D grids (prefer useGridFocus); those traversals differ from a tree.' },
    ],
  },
  relatedComponents: ['TreeList'],
  relatedHooks: ['useListFocus', 'useGridFocus', 'useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
}
```
