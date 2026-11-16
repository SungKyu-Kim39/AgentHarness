# Astryx component reference: Chat/ChatLayoutScrollButton.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatLayoutScrollButton.doc.mjs. Original SHA-256: b5fd5eaca66e3b34d9f73bbbf1e9cec2b77072a48f4d6dbb679902d220f6f95a.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatLayoutScrollButton',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout Scroll Button',
  isHiddenFromOverview: true,
  description: 'Floating scroll-to-bottom button that appears when the user scrolls away from the latest messages. It fades in as a compact icon button and expands to show a label when new messages arrive. ChatLayout renders this by default: pass a custom element to the scrollButton prop to override, or null to hide it entirely.',
  props: [
    {
      name: 'isVisible',
      type: 'boolean',
      description: 'Whether the button is visible. Bind to a scroll-position check so the button only appears when the user has scrolled up.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Optional label that expands the button (e.g. "New messages"). Use to signal unread content below the fold.',
    },
    {
      name: 'onClick',
      type: '() => void',
      description: 'Click handler: typically scrolls to bottom and dismisses the new message indicator.',
      required: true,
    },
  ],
}
```
