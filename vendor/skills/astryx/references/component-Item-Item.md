# Astryx component reference: Item/Item.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Item/Item.doc.mjs. Original SHA-256: fde6daa9ca9d28442bc02fe2a2f914560cd47a70a0a7d7826e4add91028b6923.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Item',
  displayName: 'Item',
  group: 'Item',
  category: 'Table & List',
  isHiddenFromOverview: true,
  keywords: [
    'item',
    'list-item',
    'media-object',
    'row',
    'cell',
    'entity',
    'contact',
    'notification',
    'preview',
  ],
  playground: {
    defaults: {
      label: 'Item label',
      description: 'Supporting text',
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-item',
        visualProps: ['density', 'align'],
        states: ['highlighted', 'selected', 'disabled'],
      },
      {className: 'astryx-item-swipe-panel', visualProps: ['side']},
      {className: 'astryx-item-swipe-action', visualProps: ['variant']},
    ],
    vars: [
      {
        name: '--_item-label-color',
        description:
          'Color of the label line. Unset by default (the label uses the primary text token); a parent sets it to recolor the label it renders, as the destructive dropdown/context menu item does.',
        default: 'var(--color-text-primary)',
        private: true,
      },
      {
        name: '--_item-description-color',
        description:
          'Companion to --_item-label-color for the secondary description line.',
        default: 'var(--color-text-secondary)',
        private: true,
      },
      {
        name: '--_item-inset-inline',
        description:
          'Inline inset of the row. Item derives its paddingInline from this variable, and List reads it to place rows for its edge treatments (edge="flush", "outset", and "bleed"). Set paddingInline on `item` in a theme and both stay in sync.',
        default: 'var(--spacing-2) (var(--spacing-3) for density="spacious")',
        private: true,
      },
    ],
    derived: [{property: 'paddingInline', vars: ['--_item-inset-inline']}],
  },
  components: [
    {
      name: 'Item',
      displayName: 'Item',
      description:
        'A universal item primitive that unifies the "start content + label + description + end content" layout pattern. Use as a building block for list items, menu items, contact rows, notifications, and more.',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description:
            'Primary text identifying this item. Accepts string (auto-truncated) or ReactNode (for rich content).',
          required: true,
        },
        {
          name: 'marker',
          type: 'ReactNode',
          description:
            'Marker rendered before startContent as a direct flex child. Use for list bullets/counters that need custom baseline alignment.',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Content rendered before the label/description area, such as an icon, avatar, or checkbox.',
          slotElements: [
            {__element: 'Avatar', props: {name: 'Ada Lovelace', size: 'sm'}},
            {
              __element: 'Icon',
              props: {icon: 'info', size: 'sm', color: 'secondary'},
            },
          ],
        },
        {
          name: 'description',
          type: 'ReactNode',
          description:
            'Secondary text: subtitle, description, or supporting info.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered after the label/description area, such as badges, metadata, timestamps, or action buttons.',
          slotElements: [
            {__element: 'Badge', props: {label: 3}},
            {
              __element: 'Text',
              props: {color: 'secondary'},
              children: '2h ago',
            },
          ],
        },
        {
          name: 'as',
          type: "'div' | 'li' | 'span' | ElementType",
          description:
            "What the root renders as: an HTML element, or a component for a caller that needs the root to be something else. A menu row that navigates passes the application's link component here, so the row's root IS the anchor. Give a component only when the row carries a role, and only when no interactive node sits in startContent or endContent.",
          default: "'div'",
        },
        {
          name: 'align',
          type: "'center' | 'start' | 'first-line'",
          description:
            "Vertical alignment of start/end content slots. 'center' centers each slot on the whole text block; 'start' lines up slot tops with the text's top; 'first-line' centers each slot on the label's first line, so a small mark stays level with the first line of a wrapped label. A slot taller than that line moves the text down. The `item` theme target reflects the value as `align`.",
          default: "'center'",
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description:
            'Spacing density. "compact" uses 4px block padding, "balanced" uses 8px, and "spacious" uses 12px block and inline padding.',
          default: "'balanced'",
        },
        {
          name: 'labelLines',
          type: 'number',
          description: 'Max lines before label truncates with ellipsis.',
        },
        {
          name: 'descriptionLines',
          type: 'number',
          description: 'Max lines before description truncates with ellipsis.',
        },
        {
          name: 'layout',
          type: "'stacked' | 'inline'",
          description:
            'How the label and description sit together. stacked puts the description on its own line below the label; inline keeps both on one line, description ellipsizing first, so the row fits a fixed-height host.',
          default: "'stacked'",
        },
        {
          name: 'onClick',
          type: '(event: MouseEvent) => void',
          description:
            'Click handler. Makes the item clickable with button semantics.',
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
            'Link URL. Makes the item a link via an invisible anchor element. A row whose root is already a link component (see `as`) carries the address on that root instead, and no invisible anchor is rendered.',
        },
        {
          name: 'target',
          type: "'_blank' | '_self'",
          description:
            'Link target. Only used with href. target="_blank" automatically adds noopener noreferrer.',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            'Link relationship tokens. noopener noreferrer are merged automatically for target="_blank".',
        },
        {
          name: 'isHighlighted',
          type: 'boolean',
          description: 'Highlighted state (hover/keyboard focus appearance).',
          default: 'false',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: 'Selected state.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Disabled state. Interactive rows stay keyboard-reachable but cannot activate.',
          default: 'false',
        },
        {
          name: 'swipeActions',
          type: '{leading?: ItemSwipeAction[]; trailing?: ItemSwipeAction[]}',
          description:
            "Swipe actions for touch: the verbs a sideways drag uncovers on each side, outermost last, each `{id?, label, icon?, onActivate, isDisabled?, variant?: 'neutral' | 'accent' | 'destructive', hasRemoval?}`. `leading` is uncovered by a drag toward the inline end, `trailing` toward the inline start. A mouse never starts the drag and a mostly vertical drag stays the scroller's. The gesture is a touch accelerator and never a row's only path to a verb: a verb reachable only by swipe is unreachable by keyboard and by mouse, so every entry must also be reachable through the row's own content. Served on a row whose role permits interactive descendants (a listitem, a row with no role) and not on an option, a menu item, or a row that is the enlarged target of a native radio. The element containing the rows clips in the inline axis with overflow-inline: clip — List does; any other host does it once. `hasRemoval` only says the row holds out after the action fires instead of springing back. The gesture and its panels are loaded on demand the first time a row has swipe actions, so a row without them ships none of it.",
        },
        {
          name: 'swipeBehavior',
          type: "'reveal' | 'commit'",
          description:
            'What a swipe does. `reveal` rests the row open with every entry a real button after a fling or a drag past half the panel. A long drag fires the outermost; on a side with two or more entries, only a drag that starts on the open row fires it. `commit` slides the row out and fires the one entry of a side on a release past the commit point. Nothing rests, and the panel is presentational. On a side with two or more entries, `commit` fires none. A fling never fires an entry.',
          default: "'reveal'",
        },
        {
          name: 'ref',
          type: 'React.Ref<HTMLElement>',
          description:
            'Ref forwarded to the root element, whose type follows `as`.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
        },
        {
          name: 'className',
          type: 'string',
          description: 'CSS class name(s) for the root element.',
        },
        {
          name: 'style',
          type: 'React.CSSProperties',
          description: 'Inline styles for the root element.',
        },
        {
          name: 'data-testid',
          type: 'string',
          description: 'Test selector for automated testing frameworks.',
        },
      ],
    },
  ],
  usage: {
    description:
      'A single, flexible item primitive that unifies the "start content + label + description + end content" pattern across Astryx. Use it wherever you need a structured row: dropdown menus, selectors, contact lists, notifications, file browsers, and activity feeds.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use named slots (startContent, label, description, endContent) for the common layout. These cover the 80% case.',
      },
      {
        guidance: true,
        description:
          'Use density="compact" for menus and dense lists, "balanced" for standard rows, and "spacious" for roomier layouts.',
      },
      {
        guidance: true,
        description:
          'Set labelLines and descriptionLines to control truncation when content length varies.',
      },
      {
        guidance: true,
        description:
          'Use align="first-line" when a wrapping label sits beside a small mark (a status dot, a radio, a timestamp) that belongs to its first line. Use align="start" to line up the tops of a tall slot and the text.',
      },
      {
        guidance: true,
        description:
          'Give a swipe action a second home in the row (a menu or a button in endContent): the swipe is a touch accelerator, and a verb reachable only by swipe is unreachable by keyboard and by mouse.',
      },
      {
        guidance: false,
        description:
          "Don't nest interactive elements (buttons, links) inside an interactive Item; it creates confusing focus and click targets.",
      },
      {
        guidance: false,
        description:
          "Don't use Item for navigation between views; use proper navigation components instead.",
      },
      {
        guidance: false,
        description:
          "Don't add read/unread or inbox-specific behavior directly; compose a thin wrapper like PreviewItem instead.",
      },
    ],
    anatomy: [
      {
        name: 'Marker',
        required: false,
        description:
          'Optional list bullet/counter rendered before start content.',
      },
      {
        name: 'Start content',
        required: false,
        description: 'Leading visual: avatar, icon, image, or checkbox.',
      },
      {
        name: 'Label',
        required: true,
        description: 'Primary text identifying the item.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Secondary supporting text below the label.',
      },
      {
        name: 'End content',
        required: false,
        description:
          'End-aligned content: badges, timestamps, or action buttons.',
      },
    ],
  },
}
```
