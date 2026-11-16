# Astryx component reference: Chat/ChatMessageMetadata.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatMessageMetadata.doc.mjs. Original SHA-256: 3aac145a6c1d89786946516052735ea54e813b9ff817c3ca1738725d96dfb92d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatMessageMetadata',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Metadata',
  description:
    'Composable metadata row for chat messages. Renders timestamp, footer content, and delivery status in a single row. Direction reverses for user sender. Omits the row when both slots are omitted or non-rendering scalars and status is omitted.',
  props: [
    {
      name: 'timestamp',
      type: 'ReactNode',
      description: 'Timestamp content: a string or Timestamp component.',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Just now',
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description: 'Footer content: model info, reaction buttons, copy button.',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Footer content',
        },
      ],
    },
    {
      name: 'status',
      type: "'sending' | 'sent' | 'delivered' | 'read' | 'error'",
      description: 'Message delivery status. Shows icon + label.',
    },
  ],
  usage: {
    description:
      'Place ChatMessageMetadata below a message or in the last ChatMessageBubble metadata slot to show a timestamp, footer content, and optional delivery status. Non-rendering scalar slots (booleans and empty strings) create no separator; numeric zero remains visible. Composite React content remains caller-owned.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put metadata in the last bubble metadata slot when the message uses bubbles, so it follows the bubble content.',
      },
      {
        guidance: true,
        description:
          'Pass timestamp and footer content independently; separators are omitted for non-rendering scalar slots. Composite React nodes are used as supplied.',
      },
      {
        guidance: false,
        description:
          'Do not supply footer actions without their own accessible names and interaction behavior; the metadata row does not own those controls.',
      },
      {
        guidance: false,
        description:
          'Do not put the same metadata on both a bubble and its enclosing message.',
      },
    ],
    anatomy: [
      {
        name: 'Metadata row',
        required: true,
        description: 'Sender-aware line containing the visible metadata items.',
      },
      {
        name: 'Timestamp',
        required: false,
        description:
          'Caller-supplied time content at the start of the logical sequence.',
      },
      {
        name: 'Footer',
        required: false,
        description:
          'Caller-supplied information or actions between time and status.',
      },
      {
        name: 'Status',
        required: false,
        description:
          'Localized delivery icon and text when a status is supplied.',
      },
    ],
  },
}
```
