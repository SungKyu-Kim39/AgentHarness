# Astryx component reference: Dialog/useImperativeDialog.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Dialog/useImperativeDialog.doc.mjs. Original SHA-256: d248d636f9dab1312a619a50401f967c6346f47825a26802627bc3c46016593d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useImperativeDialog',
  subComponentOf: 'Dialog',
  displayName: 'useImperativeDialog',
  description: 'Hook for showing a dialog without managing open state. Call dialog.show(content, options) to open and dialog.hide() to close. Render dialog.element in your JSX tree.',
  props: [
    {
      name: 'show',
      type: '(content: ReactNode, options?: DialogOptions) => void',
      description: 'Show the dialog with the given content. Options are the same as Dialog props minus isOpen/onOpenChange/children.',
    },
    {
      name: 'hide',
      type: '() => void',
      description: 'Hide the dialog.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the dialog is currently open.',
    },
    {
      name: 'element',
      type: 'ReactNode',
      description: 'The dialog element: render this in your JSX tree.',
    },
  ],
}
```
