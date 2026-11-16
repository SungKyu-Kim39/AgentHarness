# Astryx component reference: Chat/Chat.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/Chat.doc.mjs. Original SHA-256: 1b33214abffd2a9246c25c43647f1fded6587adb729a9b5e083409453f9c7399.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Chat',
  displayName: 'Chat',
  group: 'Chat',
  category: 'Chat',
  // ChatPastedTextToken is an internal helper (not exported from index.ts).
  // Hide it from the component listing so it doesn't surface as an undocumented entry.
  hiddenComponents: ['ChatPastedTextToken'],
  keywords: ['chat', 'message', 'bubble', 'conversation', 'ai', 'assistant', 'thread', 'system-message', 'composer', 'mention', 'trigger', 'typeahead', 'token', 'imperative', 'tokenized-text'],
  theming: {
    targets: [
      {className: 'astryx-chat-layout', visualProps: ['density']},
      {className: 'astryx-chat-composer', visualProps: ['density']},
      {className: 'astryx-chat-composer-input'},
      {className: 'astryx-chat-composer-drawer', visualProps: ['collapsed']},
      {className: 'astryx-chat-message', visualProps: ['sender', 'density']},
      {
        className: 'astryx-chat-message-bubble',
        visualProps: ['sender', 'variant', 'density'],
      },
      {className: 'astryx-chat-message-list', visualProps: ['density']},
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
      {className: 'astryx-chat-message-metadata'},
      {className: 'astryx-chat-send-button'},
      {className: 'astryx-chat-dictation-button'},
      {className: 'astryx-chat-layout-scroll-button'},
      {className: 'astryx-chat-tokenized-text'},
      {className: 'astryx-chat-tool-calls'},
      {className: 'astryx-trigger-menu'},
    ],
    vars: [
      {name: '--_chat-composer-radius', description: 'Border radius of the composer body. Inner elements derive their radius concentrically.', default: 'var(--radius-chat)', private: true},
      {name: '--_chat-composer-padding', description: 'Padding of the composer body. Used in the concentric radius calculation.', default: 'var(--spacing-3)', private: true},
      {name: '--_chat-avatar-offset', description: 'Top offset of a message avatar: the name row spacing when a bubble in the message shows a name, else 0px. Each message sets it from its own content. Not a theming lever.', default: '0px', private: true},
      {name: '--_button-radius', description: 'Concentric button radius inside the composer.', default: 'max(var(--radius-element), calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))', private: true, derived: true, formula: 'max(var(--radius-element), calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))'},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_chat-composer-radius']},
      {property: 'padding', vars: ['--_chat-composer-padding']},
    ],
  },
  components: [
    {name: 'ChatMessageList'},
    {name: 'ChatMessage'},
    {name: 'ChatMessageBubble'},
    {name: 'ChatMessageMetadata'},
    {name: 'ChatSystemMessage'},
    {name: 'ChatComposer'},
    {name: 'ChatComposerInput'},
    {name: 'ChatComposerDrawer'},
    {name: 'ChatSendButton'},
    {name: 'ChatToolCalls'},
    {name: 'ChatTokenizedText'},
    {name: 'ChatComposerTokenElement'},
    {name: 'ChatLayout'},
    {name: 'ChatLayoutScrollButton'},
  ],
  usage: {
    description: 'Chat is a family of composable primitives for building AI and human chat experiences. Combine ChatLayout, ChatMessageList, ChatMessage, bubbles, system messages, tool calls, tokenized text, and ChatComposer to assemble complete conversations without reimplementing sender-aware layout, density, scrolling, or composer behavior.',
    bestPractices: [
      { guidance: true, description: 'Compose messages using MessageList > Message > Bubble for consistent sender-aware styling and density.' },
      { guidance: true, description: 'Set the density prop to control spacing globally: compact for sidebars, balanced for most views, spacious for long-form reading. Individual messages can override.' },
      { guidance: true, description: 'Use gap when top-level rows are independent (for example, LLM tool events or streamed blocks) and list spacing needs to be tuned separately from density.' },
      { guidance: true, description: 'Use the group prop on bubbles (first, middle, last) when a single sender sends multiple consecutive messages; it tightens corner radius to visually connect them.' },
      { guidance: true, description: 'Use ChatSystemMessage with variant="divider" for date separators and default for inline status notices like joins, leaves, or topic changes.' },
      { guidance: true, description: 'Put name on the first bubble and metadata on the last bubble in a message so they align with the bubble\'s inline padding.' },
      { guidance: true, description: 'Wrap custom in-message content (cards, attachments, citations) in a ghost bubble so it aligns with the bubble text column; add width="100%" when it should span the full message column instead of the default bubble width cap.' },
      { guidance: true, description: 'Provide an emptyState prop so new users see a clear prompt to start a conversation instead of a blank screen.' },
      { guidance: true, description: 'Use the ghost bubble variant for AI-style responses that show rich content like code blocks or markdown without a visible boundary.' },
      { guidance: false, description: 'Don\'t use ChatSystemMessage for sender content; it has no avatar, alignment, or bubble. Use ChatMessage with a sender role instead.' },
      { guidance: false, description: 'Don\'t put long or multi-line content in a system message; keep it to a single short sentence. If you need more, use a bubble or a card.' },
      { guidance: false, description: 'Don\'t nest ChatMessage inside another ChatMessage; each message is a standalone article element with its own sender context.' },
      { guidance: false, description: 'Don\'t apply a fixed height directly on the message list; wrap it in a sized container and let the list fill with flex: 1.' },
      { guidance: false, description: 'Don\'t mix filled and ghost bubble variants within the same sender\'s messages; pick one style per side and use it consistently.' },
      { guidance: false, description: 'Don\'t place metadata or names on both the bubble and the message wrapper; pick one based on whether the content has a bubble boundary.' },
],
    anatomy: [
      { name: 'Message area', required: true, description: 'Scrollable region for messages. Renders children (typically ChatMessageList) in a flex column that pushes content to the bottom when the list is short.' },
      { name: 'Frosted glass dock', required: true, description: 'Sticky or fixed container at the bottom with a backdrop-blur layer. Houses the scroll button and composer.' },
      { name: 'Scroll-to-bottom button', required: false, description: 'Appears when the user scrolls up or new messages arrive. Defaults to ChatLayoutScrollButton; pass null to hide or a custom element to override.' },
      { name: 'Composer', required: true, description: 'The input area for sending messages, typically ChatComposer. Docked at the bottom inside the frosted glass layer.' },
      { name: 'Empty state', required: false, description: 'Centered placeholder shown when no messages exist. Use EmptyState for a consistent look.' },
      { name: 'Avatar', required: false, description: 'A sender avatar rendered beside the message. Typically Avatar with size="md". Hidden for system messages.' },
      { name: 'Name', required: false, description: 'Sender name above the message body. Place on the bubble when using bubbles, or on the message wrapper for raw content.' },
      { name: 'Content', required: true, description: 'The message body: one or more ChatMessageBubble elements, or any free-form ReactNode like images or tool calls. Wrap non-bubble content in a ghost bubble to align it with the bubble text column.' },
      { name: 'Metadata', required: false, description: 'Timestamp, delivery status, and footer actions below the message. Place on the last bubble or on the message wrapper.' },
    ],
  },
}
```
