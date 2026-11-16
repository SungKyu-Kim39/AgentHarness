# Astryx component reference: hooks/usePanGesture.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/usePanGesture.doc.mjs. Original SHA-256: 1769fb57ab8056b5fcd58f7be9024b84d8c865e71383420d2e37b288d334fbde.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'usePanGesture',
  displayName: 'usePanGesture',
  keywords: [
    'pan',
    'drag',
    'gesture',
    'touch',
    'swipe',
    'translation',
    'velocity',
    'pointer',
    'createPanGesture',
    'uikit',
  ],
  params: [
    {
      name: 'ref',
      type: 'RefObject<Element | null>',
      description:
        'The element to drag. The hook creates one pan for the element behind the ref, creates a new one when the ref moves to another node or `axis` changes, and destroys it at unmount; a drag in progress then ends without a `cancelled` event, since an effect never calls `onPan`.',
      required: true,
    },
    {
      name: 'options',
      type: 'PanGestureOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.axis',
      type: "'x' | 'y'",
      description:
        'Limits the drag to one axis. A drag along the other axis is not reported, and that component of every value reads 0. Omit it to report both axes.',
      required: false,
    },
    {
      name: 'options.onPan',
      type: '(event: PanGestureEvent) => void',
      description:
        "Called with `{state, translation, velocity}` as the drag begins, changes, ends at the release, or is cancelled. `state` is 'began', 'changed', 'ended' or 'cancelled'. `translation` is the movement since the drag began, in pixels: the travel the drag needed to begin is not part of it, so an element that follows it does not jump. `velocity` is in pixels per second; at 'ended' it is the release velocity (0 when the finger rested before lifting), and at 'cancelled' it is 0. Read through a ref: a new function each render re-creates nothing.",
      required: true,
    },
  ],
  returns: [
    {
      name: 'void',
      type: 'void',
      description:
        'Nothing: the hook hands out no recognizer. Without React, `createPanGesture(element, options)` takes the same options and returns `{destroy}`, which removes every listener it added and cancels a drag in progress.',
    },
  ],
  usage: {
    description:
      'Reports a drag on an element as values, for a surface the product moves itself: a card that follows the finger, a drawer pulled by its handle. A finger, a mouse and a pen all drive it. A mouse or pen drag that starts on selectable text selects that text, and the pan reports nothing. Give that text `user-select: none`. The drag claims its touch at UIKit’s 10 pt, as `UIPanGestureRecognizer` does, so a tap stays a tap, and a press or a long press is never reported as a pan. With `axis`, a scroll across that axis that starts on the element stays the page’s; without it, the pan takes a drag in any direction, so a finger’s scroll that starts on the element moves the element instead of the page. A trackpad scroll still scrolls the page. The hook is a thin layer over `createPanGesture`, the same API for code without React. A drag has no keyboard or assistive-technology path of its own: whatever the drag does needs another way to do it, such as buttons or arrow keys (WCAG 2.5.7). The pan moves nothing itself, so Reduce Motion applies to the motion you drive from it: honor the user’s reduced-motion setting in the animation that moves the element. Where a component already offers the behavior, use its prop instead: BottomSheet’s `snapPoints`, Carousel’s `hasSnap`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Move the element from `translation` added to where it was when the drag began, so it moves with the finger from the moment the drag claims it.',
      },
      {
        guidance: true,
        description:
          'At `ended`, hand `velocity` to the animation that settles the element, so a flick carries on at the speed it was released.',
      },
      {
        guidance: true,
        description:
          'Give every drag another way to do the same thing from a keyboard and from assistive technology, such as buttons, arrow keys or a menu.',
      },
      {
        guidance: true,
        description:
          "Use a component's own prop when it covers the job: BottomSheet's `snapPoints` for a sheet, Carousel's `hasSnap` for paging.",
      },
      {
        guidance: false,
        description:
          'Hold the drag offset in a large component’s state: each `changed` event renders the component that holds it.',
      },
      {
        guidance: false,
        description:
          'Recognize taps or long presses with it; `useLongPress` and the components’ own press handling own those.',
      },
    ],
    accessibility: [
      {
        name: 'Keyboard and assistive technology',
        category: 'Keyboard',
        criterion: '2.5.7 Dragging Movements',
        description:
          'A drag has no keyboard or assistive-technology path of its own: whatever the drag does needs another way to do it, such as buttons, arrow keys or a menu.',
      },
      {
        name: 'Reduce Motion',
        category: 'Content',
        criterion: '2.3.3 Animation from Interactions',
        description:
          'The pan moves nothing itself, so Reduce Motion applies to the motion you drive from it: a settle or a throw goes to its end without travel when the person asks for reduced motion.',
      },
    ],
  },
  relatedComponents: ['BottomSheet', 'Carousel'],
  relatedHooks: ['useLongPress', 'createPanGesture'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
}
```
