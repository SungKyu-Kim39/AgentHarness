# Astryx component reference: hooks/useKeyboardHint.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useKeyboardHint.doc.mjs. Original SHA-256: 726dfb92eff538d1c728790a77671220ac15267dc348d963b8205cf5eafcb67d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useKeyboardHint',
  displayName: 'useKeyboardHint',
  keywords: ['keyboard', 'hint', 'arrow', 'navigation', 'roving', 'tabindex', 'focus', 'discoverability', 'toolbar', 'tabs', 'segmented', 'affordance', 'a11y'],
  params: [
    {
      name: 'options',
      type: 'UseKeyboardHintOptions',
      description: 'Configuration object for the keyboard hint.',
      required: false,
    },
    {
      name: 'options.orientation',
      type: "'horizontal' | 'vertical' | 'both'",
      description: 'Which arrow-key axis the composite navigates, controlling which arrow icons the hint shows (← → for horizontal, ↑ ↓ for vertical, all four for both).',
      default: "'horizontal'",
      required: false,
    },
    {
      name: 'options.dismissAfterMs',
      type: 'number',
      description: 'Milliseconds before the hint dismisses itself after appearing. Leave it unset: by default the hint stays until an arrow press, Escape, or blur. A time limit can remove the hint before someone has read it (WCAG 1.4.13).',
      default: 'undefined (no time limit)',
      required: false,
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: 'Whether the hint is enabled. Set to false to suppress it for a specific instance (e.g. a disabled or read-only widget).',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'hintElement',
      type: 'ReactNode',
      description: 'The popover hint element to render inside the composite container (as the last child). Portals to the top layer via popover="manual", renders arrow keys with Kbd, and manages its own visibility; render it unconditionally.',
    },
    {
      name: 'onFocus',
      type: '(e: React.FocusEvent) => void',
      description: 'Attach to the container onFocus. Shows the hint on the first keyboard-focus (:focus-visible) entry from outside the composite.',
    },
    {
      name: 'onBlur',
      type: '(e: React.FocusEvent) => void',
      description: 'Attach to the container onBlur. Hides the hint when focus leaves the composite entirely, and re-anchors when focus moves within.',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: 'Attach to the container onKeyDown. Dismisses the hint on the first arrow press (the user has discovered the interaction). Never prevents default or stops propagation.',
    },
  ],
  usage: {
    description:
      'Shows an ephemeral "← → to navigate" hint anchored to the focused item the first time a roving-tabindex composite (Toolbar, TabList, SegmentedControl, etc.) receives keyboard focus. It teaches sighted keyboard users that arrow keys move within the group. The hint renders arrow keys with Kbd in the top layer (popover="manual") and is CSS-anchor-positioned to the focused element, so overflow containers never clip it. It stays until the first arrow press, Escape, or blur, and does not re-show for that instance. Escape closes only the hint, through the shared layer dismissal stack, and keeps focus where it is. Toolbar, TabList, and SegmentedControl wire this in automatically; reach for the hook directly only when building a custom roving-tabindex widget.',
    bestPractices: [
      { guidance: true, description: 'Compose the returned onFocus/onKeyDown with your existing focus handlers rather than replacing them: call onKeyDown first (it only dismisses, never prevents), then your navigation handler.' },
      { guidance: true, description: 'Render hintElement as the last child of the composite container; it is position:fixed in the top layer and aria-hidden, so it never affects layout or the accessibility tree.' },
      { guidance: true, description: 'Match orientation to the arrow keys your widget actually responds to so the hint shows the correct icons.' },
      { guidance: false, description: 'Use for single controls or widgets without roving-tabindex navigation; the hint only makes sense where arrows move focus within a group.' },
    ],
  },
  relatedComponents: ['Toolbar', 'TabList', 'SegmentedControl'],
  relatedHooks: ['useListFocus', 'useGridFocus', 'useTreeFocus'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
}
```
