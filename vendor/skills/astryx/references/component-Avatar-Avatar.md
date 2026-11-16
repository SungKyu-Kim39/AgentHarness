# Astryx component reference: Avatar/Avatar.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Avatar/Avatar.doc.mjs. Original SHA-256: 8772ab710a3cdee227270625fe4e4227d89adb2b06e3828550cb3e46c0a5ee89.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Avatar',
  displayName: 'Avatar',
  group: 'Avatar',
  category: 'Content',
  keywords: ["avatar","profile","user","photo","thumbnail","initials","gravatar","pfp","userpic"],
  usage: {
    description:
      'Avatar represents a person or team with a profile photo, initials, or a default icon. Use it in comment headers, contact lists, chat messages, user cards, and anywhere you need to identify someone visually.',
    bestPractices: [
      {guidance: true, description: 'Always pass a name so the avatar can show initials if the photo fails to load, and so screen readers can announce who it represents.'},
      {guidance: true, description: 'Pick a size that matches the context: xsm or sm for inline mentions, md or lg for lists and cards, xl for profile headers.'},
      {guidance: true, description: 'Add a status dot when knowing someone\'s availability matters, like in chat or team views.'},
      {guidance: true, description: 'When wrapping an Avatar in your own Tooltip or HoverCard, set tooltip={false} so the built-in name tooltip does not overlap yours.'},
      {guidance: true, description: 'Give every interactive avatar (href or onClick) a name or alt. It is the control\'s accessible name, and it warns in development when it is missing.'},
      {guidance: false, description: 'Rely on a status label to name an interactive avatar. "Online" says nothing about where the link goes.'},
      {guidance: false, description: 'Use Avatar for logos, product images, or anything that isn\'t a person or team. Use an image or icon instead.'},
      {guidance: false, description: 'Use xstyle or className to override shape. Use the shape prop instead so themes can control it globally.'},
    ],
    anatomy: [
      {name: 'Photo', required: false, description: 'The profile image, loaded from the src URL. Shown when available.'},
      {name: 'Initials', required: false, description: 'The first letter, digit or emoji of the first and last words of the name; punctuation is skipped. Shown when no photo is available. A name with no letters, digits or emoji shows the default icon instead. Like the photo, the initials are part of the picture: assistive technology reads the name, not the letters.'},
      {name: 'Default icon', required: false, description: 'A generic person silhouette. Shown when there is no photo or name.'},
      {name: 'Status dot', required: false, description: 'A small indicator in the bottom-right corner showing availability (online, away, busy). Each variant pairs colour with a distinct shape so status does not rely on colour alone.'},
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-avatar', visualProps: ['size', 'shape']},
      {className: 'astryx-avatar-fallback', visualProps: ['size']},
      {className: 'astryx-avatar-status-dot', visualProps: ['variant']},
      {className: 'astryx-avatar-status-dot-glyph', visualProps: ['shape']},
    ],
    vars: [
      {name: '--_avatar-group-overlap', description: 'Negative inline offset applied to every avatar stacked in an AvatarGroup; the group pads its start edge by the same amount so the first avatar stays inside it. Set from the group size; a more negative value tightens the stack.', default: 'set at runtime from the group avatar size (px)', private: true},
      {name: '--_avatar-radius', description: 'Border radius of the avatar wrapper, content, focus ring, and the AvatarGroupOverflow "+N" chip. Set per shape variant by shapeStyles.', default: 'var(--radius-full)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_avatar-radius']},
    ],
  },
  description: 'Displays a user avatar with image, initials fallback, and optional status indicator.',
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Primary image source URL.',
    },
    {
      name: 'fallbackSrc',
      type: 'string',
      description: 'Fallback image when primary fails.',
    },
    {
      name: 'name',
      type: 'string',
      description: 'User name for initials and alt text.',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text (falls back to name).',
    },
    {
      name: 'size',
      type:
        "'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180",
      description:
        "Avatar size: named sizes are 'xsm' (20px), 'sm' (24px), 'md' (36px), 'lg' (48px), and 'xl' (128px); numeric sizes must be one of the pixel values listed in the type. Inside an AvatarGroup, the group's size always overrides this prop, including when the group uses its default size.",
      default: "'md'",
    },
    {
      name: 'shape',
      type: "'circle' | 'rounded' | 'square'",
      description: "Shape variant of the avatar. 'circle' (default) stays fully round. 'rounded' uses the element radius token so it matches UI corner rounding and can be set globally via theme. 'square' has no radius. Status dot positioning adapts automatically: 4-o'clock on circle, bottom-right corner on rounded/square.",
      default: "'circle'",
    },
    {
      name: 'status',
      type: 'ReactNode',
      description: 'Corner content for status indicators. AvatarStatusDot reports its `label` to the avatar, which composes it into the accessible name (e.g. "Jane Doe, Online") so screen readers announce the status. Reporting goes through context, so it still works when the dot sits inside a wrapper component of your own.',
      slotElements: [
        {
          __element: 'AvatarStatusDot',
          props: {
            variant: 'success',
            label: 'Online',
          },
        },
      ],
    },
    {
      name: 'tooltip',
      type: 'string | boolean',
      description:
        "Tooltip shown on hover and keyboard focus. Omitted or true shows the avatar's name; a string shows that text instead; false shows no tooltip. Not auto-disabled when wrapped in your own Tooltip/HoverCard. Set tooltip={false} if you supply your own overlay. No tooltip is shown when tooltip is true/omitted and there is no name.",
      default: 'true',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'When set, the avatar renders as an interactive link (`<a>` or a custom link component) pointing here. This follows the same element-swap rule as Button. Requires a meaningful accessible name via `alt` or `name`: an interactive avatar without one warns in development. Inside an AvatarGroup, interactive avatars share a single Tab stop and are reached with arrow keys.',
    },
    {
      name: 'as',
      type: 'ElementType',
      description:
        'Custom link component used when `href` is set (e.g. `next/link`). Overrides the provider-level LinkProvider default. Only applies with `href`.',
    },
    {
      name: 'target',
      type: 'string',
      description: 'Link target attribute. Only applies with `href`.',
    },
    {
      name: 'rel',
      type: 'string',
      description: 'Link rel attribute. Only applies with `href`.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        'Click handler. When set without `href`, the avatar renders as a focusable `<button type="button">`. Requires a meaningful accessible name via `alt` or `name`: an interactive avatar without one warns in development.',
    },
  ],
  components: [
    {name: 'AvatarStatusDot'},
  ],
}
```
