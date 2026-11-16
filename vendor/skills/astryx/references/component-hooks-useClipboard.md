# Astryx component reference: hooks/useClipboard.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useClipboard.doc.mjs. Original SHA-256: 00b9e7a8b48271de78c75a78657507fe765c262a7fd6f266d78264bd7604368f.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useClipboard',
  displayName: 'useClipboard',
  keywords: [
    'clipboard', 'copy', 'copied', 'paste', 'writeText', 'copy-to-clipboard',
    'copy button', 'announce', 'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseClipboardOptions',
      description: 'Configuration object.',
      required: false,
    },
    {
      name: 'options.announce',
      type: 'string',
      description:
        'Message announced to a polite live region on a successful copy. A swapped aria-label alone is not reliably announced, so pass the localized confirmation (e.g. "Copied") to have it spoken. Omit to skip the announcement.',
      required: false,
    },
    {
      name: 'options.resetAfterMs',
      type: 'number',
      description:
        'Milliseconds isCopied stays true after a successful copy before reverting.',
      default: '2000',
      required: false,
    },
  ],
  returns: [
    {
      name: 'copy',
      type: '(text: string) => Promise<boolean>',
      description:
        'Writes text to the clipboard. On success flips isCopied to true, announces the configured message, restarts the reset timer, and resolves true. A clipboard rejection is a silent no-op that leaves the copied state unchanged and resolves false.',
    },
    {
      name: 'isCopied',
      type: 'boolean',
      description:
        'True for resetAfterMs after the most recent successful copy, then reverts. Drive the copied confirmation (e.g. a copy → check icon flip) off this.',
    },
  ],
  usage: {
    description:
      'Copy-to-clipboard behavior: the clipboard write, a transient isCopied flag with its own reset timer, and an optional polite screen-reader announcement. Extracted so every copy affordance is a thin control over one implementation instead of re-deriving the timer and announcement. Rapid re-copies restart the reset timer so the confirmation always lasts the full duration, and the timer is cleaned up on unmount. CodeBlock and Timestamp build their built-in copy buttons on it; reach for it directly when building a copy affordance that is not a plain icon button (a menu item, a labeled text button, a copy-on-click value chip).',
    bestPractices: [
      { guidance: true, description: 'Drive the copied confirmation (copy → check icon, label swap) off the returned isCopied flag rather than tracking your own state.' },
      { guidance: true, description: 'Pass a localized announce message so the copy is spoken by screen readers; swapping the button aria-label alone is not reliably announced.' },
      { guidance: true, description: 'For the common compact icon copy button, render a ghost IconButton with a "Copy" tooltip and wire onClick to copy(); the tooltip stays "Copy" and the icon flip is the confirmation.' },
      { guidance: false, description: 'Track a separate copied useState alongside the hook; isCopied already reflects the copied window and resets itself.' },
    ],
  },
  relatedComponents: ['CodeBlock', 'Timestamp', 'IconButton'],
  relatedHooks: ['useAnnounce'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
