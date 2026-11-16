# Astryx component reference: hooks/useGridFocus.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useGridFocus.doc.mjs. Original SHA-256: 4392648ec48d106d1d5a10481c3aa111c7de7c9764cf1ff57d2370830fa45e5a.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useGridFocus',
  displayName: 'useGridFocus',
  keywords: [
    'grid',
    'focus',
    'keyboard',
    'navigation',
    'arrow',
    'calendar',
    'a11y',
    'wai-aria',
    'cells',
  ],
  params: [
    {
      name: 'options',
      type: 'UseGridFocusOptions',
      description: 'Configuration object for grid focus behavior.',
      required: true,
    },
    {
      name: 'options.columns',
      type: 'number',
      description:
        'Number of columns in the grid. Used for up/down navigation (moves by this many cells).',
      required: true,
    },
    {
      name: 'options.cellSelector',
      type: 'string',
      description:
        'Selector for cells within the grid. Should match ALL cell positions in DOM order (including disabled/empty) so grid geometry is preserved.',
      default: '\'button:not([disabled]), [tabindex]:not([tabindex="-1"])\'',
      required: false,
    },
    {
      name: 'options.isCellFocusable',
      type: '(cell: HTMLElement) => boolean',
      description:
        'Predicate for whether a matched cell can receive focus. Omit to treat every matched cell as focusable.',
      required: false,
    },
    {
      name: 'options.getFocusTarget',
      type: '(cell: HTMLElement) => HTMLElement | null',
      description:
        'Resolves the element to focus for a cell, e.g. a button inside a role="gridcell" wrapper. Omit to focus the cell itself.',
      required: false,
    },
    {
      name: 'options.onNavigateBefore',
      type: '(column: number, offset: number) => void',
      description:
        'Callback when navigation would go before the first cell. Receives the column index and offset (1 for horizontal, columns for vertical).',
      required: false,
    },
    {
      name: 'options.onNavigateAfter',
      type: '(column: number, offset: number) => void',
      description:
        'Callback when navigation would go after the last cell. Receives the column index and offset.',
      required: false,
    },
    {
      name: 'options.onPageUp',
      type: '(event: React.KeyboardEvent) => void',
      description:
        'Callback for Page Up key (e.g., navigate to previous month in calendars). Receives the key event, so `event.shiftKey` can select a larger step, such as a year.',
      required: false,
    },
    {
      name: 'options.onPageDown',
      type: '(event: React.KeyboardEvent) => void',
      description:
        'Callback for Page Down key (e.g., navigate to next month in calendars). Receives the key event, so `event.shiftKey` can select a larger step, such as a year.',
      required: false,
    },
    {
      name: 'options.hasRovingTabIndex',
      type: 'boolean',
      description:
        'Own a single roving tab stop across the grid: one focusable cell (its resolved focus target) carries tabindex="0", the rest -1. Stamped/repaired on render and moved with arrow navigation. Attach the returned handleFocus to the container onFocus.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'gridRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'Ref to attach to the grid container element.',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: 'Key down handler to attach to the grid container.',
    },
    {
      name: 'handleFocus',
      type: '(e: React.FocusEvent) => void',
      description:
        'Focus handler for the grid container. Keeps the roving tab stop in sync when hasRovingTabIndex is enabled; a no-op otherwise, so always safe to attach.',
    },
    {
      name: 'focusCell',
      type: '(index: number) => void',
      description: 'Focus a specific cell by index (clamped to valid range).',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: 'Focus the first focusable cell in the grid.',
    },
    {
      name: 'focusLast',
      type: '() => void',
      description: 'Focus the last focusable cell in the grid.',
    },
  ],
  usage: {
    description:
      'Manages keyboard navigation within a 2D grid following the WAI-ARIA grid pattern. Supports arrow keys for cell-to-cell navigation, Home/End for row boundaries, Ctrl+Home/Ctrl+End for grid boundaries, and Page Up/Down for custom callbacks (e.g., month navigation in calendars). Boundary navigation callbacks allow cross-grid navigation.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for calendar date grids: wire onPageUp/onPageDown to month navigation and onNavigateBefore/onNavigateAfter for cross-month arrow key navigation.',
      },
      {
        guidance: true,
        description:
          'Attach both gridRef and handleKeyDown to the grid container element.',
      },
      {
        guidance: true,
        description:
          'For roving-tabindex grids (e.g. Calendar), set hasRovingTabIndex: true and attach handleFocus to the container onFocus; seed one focus target with tabindex=0 and the hook repairs and moves it.',
      },
      {
        guidance: false,
        description:
          'Use for simple linear lists; prefer useListFocus for 1D navigation.',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useListFocus', 'useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
}
```
