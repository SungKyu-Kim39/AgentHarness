# Astryx component reference: AlertDialog/useImperativeAlertDialog.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/AlertDialog/useImperativeAlertDialog.doc.mjs. Original SHA-256: 3582dd75ed36e7165826c3aa24ed75b1ba2bf9b3c3dceaf88264044b70be1480.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useImperativeAlertDialog',
  subComponentOf: 'AlertDialog',
  displayName: 'useImperativeAlertDialog',
  description: 'Hook for showing an alert dialog without managing open state. Call alert.show(options) to open and alert.hide() to close. Render alert.element in your JSX tree.',
  props: [
    {
      name: 'show',
      type: '(options: AlertDialogOptions) => void',
      description: 'Show the alert dialog with the given options. Options are the same as AlertDialog props minus isOpen/onOpenChange.',
    },
    {
      name: 'hide',
      type: '() => void',
      description: 'Hide the alert dialog.',
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
