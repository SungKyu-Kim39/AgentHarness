# Astryx component reference: Chat/ChatComposerTokenElement.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatComposerTokenElement.doc.mjs. Original SHA-256: cb733596802c689e1bb4badf5085f1cfcd4282a34ad480dee977cbed1df014b5.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatComposerTokenElement',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Token Element',
  isHiddenFromOverview: true,
  description: 'Renders a single token chip outside the contentEditable input. Wraps a badge config or custom render function in the correct data-astryx-token span so the token serializes properly and stays visually consistent with tokens inside the composer.',
  playground: {
    defaults: {
      token: {value: '@astryx', label: '@astryx', variant: 'blue'},
    },
  },
  props: [
    {
      name: 'token',
      type: 'ChatComposerToken',
      description: 'The token to render. Pass a badge config ({ value, label, variant?, icon? }) for the common case, or a custom render ({ value, render }) for full control.',
      required: true,
    },
  ],
}
```
