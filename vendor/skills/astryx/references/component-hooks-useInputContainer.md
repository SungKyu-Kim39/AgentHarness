# Astryx component reference: hooks/useInputContainer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useInputContainer.doc.mjs. Original SHA-256: 65e39c5f2a6efcfa3a3616cf098d64923733809ea36f513fe86f555834a2ea2f.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useInputContainer',
  displayName: 'useInputContainer',
  keywords: ['input', 'container', 'focus', 'delegate', 'wrapper', 'text', 'textarea', 'click', 'icon', 'padding'],
  params: [
    {
      name: 'options',
      type: 'UseInputContainerOptions',
      description: 'Configuration object for the input container.',
      required: true,
    },
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the outer container/wrapper element.',
      required: true,
    },
    {
      name: 'options.inputRef',
      type: 'RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLElement | null>',
      description: 'Ref to the inner input or textarea element.',
      required: true,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Click handler to attach to the container wrapper.',
    },
    {
      name: 'onMouseUp',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Mouse up handler to attach to the container wrapper.',
    },
  ],
  usage: {
    description:
      'Makes an input container wrapper clickable, delegating focus to the inner input/textarea when the user clicks non-interactive areas (icons, padding, status indicators). Built on top of useClickableContainer, so nested interactive elements (clear buttons, calendar toggles, links) are handled safely; clicking them does NOT steal focus from the input. Automatically detects input type: text-like inputs receive .focus(), while other types (checkbox, radio, file) receive .click().',
    bestPractices: [
      { guidance: true, description: 'Use inside input wrapper components (TextInput, NumberInput, TimeInput, TextArea) to make the full container area clickable.' },
      { guidance: true, description: 'Attach both onClick and onMouseUp to the wrapper div for full interaction handling.' },
      { guidance: false, description: 'Use on bare inputs without a wrapper; there is no benefit if the input already fills the full clickable area.' },
    ],
  },
  relatedComponents: ['TextInput', 'NumberInput', 'TimeInput', 'TextArea'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
