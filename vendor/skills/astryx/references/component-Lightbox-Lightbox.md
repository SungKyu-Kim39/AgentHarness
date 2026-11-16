# Astryx component reference: Lightbox/Lightbox.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Lightbox/Lightbox.doc.mjs. Original SHA-256: bfce6309c6e633e3a267ca12fb3e4bf4d9912949cd652ff1aba3e7f6ef4a10a1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Lightbox',
  displayName: 'Lightbox',
  category: 'Overlay',
  keywords: [
    'lightbox',
    'image',
    'video',
    'viewer',
    'gallery',
    'zoom',
    'fullscreen',
    'media',
    'photo',
    'preview',
  ],
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the lightbox is open.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Callback when the lightbox open state changes: the Close button, Escape, a tap beside the media, or, on a phone or tablet, dragging a photo down from its fitted size.',
      required: true,
    },
    {
      name: 'media',
      // Left as the named type on purpose: the shape carries `caption?:
      // ReactNode`, so spelling it out makes the docsite playground parse the
      // whole prop as an editable *string*, which would feed the preview text
      // where a media object belongs. The shape and its legal values live in
      // the description instead (#1645).
      type: 'LightboxMedia | LightboxMedia[]',
      description:
        "Media to display. Pass a single object for one item, or an array for gallery mode with prev/next navigation (on a phone or tablet, a swipe moves between items too). Each item is {src: string, alt: string, caption?: ReactNode, type?: 'image' | 'video'}; type defaults to 'image', and zoom/pan is disabled for 'video'.",
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: 'Current index in gallery mode (when media is an array).',
    },
    {
      name: 'onIndexChange',
      type: '(index: number) => void',
      description:
        'Callback when the gallery index changes: prev/next, the arrow keys, or a swipe.',
    },
    {
      name: 'hasZoom',
      type: 'boolean',
      description:
        'Enable zoom (images only): pinch (or ctrl-wheel), or double-tap or double-click to zoom in at that point and back; Enter/Space/+/- zoom 2× about the centre and back, and 0 returns to the fitted size. When zoomed, drag or scroll a trackpad to pan, or use arrow keys; on a phone or a tablet, the pan has momentum.',
      default: 'false',
    },
    {
      name: 'defaultIndex',
      type: 'number',
      description:
        'Initial image index in gallery mode for uncontrolled usage.',
      default: '0',
    },
    {
      name: 'hasAutoPlay',
      type: 'boolean',
      description:
        'Automatically start video playback when a video media item is shown.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be stylex.create() value.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-lightbox', visualProps: []}],
  },
  usage: {
    anatomy,
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation and swiping, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide alt text for every image for screen reader accessibility.',
      },
      {
        guidance: true,
        description:
          'Use gallery mode with onIndexChange for multi-image sets.',
      },
      {
        guidance: true,
        description:
          'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.',
      },
      {
        guidance: false,
        description:
          'Use the lightbox for content other than images and videos; it shows one media item at a time.',
      },
      {
        guidance: false,
        description:
          'Nest interactive content inside captions; keep them plain text.',
      },
    ],
  },
  // The lightbox opens via showModal() and renders nothing while closed —
  // overlay mode gives the Properties preview an open trigger instead of an
  // empty stage, mirroring MobileNav (#3616).
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      media: {
        src: '/template-assets/light-scene-horizontal-1.png',
        alt: 'Coastal shoreline with ocean waves',
        caption:
          'A scenic coastline with waves rolling onto a sandy beach beneath a clear sky.',
      },
    },
  },
}
```
