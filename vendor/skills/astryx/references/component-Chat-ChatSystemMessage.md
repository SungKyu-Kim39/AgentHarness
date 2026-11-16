# Astryx component reference: Chat/ChatSystemMessage.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatSystemMessage.doc.mjs. Original SHA-256: 96a4a168c76b5489fd3788cdd7d80ed8d2f6ed2896a96701d311e289bed01b36.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatSystemMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat System Message',
  description:
    'Centered system message for non-sender content like date separators, membership changes, and status notices. It is not a chat bubble; it has no avatar, no alignment, and no sender context. Use the divider variant for temporal breaks and default for inline status updates.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'System message content: factual text or React content such as a date, join/leave notice, or status change. Long default content wraps within the available width.',
      required: true,
    },
    {
      name: 'variant',
      type: "'default' | 'divider'",
      description:
        "Visual variant. 'default' renders centered text. 'divider' adds horizontal lines on each side via Divider: use for date separators and section breaks.",
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Optional caller-provided icon content. Rendered before the message in the default variant; the divider variant currently does not render it. Wrap in Icon for consistent sizing.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'Use ChatSystemMessage for concise, non-sender content inside a chat transcript. Choose the default variant for factual status notices and the divider variant for date or section breaks. Long default content wraps within the available width. It carries no live role: inside a ChatMessageList, the log announces new notices. The divider branch includes a labelled separator.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the visible message concise and self-contained so it remains understandable without an icon.',
      },
      {
        guidance: true,
        description:
          'Use the divider variant for temporal or section boundaries and the default variant for factual status notices.',
      },
      {
        guidance: false,
        description:
          'Use ChatSystemMessage for sender-authored content; use ChatMessage and ChatMessageBubble instead.',
      },
      {
        guidance: false,
        description:
          'Use caller-provided icon artwork as the only source of meaning; the visible message must carry the same information.',
      },
    ],
    anatomy: [
      {
        name: 'System message',
        required: true,
        description:
          'The noninteractive status row that carries the chat-system-message theme target.',
      },
      {
        name: 'Content',
        required: true,
        description: 'The concise caller-provided message or divider label.',
      },
      {
        name: 'Icon content',
        required: false,
        description:
          'Rendered before the message in the default variant; the divider variant currently does not render it.',
      },
      {
        name: 'Divider',
        required: false,
        description:
          'A labelled horizontal Divider rendered by the divider variant.',
      },
    ],
  },
}
```
