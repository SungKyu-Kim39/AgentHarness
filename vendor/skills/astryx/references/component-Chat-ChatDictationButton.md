# Astryx component reference: Chat/ChatDictationButton.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatDictationButton.doc.mjs. Original SHA-256: 948dbe73cf193cabb295ea357aa1f32bf19a40bb3498dd95e6a9716fcb834f87.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatDictationButton',
  displayName: 'Chat Dictation Button',
  group: 'Chat',
  category: 'Chat',
  isHiddenFromOverview: true,
  hidden: false,

  keywords: ['dictation', 'microphone', 'voice', 'speech', 'recording', 'stt', 'speech-to-text', 'voice-input', 'mic'],

  usage: {
    description:
      'ChatDictationButton is a toggle button that starts and stops voice dictation inside a chat composer. It pairs with useChatDictation to show a microphone icon when idle and animated frequency bars when listening. Place it in the sendActions slot of ChatComposer.',
    bestPractices: [
      {guidance: true, description: 'Place the dictation button in the sendActions slot of ChatComposer so it sits next to the send button where users expect voice input controls.'},
      {guidance: true, description: 'Pass an inputRef to useChatDictation so interim transcripts appear as ghost text in the composer input while the user speaks.'},
      {guidance: true, description: "Enable hasSounds on useChatDictation to give users audio feedback when dictation starts and stops. This is especially helpful when the button's visual change is subtle."},
      {guidance: false, description: "Don't use the dictation button outside a chat composer context. It's designed for the composer's send-action layout, not as a standalone recording control."},
      {guidance: false, description: "Don't forget to handle the unsupported case. The button hides itself by default when the browser lacks SpeechRecognition, but you should still design the composer to work without it."},
    ],
    anatomy: [
      {name: 'Microphone icon', required: true, description: 'Shown in the idle state. Indicates that tapping will start voice input.'},
      {name: 'Frequency bars', required: false, description: 'Animated equalizer bars that replace the icon during listening. React to real microphone volume.'},
      {name: 'Ghost button', required: true, description: 'The underlying Button with ghost variant and isIconOnly, providing the hit target and focus ring.'},
    ],
  },

  props: [
    {
      name: 'dictation',
      type: 'UseSpeechRecognitionReturn',
      description:
        'The return value from useChatDictation or useSpeechRecognition. Controls all button state: listening, volume, bands, and toggle.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Button size. Matches ChatComposer density.',
      default: "'md'",
    },
    {
      name: 'isHiddenWhenUnsupported',
      type: 'boolean',
      description:
        'When true, renders nothing if the browser does not support SpeechRecognition. When false, keeps the button visible but disabled.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label override. Defaults to "Start dictation" or "Stop dictation" based on state.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],

}
```
