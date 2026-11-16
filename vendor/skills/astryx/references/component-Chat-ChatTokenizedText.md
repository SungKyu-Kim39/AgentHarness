# Astryx component reference: Chat/ChatTokenizedText.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatTokenizedText.doc.mjs. Original SHA-256: 9cdd6de94685a5652f4268f49a096e57f29f5c2170cc02d9c9a118f2a94b40e9.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatTokenizedText',
  subComponentOf: 'Chat',
  displayName: 'Chat Tokenized Text',
  isHiddenFromOverview: true,
  description:
    'Renders a text string with token patterns replaced by inline token content. Wrap any message body inside ChatMessageBubble to turn raw @mentions, #tags, or /commands into styled content. When no non-empty token matches or none are provided, the text renders as-is, so you can use ChatTokenizedText unconditionally on every message.',
  props: [
    {
      name: 'children',
      type: 'string',
      description:
        "The plain text message containing serialized token values. Patterns matching a token's value are replaced with inline token content.",
      required: true,
    },
    {
      name: 'tokens',
      type: 'ChatComposerToken[]',
      description:
        'Token definitions using the same type as composer input. Each non-empty value is matched literally. Empty values are ignored. Structured tokens render a Badge, while custom tokens render caller content.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the root text wrapper. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-chat-tokenized-text'}],
  },
  usage: {
    description:
      'Use ChatTokenizedText inside a chat message when stored plain text contains serialized token values that should be projected as inline badges or caller-rendered token content. Unmatched text is preserved exactly and empty token values are ignored so rendering always finishes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reuse the same token definitions for composer insertion and message rendering so serialized values and visible labels stay aligned.',
      },
      {
        guidance: true,
        description:
          'Use non-empty, stable serialized values so every definition identifies real message text.',
      },
      {
        guidance: false,
        description:
          'Use token labels as a substitute for the surrounding message text; the complete message must remain understandable in reading order.',
      },
      {
        guidance: false,
        description:
          'Put component-owned interaction or accessibility behavior inside a custom token renderer; custom token content remains caller owned.',
      },
    ],
    anatomy: [
      {
        name: 'Tokenized text',
        required: true,
        description:
          'The inline root that preserves unmatched text and carries the chat-tokenized-text theme target.',
      },
      {
        name: 'Rendered token',
        required: false,
        description:
          'Inline token content rendered by Badge for structured tokens or by the caller for custom tokens.',
      },
    ],
  },
}
```
