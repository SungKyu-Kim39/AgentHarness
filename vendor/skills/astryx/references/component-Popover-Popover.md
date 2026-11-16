# Astryx component reference: Popover/Popover.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Popover/Popover.doc.mjs. Original SHA-256: a00c61e898a4df7b8b79f64a328119e1cce464b29f3a5dd7b58054b0b01a8821.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Popover',
  displayName: 'Popover',
  group: 'Popover',
  category: 'Overlay',
  keywords: [
    'popover',
    'popup',
    'dropdown',
    'tooltip',
    'overlay',
    'flyout',
    'callout',
    'popper',
    'anchor',
    'floating',
    'bubble',
  ],
  components: [
    {
      name: 'Popover',
      displayName: 'Popover',
      description:
        'A click-triggered popover for displaying interactive content anchored to a trigger element.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Trigger element. Must contain a <button> or [role="button"] element.',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description:
            'External ref to use as the popover anchor in sibling mode.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Content to display inside the popover.',
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
            "Position placement relative to the trigger. Logical: start/end resolve against the popover's own inherited direction, so RTL contexts mirror automatically in pure CSS.",
          default: "'below'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            "Alignment along the placement axis. Logical: start/end follow the popover's own inherited direction (RTL mirrors).",
          default: "'start'",
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Whether the popover is shown in controlled mode.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback fired when the popover visibility changes.',
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'When false, trigger interactions are ignored.',
          default: 'true',
        },
        {
          name: 'width',
          type: 'number | string',
          description:
            'Width of the popover container. The layer still caps to the viewport with alignment-aware safe-area gutters before scrolling long content.',
          default: "'auto'",
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Inner padding of the popover surface on the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10), matching the padding prop on Card and Stack. Pass 0 for a flush surface when the content owns its own edges, such as a list of rows or a header with a rule, and pad the content itself. The padding sits on the painted popover target, so a theme padding on that target replaces it.',
          default: '3',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the popover dialog. A sheet without one is named by the trigger\u2019s text.',
        },
        {
          name: 'role',
          type: "'dialog' | 'none'",
          description:
            'ARIA role for the popover wrapper. Use dialog for dialog-style popovers; use none when content provides its own role, like menu or listbox.',
          default: "'dialog'",
        },
        {
          name: 'isModal',
          type: 'boolean',
          description:
            'Whether a dialog-style popover sets aria-modal. Only applies when role is dialog.',
          default: 'true',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description:
            'Whether to include a hidden close button for accessibility.',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: 'Label for the hidden close button.',
          default: "'Close popover'",
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description:
            'Whether to move focus into the popover when it opens. Focus enters the first genuine content control; dialogs with none fall back to the labeled surface. The generated fallback close control stays hidden until reached through keyboard navigation. Set to false for input-owned focus, inline showcases, or documentation previews.',
          default: 'true',
        },
        {
          name: 'hasLightDismiss',
          type: 'boolean',
          description:
            'Whether clicking outside dismisses the popover. Set to false for surfaces that stay open until explicitly dismissed, like onboarding coachmarks.',
          default: 'true',
        },
        {
          name: 'hasEscapeDismiss',
          type: 'boolean',
          description:
            'Whether pressing Escape dismisses the popover. Only takes full effect together with hasLightDismiss={false}, since native light dismiss also closes on Escape.',
          default: 'true',
        },
        {
          name: 'presentation',
          type: "'popover' | 'bottom-sheet' | 'adaptive'",
          description:
            "The surface that holds the content. 'popover' anchors it to the trigger, 'bottom-sheet' presents it in a modal BottomSheet labeled by label, and 'adaptive' uses the BottomSheet on a compact touch screen (a coarse pointer on a screen the theme counts as compact: narrower than its md width point or shorter than 500 px, so a phone in either orientation) and the anchored popover elsewhere. In a sheet, placement, alignment, width, role, isModal and hasAutoFocus do not apply, and xstyle, className and style style the sheet's panel; the sheet always light-dismisses (a tap outside it or a swipe down closes it, whatever hasLightDismiss says), Escape follows hasEscapeDismiss, and the fallback close stays hidden. The surface is chosen as it opens and kept until it closes.",
          default: "'popover'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Flush surface for a list of rows',
      code: `<Popover
  label="Recent files"
  padding={0}
  content={
    <List>
      <ListItem label="Quarterly report.pdf" />
      <ListItem label="Roadmap.key" />
    </List>
  }>
  <Button label="Recent" variant="secondary" />
</Popover>`,
    },
    {
      label: 'Roomier surface for a form',
      code: `<Popover
  label="Save search"
  padding={4}
  content={<SaveSearchForm />}>
  <Button label="Save search" variant="secondary" />
</Popover>`,
    },
  ],
  playground: {
    defaults: {
      content: {
        __element: 'Text',
        props: {type: 'body'},
        children: 'Popover content goes here.',
      },
      children: {
        __element: 'Button',
        props: {label: 'Open popover', variant: 'secondary'},
      },
    },
  },
  theming: {
    targets: [
      // Canonical broad target for the painted Popover surface.
      {className: 'astryx-popover'},
    ],
    vars: [
      {
        name: '--_popover-radius',
        description: 'Border radius of the popover surface',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_popover-radius']}],
  },
  usage: {
    description:
      'A click-triggered overlay anchored to a button or trigger element. Use it for secondary actions, inline confirmations, or supplementary information that does not warrant a full dialog. For hover previews use HoverCard, for brief helper text use Tooltip. Under a finger (a coarse primary pointer), it is presented like a native popover: it grows out of its trigger and shrinks back into it on the theme\u2019s motion tokens; with reduced motion it cross-fades, opacity only, in 200 ms or less.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep popover content focused on a single task or piece of information.',
      },
      {
        guidance: true,
        description:
          'Provide a clear way to close: either by clicking outside or with an explicit close button.',
      },
      {
        guidance: true,
        description:
          'Theme the painted surface through the canonical popover target.',
      },
      {
        guidance: false,
        description:
          'Nest popovers inside other popovers; it creates confusing focus and navigation.',
      },
      {
        guidance: false,
        description:
          "Assume input complexity alone determines the presentation; evaluate the task's focus, space, and interaction requirements.",
      },
      {
        guidance: false,
        description:
          'Assume scrolling alone means Popover is the wrong component; a bounded Popover may scroll while a focused anchored interaction remains appropriate.',
      },
    ],
    anatomy: [
      {
        name: 'Trigger element',
        required: true,
        description:
          'Caller-supplied or externally referenced control that anchors and toggles the popover.',
      },
      {
        name: 'Popover surface',
        required: true,
        description:
          'Painted surface owned and themed by Popover through the canonical popover target.',
      },
      {
        name: 'Touch sheet',
        required: false,
        description:
          'BottomSheet surface that holds the same content in place of the popover surface for presentation="bottom-sheet", or "adaptive" on a compact touch screen; themed through the bottom-sheet target.',
      },
      {
        name: 'Popover content',
        required: true,
        description: 'Caller-supplied content rendered inside the surface.',
      },
      {
        name: 'Fallback close control',
        required: false,
        description:
          'Keyboard-reachable close affordance appended by usePopover when enabled.',
      },
    ],
  },
}
```
