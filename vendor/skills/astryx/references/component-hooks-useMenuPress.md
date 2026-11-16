# Astryx component reference: hooks/useMenuPress.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useMenuPress.doc.mjs. Original SHA-256: d3af691d8bf00eb95dffe072618ff8da70425f1121087bd0d274ecd7374322b0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useMenuPress',
  displayName: 'useMenuPress',
  keywords: [
    'menu',
    'press',
    'release',
    'touch',
    'finger',
    'drag',
    'highlight',
    'pointer',
    'gesture',
    'listbox',
    'macos',
    'ios',
  ],
  params: [
    {
      name: 'options',
      type: 'UseMenuPressOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.menuRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'The menu or listbox root — the surface whose rows a press picks from.',
      required: true,
    },
    {
      name: 'options.itemSelector',
      type: 'string',
      description:
        'Selector matching the ENABLED rows. A pointer over anything else inside the menu (a divider, a heading, a disabled row) highlights nothing.',
      required: true,
    },
    {
      name: 'options.triggerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'The control that opens the menu, when a press may start there.',
    },
    {
      name: 'options.onTriggerPress',
      type: '(pointerType: MenuPressPointerType) => boolean',
      description:
        'A mouse pressed the trigger, or a finger or a pen opened it: as it pressed, with no longPressDelayMs given, or else once it had rested for that delay. Open the menu under the held pointer and return whether it opened. Return false when the press closed an open menu instead.',
    },
    {
      name: 'options.onHighlight',
      type: '(row: HTMLElement | null) => void',
      description:
        'Move the highlight; null clears it. Defaults to moving DOM focus with preventScroll onto the row, and onto the menu root when there is no row; after a pointer press that focus does not match :focus-visible. A picker that highlights through aria-activedescendant supplies its own.',
    },
    {
      name: 'options.onActivate',
      type: '(row: HTMLElement, release: PointerEvent) => void',
      description:
        'Act on the row under the release. Defaults to dispatching a click on the row that carries the release button and modifier keys.',
    },
    {
      name: 'options.onDismiss',
      type: '() => void',
      description:
        'Close the menu: a MOUSE was released outside it with nothing acting. A finger released outside leaves the menu open, so this is never called then.',
    },
    {
      name: 'options.getScroller',
      type: '() => HTMLElement | null',
      description:
        'The element to scroll while a tracked pointer rests near its top or bottom edge. Defaults to the menu root when it overflows.',
    },
    {
      name: 'options.longPressDelayMs',
      type: 'number',
      description:
        "How long a finger must rest on the trigger before the menu opens under it. Unset, a finger on every device opens the menu as it presses, or after 150 ms inside a scroll view. Set, it is that wait everywhere. A tap released sooner opens the menu through the trigger's click.",
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: 'Whether the model is live.',
      default: 'true',
    },
  ],
  returns: [
    {
      name: 'menuProps',
      type: '{onPointerDown; "data-astryx-menu-press": ""}',
      description:
        'Spread onto the menu root. Claims presses that begin inside it and marks the root as carrying the press model.',
    },
    {
      name: 'triggerProps',
      type: '{onPointerDown; onContextMenu}',
      description:
        'Spread onto the trigger: a mouse press opens the menu at once. A finger or a pen opens it while still down: as it presses, with no longPressDelayMs given (inside a scroll view, once the 150 ms content-touch delay passes with no scroll), or else once it is held for that delay.',
    },
    {
      name: 'isTriggerClickFromPress',
      type: '() => boolean',
      description:
        'Whether the click reaching the trigger belongs to the gesture that just pressed it. That press already opened or closed the menu, so the click must neither toggle nor reopen.',
    },
    {
      name: 'cancel',
      type: '() => void',
      description:
        'End the gesture in flight with nothing acting, for when the menu closes under it.',
    },
  ],
  usage: {
    description:
      'The press model of macOS and iOS menus, for any pointer: the row under the pointer when it is RELEASED is the row that acts, the highlight follows the pointer while it is held, a mouse opens the menu on press and can drag straight into it, and a finger or a pen opens it while still down: as it presses with no delay given, picking a row only after moving 10 px, or else once it is held for the delay. The pointer is tracked at document level by pointerId, so a finger that slid off the row it landed on is still followed; the click the browser reports at the end of a touch, aimed at the row where the touch began, is swallowed so nothing acts twice. DropdownMenu, ContextMenu, DropdownMenuSubMenu, Selector and the menu bottom sheet already mount it; reach for it directly only when building a menu-like surface of your own.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a selector for ENABLED rows only, so a disabled row or a divider under the pointer clears the highlight instead of lighting up.',
      },
      {
        guidance: true,
        description:
          'Let the default highlight move focus in a menu; supply onHighlight only for a listbox that must keep focus on its combobox and highlight through aria-activedescendant.',
      },
      {
        guidance: true,
        description:
          'Declare touch-action on the menu root: pinch-zoom when its rows fit, pan-y pinch-zoom when it scrolls, so the browser — not the hook — decides when a finger is scrolling, and a two-finger pinch still zooms the page.',
      },
      {
        guidance: false,
        description:
          'Act on a row from its own pointerdown or pointerup handler as well; the hook already activates the row under the release, and a second path acts twice.',
      },
      {
        guidance: false,
        description:
          'Read a row click with detail 0 as a keyboard activation; the hook dispatches its pointer activation with detail 0 too. Use isMenuPressActivation() to tell them apart.',
      },
    ],
  },
  relatedComponents: ['DropdownMenu', 'ContextMenu', 'Selector'],
  relatedHooks: ['useListFocus', 'useTypeahead', 'useLongPress'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
