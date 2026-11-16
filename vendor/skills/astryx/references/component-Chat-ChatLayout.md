# Astryx component reference: Chat/ChatLayout.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatLayout.doc.mjs. Original SHA-256: 3b615040073ee1e8a70fa4a369dfe5c11076dc00ccea85420d57d10aa2539917.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatLayout',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout',
  description: 'Layout shell for full chat interfaces. Messages flow in normal page flow, composer is fixed to the bottom with a frosted glass dock. Set density (compact/balanced/spacious) to control spacing, message max-width, and blur layer sizing. Includes built-in auto-scroll, a "New messages" scroll-to-bottom button, and a frosted glass blur layer behind the composer. By default the layout root is the scroll container; pass scrollRef to delegate scrolling to a parent element or the document body. Where the visual viewport shrinks for the software keyboard, the composer stays on top of the keyboard, and a conversation at its newest message stays there. In Chrome on Android the composer rides Gboard\u2019s slides in step with them. In Safari on iOS (in the browser and as a home-screen app) and in Firefox for Android, it moves above the keyboard once the browser reports it. On a touch screen, in a top-level page, every way into the composer\u2019s text (a tap, the keyboard\u2019s previous and next buttons, Tab, the input\u2019s focus()) focuses it without scrolling the page; under a mouse or inside an iframe the browser\u2019s own focus applies. Where your page sets interactive-widget=resizes-content, Chrome on Android shrinks the page for the keyboard itself and the composer stays above it without moving (see the browser-support guide).',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Message content: typically ChatMessageList. Flows naturally in the page and scrolls with the container.',
      required: true,
    },
    {
      name: 'composer',
      type: 'ReactNode',
      description: 'Composer element: typically ChatComposer. Fixed to the bottom with a frosted glass dock.',
      required: true,
      slotElements: [
        {
          __element: 'TextInput',
          props: {
            label: 'Input',
            placeholder: 'Type here...',
          },
        },
      ],
    },
    {
      name: 'emptyState',
      type: 'ReactNode',
      description: 'Content shown when children is empty. Centered vertically in the message area.',
      slotElements: [
        {
          __element: 'EmptyState',
          props: {
            title: 'No items',
            description: 'Nothing to show.',
          },
        },
      ],
    },
    {
      name: 'scrollButton',
      type: 'ReactNode | null',
      description: 'Scroll-to-bottom button rendered above the composer. Defaults to ChatLayoutScrollButton with auto-scroll integration. Pass null to hide.',
    },
    {
      name: 'scrollRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'External scroll container ref. When provided, auto-scroll and scroll-to-bottom target this element instead of the layout root. Use when the chat is embedded in a page where a parent element or the document body scrolls.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density: controls dock padding, message-area max-width and inline padding, and the height of the frosted glass blur layer.',
      default: "'balanced'",
    },
  ],
  usage: {
    description: 'ChatLayout is the layout shell for full-page chat interfaces. It renders messages in normal page flow and docks the composer to the bottom with a frosted glass blur layer. Set the density prop to control spacing; it defaults to balanced. Use it to wrap ChatMessageList and ChatComposer for a complete chat experience with built-in auto-scroll and a scroll-to-bottom button.',
    bestPractices: [
      {
        guidance: true,
        description: 'Pass ChatMessageList as children and ChatComposer as the composer prop for a complete chat interface.',
      },
      {
        guidance: true,
        description: 'Provide an emptyState so new conversations show a prompt instead of a blank screen.',
      },
      {
        guidance: true,
        description: 'Use scrollRef when the chat is embedded in a page where a parent element handles scrolling.',
      },
      {
        guidance: true,
        description: "Give a full-page ChatLayout a container 100dvh tall, not 100vh: where a phone browser's toolbar collapses, 100vh is the viewport with the toolbar hidden, so the composer would start below the screen's edge.",
      },
      {
        guidance: true,
        description: 'Markdown prose keeps its 680px measure, while code blocks and tables span the message column. To give a reply one right edge, pass contentWidth="100%" to its Markdown.',
      },
      {
        guidance: false,
        description: "Don't apply a fixed height on the layout; let it fill its container with flex: 1.",
      },
      {
        guidance: false,
        description: "Don't render multiple ChatLayout instances in the same scroll container; each expects to own its scroll context.",
      },
    ],
    anatomy: [
      {
        name: 'Message area',
        required: true,
        description: 'Scrollable region for messages. Renders children (typically ChatMessageList) in a flex column that pushes content to the bottom when the list is short.',
      },
      {
        name: 'Frosted glass dock',
        required: true,
        description: 'Sticky or fixed container at the bottom with a backdrop-blur layer. Houses the scroll button and composer. While a software keyboard is up it sits on top of the keyboard, and the message area gets room to scroll above it.',
      },
      {
        name: 'Scroll-to-bottom button',
        required: false,
        description: 'Appears when the user scrolls up or new messages arrive. Defaults to ChatLayoutScrollButton; pass null to hide or a custom element to override.',
      },
      {
        name: 'Composer',
        required: true,
        description: 'The input area for sending messages, typically ChatComposer. Docked at the bottom inside the frosted glass layer. In a top-level page on a touch screen, its wrapper (without the scroll button) is a group with no name. When the keyboard\u2019s Done ends typing, focus rests on that group (it is no tab stop), so the next tap or Tab starts from the composer. It shows the focus ring after keyboard input only. Under a mouse or inside an iframe, the wrapper is a plain container.',
      },
      {
        name: 'Empty state',
        required: false,
        description: 'Centered placeholder shown when no messages exist. Use EmptyState for a consistent look.',
      },
    ],
  },
}
```
