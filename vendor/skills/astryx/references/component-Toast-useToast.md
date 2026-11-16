# Astryx component reference: Toast/useToast.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Toast/useToast.doc.mjs. Original SHA-256: 7e564fd592b777a3ab00fb8142fe7fae308ab83ddd41b9863d1971fe70840582.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useToast',
  displayName: 'useToast',
  group: 'Toast',
  keywords: ['toast', 'notification', 'snackbar', 'alert', 'message', 'feedback', 'flash'],
  params: [
    // useToast takes no arguments; returns a show function
  ],
  returns: [
    {
      name: 'showToast',
      type: '(options: ToastOptions) => () => void',
      description: 'Show a toast notification. Returns a dismiss function. Options include body (ReactNode), type ("info" | "error"), isAutoHide, autoHideDuration, endContent, uniqueID, and collisionBehavior.',
    },
  ],
  usage: {
    description: 'Hook for showing toast notifications from anywhere in your component tree. Returns a function that accepts toast options and shows the notification. Works automatically with LayerProvider or self-mounts a fallback viewport.',
    bestPractices: [
      {guidance: true, description: 'Use for transient success/error feedback that does not require user action.'},
      {guidance: true, description: 'Set uniqueID to deduplicate toasts from rapid user actions.'},
      {guidance: false, description: 'Use for critical errors that require acknowledgment; use AlertDialog instead.'},
      {guidance: false, description: 'Call useToast in the same component that renders LayerProvider; it must be called from a child component inside the provider.'},
    ],
  },
  relatedComponents: ['Toast', 'Banner', 'AlertDialog'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/Toast',
  category: 'interaction',
}
```
