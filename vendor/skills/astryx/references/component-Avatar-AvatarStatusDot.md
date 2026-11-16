# Astryx component reference: Avatar/AvatarStatusDot.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Avatar/AvatarStatusDot.doc.mjs. Original SHA-256: 441ca6283b6e4759baa9d39ffc5cf7dd363040477dc30e5e8026d2ddc8e2fd75.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'AvatarStatusDot',
  subComponentOf: 'Avatar',
  displayName: 'Avatar Status Dot',
  isHiddenFromOverview: true,
  description:
    'Size-aware status indicator dot that reads avatar size from context and scales proportionally. Each variant pairs a colour with a distinct built-in shape (filled, ring, minus) so status is never conveyed by colour alone (WCAG 1.4.1).',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description:
        'Semantic variant pairing colour with a distinct shape: success = filled green dot, neutral = grey ring, error = red dot with a minus bar.',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label describing the status. Inside an Avatar it is composed into the avatar\'s accessible name (e.g. "Jane Doe, Online"); the Avatar root is role="img", which prunes child semantics, so the composed name is how the status reaches assistive tech. Standalone dots expose role="img" with this label directly.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon centered inside the dot (hidden at tiny sizes). A rendered icon replaces the built-in shape glyph, so use a different icon per status.',
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
  ],
}
```
