# Astryx component reference: Kbd/Kbd.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Kbd/Kbd.doc.mjs. Original SHA-256: a254b315341645535cc851caf1fb30fbe3e1a98eff6d863c1d98a1ef8510fc99.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Kbd',
  displayName: 'Kbd',
  category: 'Content',
  keywords: [
    'kbd',
    'keyboard',
    'shortcut',
    'hotkey',
    'keybinding',
    'keystroke',
    'keycombo',
    'modifier',
    'accelerator',
  ],
  props: [
    {
      name: 'keys',
      type: 'string',
      description:
        'Keyboard shortcut string. Use "+" to separate keys. Special keys: mod (⌘ on Apple platforms, Ctrl elsewhere), ctrl, alt and shift (Apple symbols on Apple platforms, Ctrl, Alt and Shift text elsewhere), meta (⌘ on Apple platforms, Win elsewhere and before hydration), enter, backspace, escape, tab, up, down, left, right, plus. Aliases: esc for escape and return for enter.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling; className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for styling; inline styles bypass StyleX optimization.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLSpanElement>',
      description: 'Ref forwarded to the shortcut group element.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-kbd'}],
  },
  usage: {
    anatomy,
    description:
      'Renders a keyboard shortcut as styled key badges. Use Kbd in tooltips, menus, and help text to show key combinations.',
    bestPractices,
  },
}
```
