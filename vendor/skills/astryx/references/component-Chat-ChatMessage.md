# Astryx component reference: Chat/ChatMessage.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatMessage.doc.mjs. Original SHA-256: 12d7d2694f1f2f08073c0f58802aaca29eebda462c31ab2b4af8f50d16d83f0d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat Message',
  description:
    'Sender context wrapper: handles avatar, name, metadata, and alignment based on sender role.',
  playground: {
    defaults: {
      sender: 'assistant',
      children: {
        __element: 'ChatMessageBubble',
        children: 'Here is the summary you asked for.',
      },
      avatar: {__element: 'Avatar', props: {name: 'Astra', size: 'sm'}},
    },
    wrapper: {component: 'Stack', props: {width: 480}},
  },
  props: [
    {
      name: 'sender',
      type: "'user' | 'assistant' | 'system'",
      description: 'Who sent this message: controls alignment and layout.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Free-form content: bubbles, asset lists, tool calls, images. Custom (non-bubble) children render flush with the message edge; wrap them in a ghost ChatMessageBubble to align them with the bubble text column.',
      required: true,
      slotElements: [
        {
          __element: 'ChatMessageBubble',
          children: 'Message text',
        },
      ],
    },
    {
      name: 'avatar',
      type: 'ReactNode',
      description:
        'Avatar element rendered beside the message. Typically Avatar. `null`, booleans, and empty strings create no slot; any other content that renders nothing collapses its slot.',
      slotElements: [
        {
          __element: 'Avatar',
          props: {
            name: 'User',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'name',
      type: 'ReactNode',
      description:
        "Sender name rendered above the message body; it labels the message. `null`, booleans, and empty strings create no slot, and any other content that renders nothing collapses its slot; either way the message is labelled by the translated sender fallback. Use when the first child is raw content (not a bubble). If the first child is a bubble, put the name on the bubble's `name` prop instead.",
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description:
        "Metadata rendered below the message body. `null`, booleans, and empty strings create no slot; any other content that renders nothing collapses its slot. Use when the last child is raw content (not a bubble). If the last child is a bubble, put metadata on the bubble's `metadata` prop instead.",
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
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density. Inherited from list context if not set.',
      default: "'balanced'",
    },
  ],
}
```
