# Astryx component reference: hooks/usePressFeedback.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/usePressFeedback.doc.mjs. Original SHA-256: 364f39ed02cd24167cb25235899852fce3cd9d7d63dd6550294ec2b9ebef3a73.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'usePressFeedback',
  displayName: 'usePressFeedback',
  keywords: [
    'press',
    'pressed',
    'active',
    'touch',
    'tap',
    'coarse pointer',
    'pressable',
    'interaction state',
  ],
  params: [],
  returns: [
    {
      name: 'pressableProps',
      type: "{'data-astryx-pressable': ''}",
      description:
        "The marker attribute to spread on the element that paints the press. Compose one of `interactionOverlayStyles` (from `@astryxdesign/core/utils`) on the same element — `backgroundColor` or `backgroundImage` for a surface whose hover and press are the system's overlays, `pressedBackgroundColor` for one whose hover is its own — and it paints the pressed token on the first frame of a press and fades it over the release, keeping `:active` for a mouse on a desktop. On a phone or tablet, where the stylesheet drops `:active`, the controller also paints a mouse, trackpad or Space-key press: at once, held while the button or key is down, faded at the release. A press is themed through `--color-overlay-pressed`.",
    },
  ],
  usage: {
    description:
      'The touch press model every Astryx pressable uses, for a local component that paints its own press. Under a finger, CSS `:active` paints on the touch itself and can outlive the start of a scroll; the press model instead tracks the touch the way UIKit tracks a control: it highlights as the finger lands (after the content-touch delay inside a scroller, where a flick paints nothing), a quick tap answers at the lift, and a scroll that takes the touch cancels it with no fade. One document-level controller does this for every marked element (installed by the first pressable to mount, removed by the last to unmount), so calling the hook adds no listener or state to your element. On a desktop a mouse press is still your `:active` rule: keep it, and drop it under `@media (pointer: coarse)` the way the built-in components do. That query reads the primary pointer, so on a phone or tablet it also drops `:active` for a connected mouse, trackpad or keyboard; the controller paints those presses there (at once, faded at the release), so nothing goes unanswered.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread the result on the element whose background paints the press and compose one of `interactionOverlayStyles` on it; the composed style is the instant onset, the hold and the fade, and it is themed through `--color-overlay-pressed`.',
      },
      {
        guidance: true,
        description:
          'Let the composed style own the press on every pointer: it keeps `:active` for a desktop mouse and drops it under `@media (pointer: coarse)`, where the controller paints every press (a finger through the press model, a mouse or Space key at once). A rule of your own that paints `:active` would paint under a finger too, on the touch and through a scroll.',
      },
      {
        guidance: false,
        description:
          'Add a pointer listener or React state to the element to track the press; the controller already writes the attribute, and per-element listeners are what a long list cannot afford.',
      },
      {
        guidance: false,
        description:
          'Call it for a control rendered by an Astryx component; those are marked already, and the innermost marked element takes the press.',
      },
    ],
  },
  relatedComponents: ['Button', 'Item', 'ClickableCard'],
  relatedHooks: ['useLongPress'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
}
```
