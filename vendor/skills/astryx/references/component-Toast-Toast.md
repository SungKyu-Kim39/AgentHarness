# Astryx component reference: Toast/Toast.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Toast/Toast.doc.mjs. Original SHA-256: 13271b7b542393b412253ab263e3d3cb914a6b04cc4f0d85db5668655b7ce891.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Toast',
  displayName: 'Toast',
  group: 'Toast',
  category: 'Overlay',
  hiddenComponents: ['ToastViewport'],
  keywords: [
    'toast',
    'notification',
    'snackbar',
    'alert',
    'message',
    'feedback',
    'status',
  ],

  playground: {
    defaults: {body: 'Changes saved'},
  },

  props: [
    {
      name: 'body',
      type: 'ReactNode',
      description: 'Primary message content.',
      required: true,
      slotElements: [
        {__element: 'Text', props: {type: 'body'}, children: 'Toast message'},
      ],
    },
    {
      name: 'type',
      type: "'info' | 'error'",
      description:
        'Toast type controlling background color. Error toasts persist until dismissed.',
      default: "'info'",
    },
    {
      name: 'isAutoHide',
      type: 'boolean',
      description:
        'Whether the toast auto-dismisses. Defaults to true for info, false for error.',
    },
    {
      name: 'autoHideDuration',
      type: 'number',
      description:
        'Duration in ms before auto-dismiss. Timed content must satisfy WCAG 2.2.1.',
      default: '5000',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered at the trailing end (e.g. Undo button, link). Keep action labels short.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'uniqueID',
      type: 'string',
      description: 'Unique identifier for deduplication.',
    },
    {
      name: 'collisionBehavior',
      type: "'overwrite' | 'ignore'",
      description:
        'Behavior when a toast with matching uniqueID already exists.',
      default: "'overwrite'",
    },
    {
      name: 'onHide',
      type: '(reason: "auto" | "manual") => void',
      description: 'Callback fired when the toast is removed.',
    },
    {
      name: 'onDismiss',
      type: '(reason: "auto" | "manual") => void',
      description: 'Callback fired when the toast is dismissed.',
      required: true,
    },
    {
      name: 'renderContent',
      type: '(toast: ToastContentRenderProps) => ReactNode',
      description:
        "Replaces the content of this toast's card with your own layout. Astryx keeps the card, its astryx-toast theme target and auto-hide behavior (inside a ToastViewport the viewport announces the toast, over a modal too, and the card itself is not a live region), then hands the renderer the message, endContent, resolved toast settings and a dismiss callback. The custom renderer owns every control in its layout: compose the control you want and call dismiss from it. Astryx does not inject a fallback close into custom content. Per-toast: an app shares one layout by wrapping useToast and passing it on every call, while a toast raised by library code that never passes it renders as an ordinary Astryx toast. The argument is {body, endContent, type, isAutoHide, autoHideDuration, dismiss}, where type is 'info' | 'error'.",
    },
  ],
  theming: {
    targets: [{className: 'astryx-toast', visualProps: ['type']}],
    vars: [
      {
        name: '--_toast-slide-y',
        description:
          'Private block-axis offset inherited from ToastViewport for entry and exit motion',
        default: 'var(--spacing-2)',
        private: true,
      },
      {
        name: '--_toast-swipe-y',
        description: 'Private active swipe offset along the block axis',
        default: '0px',
        private: true,
      },
      {
        name: '--_toast-swipe-exit-y',
        description: 'Private completed-swipe exit offset',
        default: 'var(--_toast-swipe-y)',
        private: true,
      },
      {
        name: '--_toast-swipe-opacity',
        description: 'Private opacity feedback during an accepted swipe',
        default: '1',
        private: true,
      },
      {
        name: '--_toast-swipe-scale',
        description: 'Private scale feedback during an accepted swipe',
        default: '1',
        private: true,
      },
    ],
  },

  usage: {
    description:
      'Toast shows a brief, non-blocking notification to confirm an action or present temporary information. Use it for scenarios where the user needs feedback but not a decision, such as saving, deleting, or changing a status.\n\nFor production use, prefer the `useToast()` hook; it handles positioning, stacking, auto-dismiss, and deduplication via `ToastViewport`. Toasts stay within viewport and safe-area gutters, wrap long message content, and enter, exit, or swipe-dismiss toward their configured top or bottom edge. The vertical swipe uses the same spatial model as placement motion: top Toasts leave upward and bottom Toasts leave downward. Swipe waits for dominant edge-directed intent before cancelling native touch movement and reports the existing manual dismissal reason. Pen is supported as direct-contact input; mouse drag is excluded to avoid conflicting with desktop text selection, where the visible close control remains available. Set `isAutoHide: false` explicitly when an action or message must remain available. The `Toast` component renders the visual toast element inline and is useful for previews, documentation, and static showcases where the viewport lifecycle is not needed. Host `data-*` attributes on `Toast` reach the toast element; its role, live-region attributes, and theme attributes stay component-owned.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep messages short: only a few words that tell the user what happened, like "Changes saved" or "Message sent".',
      },
      {
        guidance: true,
        description:
          'Add a short undo action in the endContent slot for reversible operations. Set isAutoHide to false when the action must remain available.',
      },
      {
        guidance: true,
        description:
          'Use uniqueID to deduplicate toasts that fire from repeated actions, like clicking a save button multiple times.',
      },
      {
        guidance: true,
        description:
          "Use error type for failures that need attention but not immediate action; it persists until dismissed so the user won't miss it.",
      },
      {
        guidance: false,
        description:
          "Don't use a toast for critical errors that block the user. Use Banner for persistent, in-context messaging that requires acknowledgment.",
      },
      {
        guidance: false,
        description:
          "Don't put long or multi-line content in a toast; it disappears after 5 seconds and the user may not finish reading.",
      },
      {
        guidance: false,
        description:
          "Don't show form validation errors as toasts. Use inline field validation so the user can see exactly which field needs fixing.",
      },
    ],
    anatomy: [
      {
        name: 'Body',
        required: true,
        description:
          'The primary message text describing what happened or what the user should know.',
      },
      {
        name: 'End content',
        required: false,
        description:
          'A trailing action like an Undo button or a link, placed after the body text.',
      },
      {
        name: 'Dismiss button',
        required: true,
        description:
          'A close button that lets the user manually dismiss the toast before auto-hide.',
      },
    ],
  },
}
```
