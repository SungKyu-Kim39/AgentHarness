# Astryx component reference: hooks/useInputStatusIcon.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useInputStatusIcon.doc.mjs. Original SHA-256: b886b4371cd11e33f26c3be5c5fd74b0140571bbe562460f54fccbc30b368414.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useInputStatusIcon',
  displayName: 'useInputStatusIcon',
  keywords: [
    'input',
    'status',
    'icon',
    'error',
    'warning',
    'success',
    'validation',
    'tooltip',
    'info tip',
    'field',
    'describedby',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseInputStatusIconOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.status',
      type: 'InputStatus',
      description:
        "The input's status (type plus message), or undefined when there is none.",
    },
    {
      name: 'options.statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description: 'How the status is presented relative to the input.',
      default: "'attached'",
    },
    {
      name: 'options.isInGroup',
      type: 'boolean',
      description:
        'Whether the input sits inside an InputGroup, which owns status rendering itself.',
      default: 'false',
    },
    {
      name: 'options.size',
      type: 'IconSize',
      description: 'Size of the on-field icon.',
      default: "'md'",
    },
  ],
  returns: [
    {
      name: 'statusIcon',
      type: 'ReactNode',
      description:
        'The affordance to render inside the input container: a plain icon, or a focusable info-tip button with its tooltip. Null when no icon should render.',
    },
    {
      name: 'describedBy',
      type: 'string | undefined',
      description:
        "ID to add to the input's aria-describedby, present exactly when a tooltip element is in the DOM, so there is never a dangling reference.",
    },
  ],
  usage: {
    description:
      'Builds the on-field status affordance for a bordered input and its accessibility wiring, so every input in the family behaves the same for a given status. The attached variant renders a plain glyph and leaves the text to the message box; the detached variant renders nothing here, because the message box already carries its own icon; the tooltip variant renders a real focusable button whose tooltip is reachable by keyboard, pointer, touch and assistive tech. Use it when building a bordered input, not for field-level messaging.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Render statusIcon inside the input container and merge describedBy into the control's aria-describedby list.",
      },
      {
        guidance: true,
        description:
          'Let it decide when nothing should render; pass isInGroup and the variant through rather than branching at the call site.',
      },
      {
        guidance: false,
        description:
          'Use it to convey the status by icon alone; the tooltip variant is the only one that carries the message, so the others still need a message box.',
      },
    ],
  },
  relatedComponents: [
    'TextInput',
    'TextArea',
    'NumberInput',
    'DateInput',
    'FileInput',
    'FieldStatus',
    'InputGroup',
  ],
  relatedHooks: ['useInputContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
