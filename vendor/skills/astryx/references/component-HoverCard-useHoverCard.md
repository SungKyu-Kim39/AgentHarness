# Astryx component reference: HoverCard/useHoverCard.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/HoverCard/useHoverCard.doc.mjs. Original SHA-256: 820e7920a960e7dbbfc05d3ace49bdd5fc1abd92af60b90fd629b724c07de43b.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useHoverCard',
  displayName: 'useHoverCard',
  group: 'HoverCard',
  keywords: [
    'hovercard',
    'hover',
    'preview',
    'card',
    'tooltip',
    'popup',
    'floating',
    'anchor',
  ],
  params: [
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        "Position relative to the trigger. Logical: start/end resolve against the popover\'s own inherited direction (RTL mirrors in pure CSS).",
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
      description:
        'Delay before showing the hover card on hover, in milliseconds.',
      default: '300',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description:
        'Delay before hiding after mouse or focus leaves, in milliseconds.',
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
        'What a tap does where there is no hover. auto opens on tap unless the trigger performs an action of its own (an aria-disabled control performs none); tap always opens; none never opens on touch.',
      default: "'auto'",
    },
    {
      name: 'isEnabled',
      type: 'boolean',
      description: 'Whether hover and focus triggers are enabled.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the hover card popup. When provided, the popup is exposed as a named role="dialog"; when omitted, it falls back to role="group" (a group may validly be unnamed).',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Controlled open state. true force-shows, false force-hides, undefined lets hover/focus manage visibility.',
    },
    {
      name: 'isDefaultOpen',
      type: 'boolean',
      description: 'Whether the hover card should be shown on mount.',
      default: 'false',
    },
    {
      name: 'onShow',
      type: '() => void',
      description: 'Callback fired when the hover card becomes visible.',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'Callback fired when the hover card is hidden.',
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<HTMLElement>',
      description:
        'Combined ref that sets both position and interaction on the same trigger element.',
    },
    {
      name: 'positionRef',
      type: 'RefCallback<HTMLElement>',
      description:
        'Ref for the positioning anchor element. Use when position and interaction live on different elements.',
    },
    {
      name: 'interactionRef',
      type: 'RefCallback<HTMLElement>',
      description:
        'Ref for the hover/focus interaction element. Use with positionRef for split trigger patterns.',
    },
    {
      name: 'anchorId',
      type: 'string',
      description: 'CSS anchor name for advanced positioning cases.',
    },
    {
      name: 'describedBy',
      type: 'string',
      description: 'ID to compose into aria-describedby on the trigger.',
    },
    {
      name: 'renderHoverCard',
      type: "(children: ReactNode, props?: Omit<ContextRenderProps, 'positioning'>) => ReactNode",
      description:
        'Render function for the anchor-positioned hover card content. The positioning opt-out is excluded: the hover card always derives its position from placement/alignment.',
    },
    {
      name: 'show',
      type: '() => void',
      description: 'Imperatively show the hover card immediately.',
    },
    {
      name: 'hide',
      type: '() => void',
      description: 'Imperatively hide the hover card immediately.',
    },
  ],
  usage: {
    description:
      'Headless hook for hover-triggered floating cards. Builds on useLayer with hover/focus intent detection, configurable delays, safe hover behavior, and accessible aria-describedby linking. Use for rich previews on hover when you need full control over the trigger or rendered content.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for rich content previews such as user profiles, entity summaries, and link previews.',
      },
      {
        guidance: true,
        description:
          'Prefer the HoverCard component for standard trigger-content pairs; use the hook for custom trigger patterns.',
      },
      {
        guidance: false,
        description:
          'Use for simple text hints: use Tooltip or useTooltip instead.',
      },
    ],
  },
  relatedComponents: ['HoverCard', 'Tooltip', 'Popover'],
  relatedHooks: ['useLayer', 'useTooltip', 'usePopover'],
  importPath: '@astryxdesign/core/HoverCard',
  category: 'interaction',
}
```
