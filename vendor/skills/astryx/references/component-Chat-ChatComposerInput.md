# Astryx component reference: Chat/ChatComposerInput.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatComposerInput.doc.mjs. Original SHA-256: 49923a481075f37287dea80d0b54bd27210f831154532d785353bb9e9eaed6d8.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatComposerInput',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Input',
  isHiddenFromOverview: true,
  description:
    "Rich text input for the chat composer. Supports trigger menus (type @ or / to open a typeahead), inline tokens rendered as badges, message history recall with ArrowUp/Down, paste/drop file handling, and a 16px iOS font-size floor to prevent input zoom. Pass it to ChatComposer's input slot when you need more than a plain textarea.",
  usage: {
    description:
      "Pass ChatComposerInput to ChatComposer's input slot when the draft needs trigger menus, inline tokens, history recall, dictation insertion, or file intake.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Use handleRef for programmatic text or token insertion; inserted text follows the same onChange pipeline as typing.',
      },
      {
        guidance: true,
        description:
          'Use onFiles for files pasted or dropped onto the editor, and keep file validation and upload progress in the product layer.',
      },
      {
        guidance: false,
        description:
          'Use custom token rendering for ordinary mentions or commands; prefer the structured badge form so tokens remain predictable and themeable.',
      },
    ],
    anatomy: [
      {
        name: 'Input root',
        required: true,
        description:
          'The themed container that forwards the root ref and BaseProps styling seams.',
      },
      {
        name: 'Editable surface',
        required: true,
        description:
          'The labeled contenteditable textbox or combobox that owns text, selection, keyboard, paste, and drop behavior.',
      },
      {
        name: 'Placeholder',
        required: false,
        description:
          'Visual guidance shown only while the serialized draft is empty.',
      },
      {
        name: 'Trigger menu',
        required: false,
        description:
          'The suggestion popup rendered while a configured trigger is active.',
      },
      {
        name: 'Inline token',
        required: false,
        description:
          'A non-editable badge or custom rendering with a stable serialized value.',
      },
    ],
  },
  props: [
    {
      name: 'handleRef',
      type: 'React.Ref<ChatComposerInputHandle>',
      description:
        'Imperative handle for programmatic control: insertToken, expandToken, insertText, focus, and getValue.',
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Controlled input value. Pair with onChange for two-way binding.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description:
        'Called when the input value changes. The serialized string includes token placeholders.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the input is empty.',
      default: "'Type a message...'",
    },
    {
      name: 'maxRows',
      type: 'number',
      description:
        'Maximum visible rows before the input scrolls. Use a lower value in compact layouts.',
      default: '8',
    },
    {
      name: 'triggers',
      type: 'ChatComposerTrigger[]',
      description:
        'Trigger definitions for typeahead menus. Each trigger specifies a character (@ or /), a search source, and an onSelect handler that returns the token to insert. Set hasMultiWordQuery: true when suggestions contain spaces (people, topics): the query then runs to a line break or about 64 characters instead of ending at the first space. Per-trigger emptySearchText (ReactNode) is the message when the query matched nothing.',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        'Debounce delay for async search sources to avoid excessive network requests.',
      default: '150',
    },
    {
      name: 'hasHistory',
      type: 'boolean',
      description:
        'Enable ArrowUp/Down to recall previously submitted messages.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label announced by screen readers.',
      default: "'Message input'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input. Use during streaming or when a prerequisite is unmet.',
      default: 'false',
    },
    {
      name: 'onPaste',
      type: '(event, text) => boolean | void',
      description:
        'Called when plain text is pasted. Return true after handling the text yourself; otherwise ChatComposerInput inserts it or applies paste-as-token behavior.',
    },
    {
      name: 'pasteAsToken',
      type: 'UseChatPasteAsTokenReturn | false',
      description:
        'Paste-as-token behavior. By default, plain-text pastes over 200 characters become expandable tokens. Pass false to keep every text paste inline, or provide useChatPasteAsToken() to customize the conversion.',
    },
    {
      name: 'onFiles',
      type: '(files: File[]) => void',
      description:
        'Called when files are pasted or dropped onto the input. Use to handle attachments.',
    },
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      description:
        'Called when the user presses Enter without Shift. The serialized value includes token placeholders.',
    },
    {
      name: 'onKeyDown',
      type: '(event) => void',
      description:
        'Key-down handler invoked before the built-in Enter/history behavior (after any open trigger menu). The seam for platform-specific keys: call event.preventDefault() to suppress the default submit (e.g. newline on a touch keyboard), or act on the event yourself to add behavior (e.g. submit on Cmd/Ctrl+Enter). IME composition is always respected; Enter never submits mid-composition.',
    },
    {
      name: 'enterKeyHint',
      type: "'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'",
      description:
        'What the Return key of a touch keyboard says (the native enterkeyhint). Enter sends the message, so it defaults to send and iOS shows its Send key. When onKeyDown makes Enter insert a line break on touch keyboards, pass enter so the key shows Return again.',
      default: "'send'",
    },
  ],
}
```
