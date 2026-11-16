# Astryx component reference: HoverCard/HoverCard.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/HoverCard/HoverCard.doc.mjs. Original SHA-256: 109a6d4ca5cf1ce5d09f453fc70e3fcddb3423c6c84e52a9c515d61838cce750.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'HoverCard',
  displayName: 'Hover Card',
  group: 'HoverCard',
  category: 'Overlay',
  keywords: [
    'hovercard',
    'hover card',
    'popover',
    'tooltip',
    'preview card',
    'flyout',
    'overlay',
    'hover popup',
  ],
  playground: {
    defaults: {
      content: {
        __element: 'Text',
        props: {type: 'body'},
        children: 'Additional details shown on hover.',
      },
      children: {
        __element: 'Link',
        props: {href: '#'},
        children: 'Hover for details',
      },
    },
  },
  theming: {
    targets: [{className: 'astryx-hover-card'}],
    vars: [
      {
        name: '--_hovercard-radius',
        description: 'Border radius of the hover card',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_hovercard-radius']}],
  },
  components: [
    {
      name: 'HoverCard',
      displayName: 'Hover Card',
      description:
        'Component wrapper for hover card display: a richer, larger overlay triggered on hover or focus.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'The trigger. Text children, a string or number or text written around an expression such as `Edited {when}`, are wrapped in a focusable inline span; holes such as `false` and `null` are ignored. With element children, HoverCard wires the first element, so that element does not need to accept a ref.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Hover card content.',
          required: true,
          slotElements: [
            {
              __element: 'Text',
              props: {type: 'body'},
              children: 'Content text',
            },
          ],
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description:
            "Position relative to the anchor element. Logical: start/end resolve against the popover\'s own inherited direction (RTL mirrors in pure CSS).",
          default: "'above'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            "Alignment along the placement axis. Logical: start/end resolve against the popover\'s own inherited direction (RTL mirrors in pure CSS).",
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description:
            'When focus should open the hover card. auto opens when the trigger itself takes focus, or focus lands inside a trigger that is focusable at that moment, so a roving-tabindex member opens when the arrow keys reach it.',
          default: "'auto'",
        },
        {
          name: 'touchTrigger',
          type: "'auto' | 'tap' | 'none'",
          description:
            'What a tap does where there is no hover. auto opens on tap unless the trigger performs an action of its own (a button, link, or form control), whose tap belongs to the control; an aria-disabled control performs none, so a tap on it opens its reason. tap always opens. none never opens on touch. A tap-opened card is dismissed by a tap outside it.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible name for the hover card popup. When provided, the popup is exposed as a named role="dialog"; when omitted, it falls back to role="group" (a group may validly be unnamed).',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when hover card visibility changes. Called with true when shown and false when hidden.',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description:
            'Shows a dashed underline on a text trigger. auto shows it when children is text: strings and numbers, such as `Edited {when}`, with holes such as `false` and `null` ignored. It has no effect on an element trigger, which keeps its own styling.',
          default: "'auto'",
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description:
            'Whether the hover card should be shown on mount. Still dismissible.',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            'Controlled open state. true holds the card open. false holds it closed against hover and focus. A controlled card answers Escape by calling onOpenChange(false) without closing; it closes when you set isOpen to false, and focus inside the card then returns to the trigger.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for the card surface, the element that carries the hover-card theme target.',
        },
        {
          name: 'className',
          type: 'string',
          description:
            'Class name added to the card surface, beside the hover-card target class.',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: 'Inline styles for the card surface.',
        },
      ],
    },
  ],
  usage: {
    description:
      'HoverCard shows additional information when the user hovers or focuses a trigger element. Use it for profile cards, link summaries, or inline definitions where the user needs more context without navigating away.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep content supplementary; hover cards should enhance understanding without blocking the primary workflow.',
      },
      {
        guidance: true,
        description:
          'Provide a dashed underline on text triggers so users know the element is hoverable.',
      },
      {
        guidance: true,
        description:
          'Use the hook API (useHoverCard) when you need more control over timing or placement.',
      },
      {
        guidance: true,
        description:
          'Leave touchTrigger on auto so a tap opens the card on triggers that do nothing else, and stays out of the way on triggers that perform an action.',
      },
      {
        guidance: false,
        description:
          'Place critical actions or required information inside a hover card; users may miss content that only appears on hover.',
      },
      {
        guidance: false,
        description:
          'Use a hover card when a simple Tooltip or Popover would suffice.',
      },
      {
        guidance: false,
        description:
          'Use a HoverCard for content the user must interact with; it disappears when the cursor leaves.',
      },
      {
        guidance: false,
        description:
          'Put the trigger inside SVG <foreignObject>. In Chromium it cannot be a CSS anchor, so the card opens at the viewport corner. Render the trigger in an HTML layer positioned over the SVG node instead, and keep the SVG for shapes, edges and labels.',
      },
      {
        guidance: true,
        description:
          'Prefer placing HoverCard in a block context rather than directly in a <p>, heading, or link. Those placements are supported when necessary through a corrective portal, but the DOM and tab order may differ.',
      },
    ],
    anatomy: [
      {
        name: 'Trigger',
        required: true,
        description:
          'The element that opens the hover card on hover or focus: a button, link, or inline text.',
      },
      {
        name: 'Card',
        required: true,
        description:
          'The floating overlay with the preview content, anchored to the trigger.',
      },
      {
        name: 'Body',
        required: true,
        description:
          'The main content area: profile info, link summary, or any rich content.',
      },
      {
        name: 'Actions',
        required: false,
        description:
          'Optional buttons inside the card for follow-up actions like Follow or Message.',
      },
    ],
  },
}
```
