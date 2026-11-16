# Astryx component reference: Chat/ChatMessageBubble.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatMessageBubble.doc.mjs. Original SHA-256: d1892fcc03363ab7d6de6b1f6a2d061225094e97b041c448baa4682bc68c2955.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatMessageBubble',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Bubble',
  isHiddenFromOverview: true,
  description:
    'Styled content container for the chat "bubble." Reads sender from parent ChatMessage context to auto-style the background. Use filled for standard messages and ghost when content needs alignment without a visible boundary. Supports name/metadata slots aligned with bubble padding, and multi-bubble grouping via the group prop for consecutive messages from the same sender.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Bubble content: text, Markdown, or any ReactNode.',
      required: true,
    },
    {
      name: 'variant',
      type: "'filled' | 'ghost'",
      description:
        "Visual variant. 'filled' renders sender-colored background (default). 'ghost' renders transparent background but keeps padding for alignment.",
      default: "'filled'",
    },
    {
      name: 'name',
      type: 'ReactNode',
      description:
        "Sender name rendered above the bubble, aligned with bubble text padding. Use on the first bubble in a message. Non-rendering scalar values (null, undefined, booleans, and the empty string) omit the aligned wrapper; numeric 0 remains aligned. If the first content is raw (no bubble), use ChatMessage's `name` prop instead.",
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description:
        "Metadata content rendered below the bubble, aligned with bubble text padding. Use on the last bubble in a message. Non-rendering scalar values (null, undefined, booleans, and the empty string) omit the aligned wrapper; numeric 0 remains aligned. If the last content is raw (no bubble), use ChatMessage's `metadata` prop instead.",
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Metadata',
        },
      ],
    },
    {
      name: 'group',
      type: "'first' | 'middle' | 'last'",
      description:
        'Position within a multi-bubble group. Controls corner radius reduction on the sender side. Leave unset for standalone bubbles (full radius).',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the bubble (number = pixels, string = used as-is). When set, replaces the default max(80%, 280px) width cap. Combine with variant="ghost" to let custom content (an artifact card, attachments) span the full message column.',
    },
  ],
}
```
