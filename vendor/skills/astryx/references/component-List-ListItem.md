# Astryx component reference: List/ListItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/List/ListItem.doc.mjs. Original SHA-256: eecf44641a366ecaa3236dca74c47ecfa6ac4af93ab90c0cd755c5cb84f87eb1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ListItem',
  subComponentOf: 'List',
  displayName: 'List Item',
  isHiddenFromOverview: true,
  description:
    'List item with label, description, start/end content slots, and interactive patterns.',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Primary content. A plain string gets single-line truncation automatically; a ReactNode renders as given, so child components control their own text behavior.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        'Secondary content below the label. A plain string gets single-line truncation automatically; a ReactNode lets child components control their own wrapping and line-clamp behavior.',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description:
        'Content rendered before the label area (e.g. icon, avatar).',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered after the label area (e.g. badge, chevron).',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Click handler; enables the invisible button pattern.',
    },
    {
      name: 'interactiveRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        "Ref to a nested control (e.g. a checkbox in startContent) that owns the item's keyboard access and action. The row becomes an enlarged click/tap target that delegates surface clicks to it (useClickableContainer) and renders no invisible button/anchor, so the row adds no second tab stop (WCAG 4.1.2). Mutually exclusive with onClick/href; those are ignored when set.",
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Link URL; enables the invisible anchor pattern. The destination follows the shared navigation rule described on the Link `href` prop.',
    },
    {
      name: 'target',
      type: 'string',
      description:
        'Link target attribute, only applicable when href is provided. target="_blank" automatically adds noopener noreferrer.',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        'Link relationship tokens. noopener noreferrer are merged automatically for target="_blank".',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        'Vertical alignment of the start and end content against the label, passed through to Item unchanged. `first-line` keeps a small mark (a status dot, an icon) level with the first line of a wrapped label. See Item.align.',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disabled state; interactive rows stay keyboard-reachable, expose aria-disabled, and cannot activate.',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: 'Selected state; marks the item as the current one with aria-current="true" (a list item cannot carry aria-selected).',
      default: 'false',
    },
    {
      name: 'itemKey',
      type: 'string | number',
      description: "The row's item key, a string or a number from the data (the shape Table's idKey returns). It is the row's identity for the list's animated layout (List animatedLayout): with a handle, the list matches rows by it to animate inserts, removals and moves, and a row without one changes at once. In a reorderable List (List reorderable), it is the key the reorderable object's onReorder reports and isReorderable is asked about, and a row without one has no reorder handle and keeps its place. Separate from React's key.",
    },
    {
      name: 'swipeActions',
      type: '{leading?: ItemSwipeAction[]; trailing?: ItemSwipeAction[]}',
      description:
        "Swipe actions for touch, passed through to Item unchanged: the verbs a sideways drag uncovers on each side, each `{id?, label, icon?, onActivate, isDisabled?, variant?: 'neutral' | 'accent' | 'destructive', hasRemoval?}`. See Item.swipeActions; List clips its rows in the inline axis for them.",
    },
    {
      name: 'swipeBehavior',
      type: "'reveal' | 'commit'",
      description:
        'What a swipe does, passed through to Item unchanged. See Item.swipeBehavior.',
      default: "'reveal'",
    },
  ],
}
```
