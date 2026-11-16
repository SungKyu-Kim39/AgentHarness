# Astryx component reference: Tooltip/Tooltip.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Tooltip/Tooltip.doc.mjs. Original SHA-256: 6bb8a91786d4e243c2ded9efbd6fc4382293060207431d7d19706e5a62963fd8.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Tooltip',
  displayName: 'Tooltip',
  group: 'Tooltip',
  category: 'Overlay',
  playground: {
    defaults: {
      content: 'Helpful tooltip text',
      children: {
        __element: 'Button',
        props: {label: 'Hover me', variant: 'secondary'},
      },
    },
  },
  keywords: [
    'tooltip',
    'hint',
    'infotip',
    'title',
    'hover',
    'flyout',
    'balloon',
    'helpertext',
  ],
  components: [
    {
      name: 'Tooltip',
      displayName: 'Tooltip',
      description:
        'Component wrapper for tooltip display triggered on hover or focus.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element(s) that activate the tooltip.',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description: 'External anchor ref for sibling mode.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Tooltip content, typically short text.',
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the tooltip.',
          default: "'auto'",
        },
        {
          name: 'touchTrigger',
          type: "'auto' | 'tap' | 'none'",
          description:
            'What a tap does where there is no hover. auto opens on tap unless the trigger performs an action of its own (a button, link, or form control), whose tap belongs to the control; an aria-disabled control performs none, so a tap on it opens its reason. tap always opens, for a button whose only job is to reveal the tooltip; for an info icon, use InfoTip. none never opens on touch.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the tooltip triggers.',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when tooltip visibility changes. Called with true when shown and false when hidden.',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: 'Shows a dashed underline on the trigger element.',
          default: "'auto'",
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description:
            'Whether the tooltip should be shown on mount. Still dismissible.',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            'Controlled open state for the tooltip. Held closed, focus that would open it calls onOpenChange(true) and shows nothing; held open, Escape calls onOpenChange(false) and it stays.',
        },
      ],
    },
  ],
  theming: {
    targets: [{className: 'astryx-tooltip'}],
  },
  usage: {
    anatomy,
    description:
      'A short text hint that appears on hover or focus, anchored to a trigger element. Use it to describe icon-only buttons, show the full text of truncated labels, or provide supplementary context without cluttering the UI.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep tooltip content concise: aim for under 140 characters of plain text.',
      },
      {
        guidance: true,
        description:
          'Add a tooltip to icon-only buttons and controls that lack a visible label.',
      },
      {
        guidance: true,
        description:
          'Set touchTrigger to tap when the trigger is a button whose only job is revealing the tooltip: touch has no hover, and auto keeps the tap for triggers that perform an action. For an info icon, use InfoTip, which also pins its help on a press.',
      },
      {
        guidance: false,
        description:
          'Place interactive elements like links or buttons inside a tooltip; use HoverCard or Popover instead.',
      },
      {
        guidance: false,
        description:
          'Use tooltips for essential information that users must see to complete a task.',
      },
    ],
  },
}
```
