# Astryx component reference: Chat/ChatComposer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatComposer.doc.mjs. Original SHA-256: 9417b045b00aa65bfe18827315898e91a0b0515445644395c245a1302ce8d602.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatComposer',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer',
  description:
    'Layout shell for a chat composer. Arranges named slots (drawer, header, input, footer, send) with page-radius container, elevation, a keyboard-only editor focus ring, and concentric inner radius for child elements.',
  usage: {
    description:
      'ChatComposer is the message-entry shell for a chat surface. It coordinates a controlled or uncontrolled draft, provides a default token-capable input and send/stop action, and arranges optional drawer, header, footer, and status content. Custom inputs and send controls can join the same value, submission, disabled, stop, and focus contract through useChatComposerContext().',
    anatomy: [
      {name: 'Composer frame', required: true, description: 'Outer composition root that groups the body with an optional status message above or below it.'},
      {name: 'Composer body', required: true, description: 'Rounded, elevated surface containing the header, input, and footer.'},
      {name: 'Drawer', required: false, description: 'Content before the body for attachments or other expandable context, typically ChatComposerDrawer.'},
      {name: 'Header', required: false, description: 'Row for start-aligned actions and end-aligned contextual information.'},
      {name: 'Input', required: true, description: 'Default ChatComposerInput or a custom editor connected through useChatComposerContext().'},
      {name: 'Footer', required: true, description: 'Row for caller-supplied footer and send actions plus the primary action.'},
      {name: 'Send or stop action', required: true, description: 'Default ChatSendButton or a custom sendButton; it submits the current draft or requests interruption.'},
      {name: 'Status message', required: false, description: 'Error or warning feedback rendered before or after the composer body.'},
    ],
  },
  playground: {
    wrapper: {component: 'Stack', props: {width: 480}},
  },
  props: [
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      description: 'Called when the user submits a message.',
      required: true,
    },
    {
      name: 'onStop',
      type: '() => void',
      description: 'Called when the user requests to stop generation.',
    },
    {
      name: 'isStopShown',
      type: 'boolean',
      description: 'Whether the stop button is shown instead of the send button.',
      default: 'false',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Controlled input value.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Change handler for controlled mode.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the input is empty.',
      default: "'Type a message...'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the composer.',
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density.',
      default: "'balanced'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low'",
      description:
        "Resting elevation of the composer body. `low` (the default) keeps today's raised look: low at rest, bumping to med on hover / focus. `none` flattens it and draws a border. Keyboard focus in the editor adds the shared focus ring in either presentation; pointer focus does not add that ring.",
      default: "'low'",
    },
    {
      name: 'drawer',
      type: 'ReactNode',
      description: 'Slot: collapsible drawer above the input: attachments, context chips, etc. Use ChatComposerDrawer.',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Drawer content',
        },
      ],
    },
    {
      name: 'headerActions',
      type: 'ReactNode',
      description: 'Slot: left-aligned header actions (attach, mention buttons). Use icon-only size="sm" buttons.',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'headerContext',
      type: 'ReactNode',
      description: 'Slot: right-aligned contextual info in the header (context window usage, ProgressBar, supporting text).',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Context',
        },
      ],
    },
    {
      name: 'input',
      type: 'ReactNode',
      description: 'Slot: custom input element. Replaces the default input. Use ChatComposerInput for trigger menus/tokens, or wire any input (plain textarea, rich editor) to the composition contract via useChatComposerContext(): read value/onChange/onSubmit/canSend and register a focus control on inputControlRef so body-click-to-focus works.',
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
      name: 'footerActions',
      type: 'ReactNode',
      description: 'Slot: left-aligned footer actions (model selector, etc).',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'sendActions',
      type: 'ReactNode',
      description: 'Slot: actions to the left of the send button.',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'sendButton',
      type: 'ReactNode',
      description: 'Slot: custom send button. Replaces the default send/stop button.',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning'; message?: string }",
      description: 'Status message rendered below (or above) the composer.',
    },
    {
      name: 'statusPosition',
      type: "'top' | 'bottom'",
      description: 'Where to render the status.',
      default: "'bottom'",
    },
  ],
}
```
