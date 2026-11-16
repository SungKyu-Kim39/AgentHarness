# Astryx component reference: hooks/useAnimator.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useAnimator.doc.mjs. Original SHA-256: 679b687b18cf048b3fce3da8373f2e02a8f26a445dce6dbbeb4cbb1861e18fca.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useAnimator',
  displayName: 'useAnimator',
  keywords: [
    'animate',
    'animation',
    'animator',
    'spring',
    'decay',
    'momentum',
    'fling',
    'motion',
    'transform',
    'opacity',
    'drag',
    'card',
  ],
  params: [
    {
      name: 'ref',
      type: 'RefObject<HTMLElement | null>',
      description:
        'The ref of the one element to animate, the same ref you pass to the element: another hook, such as a gesture hook, can take it too, so a drag and an animation share one element. After every render the animator follows the element behind it. When the element unmounts its motion stops and its values return to rest, so a remount starts at rest, and so does a node that replaces it. Before the element mounts, and while it is unmounted, every call does nothing and `animate` and `decay` resolve at once.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'animator',
      type: 'AnimatorHandle',
      description:
        "The element's animator, the same object on every render: `animate(target, {velocity?})` springs channels to a target on the state-change motion Astryx's components use, `decay(velocity)` coasts them from a release velocity, `set(values)` jumps them, `get()` and `getVelocity()` read them, and `stop()` halts them. The channels are `x` and `y` (px), `scale` (1 at the element's size), `rotate` (degrees) and `opacity` (0 to 1). `animate` and `decay` return a promise that resolves when the motion ends. Calling it never re-renders the component. Calls before the ref attaches do nothing and resolve at once.",
    },
  ],
  usage: {
    description:
      "Animates one element with the motion Astryx's own components use. Call `animator.animate` to spring an element to new values on the state-change motion, `animator.decay` to fling it with the momentum of a released scroll view, and `animator.set` to move it directly, so a card can follow a finger, snap back and be thrown away. To animate an area's layout as its items change, use `useAnimatedLayout`; for what a component already animates, such as a sheet's detents or a carousel's snapping, use the component's own props. Outside React, use `createAnimator`.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Call the animator from event handlers and effects: it lives outside render, so animating never re-renders the component.',
      },
      {
        guidance: true,
        description:
          'Start every `animate` that follows a drag with the release velocity, so the element carries on as it was thrown.',
      },
      {
        guidance: true,
        description:
          'Reach every state an animation shows without the animation too: a key, a button or a menu item that calls the same code.',
      },
      {
        guidance: false,
        description:
          'Keep the animated values in React state: read them with `animator.get()` when you need them.',
      },
    ],
    accessibility: [
      {
        name: 'Keyboard and assistive technology',
        category: 'Keyboard',
        description:
          'An animator moves an element; it adds no way to act. Give every action an animation stands for a control a keyboard and a screen reader can reach, such as a button that discards a card, and have it call `animate`, which Reduce Motion turns into a fade in place. Keep `decay` for a throw the person made: Reduce Motion keeps the momentum of a coast, as it continues that throw. Keep focus on an element that stays on screen: move it before you fling its element away.',
      },
      {
        name: 'Reduce Motion',
        category: 'Content',
        criterion: '2.3.3 Animation from Interactions',
        description:
          'When the person asks for reduced motion, every call is planned for them. On a touch screen a move or a scale becomes a short opacity cross-fade: the element fades out where it was and fades back in where it lands. With a mouse it lands at once. A decay of `x` and `y` keeps its momentum, as it continues the throw the person made; a decay of `scale`, `rotate` or `opacity` is planned like a move. No option turns this off.',
      },
    ],
  },
  relatedHooks: ['useAnimatedLayout'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
}
```
