# Astryx component reference: Thumbnail/Thumbnail.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Thumbnail/Thumbnail.doc.mjs. Original SHA-256: e9d5affc9b7876e8236f5f5c48d38a4b65e7a77a3efe5cc4fc27e6446454739f.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Thumbnail',
  displayName: 'Thumbnail',
  category: 'Content',
  keywords: ["thumbnail","attachment","preview","image","upload","dismiss","remove","loading"],
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL.',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for the image. When omitted, the image is explicitly decorative (alt="", role="presentation", aria-hidden) and hidden from screen readers; a dev warning fires if neither alt nor label is set.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label (e.g. file name). Shown as tooltip on hover.',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description: 'Callback for the overlaid remove button.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description: 'Click handler. Adds button semantics and a hover overlay.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows skeleton (no src) or upload overlay (with src).',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the thumbnail is disabled.',
      default: 'false',
    },
    {
      name: 'showRemoveOn',
      type: "'always' | 'hover'",
      description:
        'When the remove button is visible. `hover` (the default) reveals it on hover and on keyboard focus, and keeps it visible under a coarse primary pointer (a phone or tablet); `always` shows it at rest. Only applies when `onRemove` is set.',
      default: "'hover'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name for the root element. Prefer xstyle for styling; className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline styles for the root element. Prefer xstyle for styling; inline styles bypass StyleX optimization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-thumbnail'},
    ],
    vars: [
      {name: '--_thumbnail-hit-inset', description: 'Outset of the remove button\'s invisible hit area, applied to a ::after overlay. 0 on a fine pointer; negative on a coarse one, which grows the 20px button to the 24px touch target without changing what is drawn.', default: '0px', private: true},
      {name: '--_press-overlay', description: 'Colour of the ::after interaction overlay for the hover and mouse states: transparent at rest, the hover overlay token on hover (hover-capable pointers), the pressed overlay token while a mouse holds `:active`. A press the touch press controller paints (`data-astryx-press`) is the overlay\'s image instead, at the press\'s strength, and the colour yields to it. Set on the card element by its own interaction arms.', default: 'transparent', private: true},
    ],
  },
  usage: {
    description:
      'Thumbnail displays a compact, square preview of an image attachment. It shows a shimmer effect while uploading, the image on success, and a placeholder icon when no source is set. Use it in chat composers, file upload lists, or anywhere you need a small image preview with optional remove and click actions.',
    bestPractices: [
      {guidance: true, description: 'Always provide a label prop with the file name so the thumbnail and its remove button are accessible to screen readers and show a tooltip on hover.'},
      {guidance: true, description: 'Use isLoading without a src to show a skeleton during initial upload, and isLoading with a src to show a spinner overlay once a preview URL is available.'},
      {guidance: true, description: 'Pair onClick with a lightbox or detail view so users can inspect the full image; the thumbnail adds button semantics and a hover overlay automatically.'},
      {guidance: false, description: "Don't use Thumbnail for non-image file types like PDFs or spreadsheets; use a file attachment component with an appropriate icon instead."},
      {guidance: false, description: "Don't omit alt text when a src is provided; screen readers need a description of the image content, not just the file name from label."},
    ],
    anatomy: [
      {name: 'Image', required: false, description: 'The preview image, displayed as a square with cover fit.'},
      {name: 'Placeholder', required: false, description: 'An image silhouette icon shown when no src is provided.'},
      {name: 'Remove button', required: false, description: 'An overlaid close button in the top-right corner. Appears when onRemove is set. Sits on a fixed --color-overlay scrim with an --color-on-dark icon to stay visible on any image.'},
      {name: 'Upload overlay', required: false, description: 'A semi-transparent overlay with a spinner, shown when isLoading is true and a src preview is available.'},
      {name: 'Skeleton', required: false, description: 'A shimmer animation shown when isLoading is true and no src is set.'},
    ],
  },
}
```
