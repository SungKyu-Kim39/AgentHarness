# Astryx component reference: Chat/ChatSendButton.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatSendButton.doc.mjs. Original SHA-256: 3dcf0265101f4bb049dc1b0f5d2b600ccb8484c7c8033e838e3ecb03afdfe959.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatSendButton',
  subComponentOf: 'Chat',
  displayName: 'Chat Send Button',
  isHiddenFromOverview: true,
  description: 'Circular send/stop toggle button for the chat composer. Place it inside ChatComposer where it reads context automatically: no wiring needed. When streaming starts, the button switches from a primary send icon to a secondary stop icon. Override any context value via props for standalone or custom usage.',
  props: [
    {
      name: 'isStopShown',
      type: 'boolean',
      description: 'Whether the stop button is shown. Defaults to context value.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the send button is disabled. Defaults to !canSend from context.',
    },
    {
      name: 'onSend',
      type: '() => void',
      description: 'Called when the user clicks send. Defaults to context onSubmit.',
    },
    {
      name: 'onStop',
      type: '() => void',
      description: 'Called when the user clicks stop during streaming. Defaults to context onStop.',
    },
    {
      name: 'sendIcon',
      type: 'ReactNode',
      description: 'Custom icon for the send state. Defaults to arrowUp from icon registry.',
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
      name: 'stopIcon',
      type: 'ReactNode',
      description: 'Custom icon for the stop state. Defaults to stop from icon registry.',
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
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Button size.',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  usage: {
    description: 'Use ChatSendButton as ChatComposer’s send control when the action should switch between sending and stopping. Inside ChatComposer it reads readiness, streaming state, and action callbacks from context; standalone usage supplies those values explicitly.',
    bestPractices: [
      {
        guidance: true,
        description: 'Place ChatSendButton inside ChatComposer when its readiness and send or stop lifecycle should follow composer context.',
      },
      {
        guidance: true,
        description: 'For standalone use, provide the state and matching onSend or onStop callback explicitly.',
      },
      {
        guidance: true,
        description: 'Keep the translated Send or Stop accessible name intact when supplying custom icon artwork; the icon is decorative and must not be the only name source.',
      },
      {
        guidance: false,
        description: 'Do not render the stop state without a working onStop callback from props or ChatComposer context.',
      },
      {
        guidance: false,
        description: 'Do not expect isDisabled to disable the stop action; it applies only to the send state.',
      },
    ],
    anatomy: [
      {
        name: 'Action button',
        required: true,
        description: 'Circular icon-only Button that exposes the translated Send or Stop name and carries the chat-send-button theme target.',
      },
    ],
  },
}
```
