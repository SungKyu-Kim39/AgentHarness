# Astryx component reference: hooks/useClickableContainer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useClickableContainer.doc.mjs. Original SHA-256: 990b1805c8667d3a0eea32bbc557ea5a86e59deea110478c558e63554c501700.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useClickableContainer',
  displayName: 'useClickableContainer',
  keywords: ['click', 'container', 'card', 'pressable', 'interactive', 'nested', 'link', 'button', 'delegate'],
  params: [
    {
      name: 'options',
      type: 'UseClickableContainerOptions',
      description: 'Configuration object for the clickable container.',
      required: true,
    },
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the outer container element.',
      required: true,
    },
    {
      name: 'options.interactiveRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the primary interactive element inside (link, button). If no onClick or href is provided, clicks are proxied to this element.',
      required: false,
    },
    {
      name: 'options.onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Click handler fired when the container surface (not a nested interactive element) is clicked.',
      required: false,
    },
    {
      name: 'options.href',
      type: 'string',
      description: 'Navigation URL. When provided, clicking the container navigates to this URL.',
      required: false,
    },
    {
      name: 'options.target',
      type: 'string',
      description: "Link target (e.g., '_blank'). Used with href for navigation behavior.",
      required: false,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: 'Whether the container is disabled.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Click handler to attach to the container element.',
    },
    {
      name: 'onMouseUp',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Mouse up handler to attach to the container (handles middle-click navigation for href).',
    },
    {
      name: 'onPointerDown',
      type: '(event: PointerEvent<HTMLElement>) => void',
      description: 'Pointer down handler to attach to the container. On a container that paints its press with usePressFeedback, it drops a touch press that starts on a nested interactive element, which does not activate the container. A mouse :active press paint is unchanged. Without it, the container keeps its click rules and its pressed state for every press.',
    },
  ],
  usage: {
    description:
      'Makes a container element clickable while preserving nested interactive element behavior. Solves the "nested interactive elements" problem: when a card is clickable but contains buttons/links, clicking those should NOT trigger the card\'s action. Detects interactive ancestors between the click target and the container, and ignores text selections. Supports href navigation (including middle-click and Ctrl/Cmd+click for new tabs).',
    bestPractices: [
      { guidance: true, description: 'Attach onClick, onMouseUp and onPointerDown to the container element: full click handling including middle-click, and no touch pressed state for a press on a nested control.' },
      { guidance: true, description: 'Use inside ClickableCard or SelectableCard for the standard card interaction pattern.' },
      { guidance: true, description: 'For a pressable surface without Card chrome, such as a quoted message that jumps on press, compose it yourself: this hook on the surface; `usePressFeedback()` and `interactionOverlayStyles.backgroundColor` (from `@astryxdesign/core/utils`) on the same element for the hover tint and touch press; a native `<button>` (or an `<a>` for a destination) inside `VisuallyHidden` as the named control and interactiveRef; and `focusOutlineStyles.focusWithin` (from `@astryxdesign/core/utils`) on the surface for the shared focus ring, the one ClickableCard draws. The `Core/Hooks/useClickableContainer` story has the full recipe.' },
      { guidance: false, description: 'Use when the entire container is a single interactive element; just use a <button> or <a> directly.' },
    ],
  },
  relatedComponents: ['ClickableCard', 'SelectableCard'],
  relatedHooks: ['useInputContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
