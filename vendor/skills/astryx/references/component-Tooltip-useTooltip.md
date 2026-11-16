# Astryx component reference: Tooltip/useTooltip.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Tooltip/useTooltip.doc.mjs. Original SHA-256: 9685c36650b8cff4cda4882576352c5ab1ba0af2bfc0f5b99e4683b134a84f49.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTooltip',
  displayName: 'useTooltip',
  group: 'Tooltip',
  keywords: ['tooltip', 'hint', 'label', 'hover', 'info', 'title', 'floating'],
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
      description: 'Delay before showing on hover, in milliseconds.',
      default: '200',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description:
        'Delay before hiding after mouse or focus leaves, in milliseconds.',
      default: '0',
    },
    {
      name: 'focusTrigger',
      type: "'auto' | 'always' | 'never'",
      description:
        'When focus should open the tooltip. auto opens when the trigger itself takes focus, or focus lands inside a trigger that is focusable at that moment, so a roving-tabindex member opens when the arrow keys reach it.',
      default: "'auto'",
    },
    {
      name: 'touchTrigger',
      type: "'auto' | 'tap' | 'none'",
      description:
        'What a tap does where there is no hover. auto opens on tap unless the trigger performs an action of its own (an aria-disabled control performs none); tap always opens (a button whose only job is revealing the tooltip); none never opens on touch.',
      default: "'auto'",
    },
    {
      name: 'isEnabled',
      type: 'boolean',
      description: 'Whether hover and focus triggers are enabled.',
      default: 'true',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Controlled open state. true force-shows; false force-hides, and focus that would show it calls onShow; undefined lets hover/focus manage visibility.',
    },
    {
      name: 'isDefaultOpen',
      type: 'boolean',
      description: 'Whether the tooltip should be shown on mount.',
      default: 'false',
    },
    {
      name: 'onShow',
      type: '() => void',
      description:
        'Callback fired when the tooltip becomes visible. Under isOpen={false}, it reports focus that would show the tooltip.',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'Callback fired when the tooltip is hidden.',
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
      description: 'Ref for the positioning anchor element.',
    },
    {
      name: 'interactionRef',
      type: 'RefCallback<HTMLElement>',
      description: 'Ref for the hover/focus interaction element.',
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
      name: 'renderTooltip',
      type: "(children: ReactNode, props?: Omit<ContextRenderProps, 'positioning'>) => ReactNode",
      description:
        'Render function for the anchor-positioned tooltip content. The positioning opt-out is excluded: the tooltip always derives its position from placement/alignment.',
    },
    {
      name: 'show',
      type: '() => void',
      description:
        'Opens the tooltip now and keeps it open until hide(), Escape, a press outside, or focus leaving its trigger. Its text is announced once, and onShow fires. Under a controlled isOpen it only calls onShow. Does nothing while isEnabled is false.',
    },
    {
      name: 'hide',
      type: '() => void',
      description:
        'Closes the tooltip now, and onHide fires. Under a controlled isOpen it only calls onHide.',
    },
  ],
  usage: {
    description:
      'Headless hook for hover/focus-triggered tooltips. Builds on useLayer with hover intent, keyboard focus handling, and accessible aria-describedby linking. Use for custom trigger elements that need tooltip behavior without the wrapper component.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for brief text labels that describe icon buttons, truncated text, abbreviations, or compact controls.',
      },
      {
        guidance: true,
        description:
          'Prefer the Tooltip component for standard wrapping; use the hook when the trigger is not a simple child.',
      },
      {
        guidance: true,
        description:
          'For a toggle-style trigger, have your own button call show() and hide() on each press. Give it aria-describedby and aria-controls set to describedBy, and aria-expanded (true while show() holds the tooltip, false after hide() or onHide), and keep its own accessible name. For an info icon, use InfoTip instead.',
      },
      {
        guidance: false,
        description:
          'Put interactive content inside tooltips: use Popover or HoverCard instead.',
      },
    ],
  },
  relatedComponents: ['Tooltip', 'HoverCard', 'Popover'],
  relatedHooks: ['useLayer', 'useHoverCard', 'usePopover'],
  importPath: '@astryxdesign/core/Tooltip',
  category: 'interaction',
}
```
