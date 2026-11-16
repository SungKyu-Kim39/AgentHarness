# Astryx component reference: TopNav/TopNavMegaMenuFeaturedCard.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNavMegaMenuFeaturedCard.doc.mjs. Original SHA-256: d9e601b68e4902f2b11dadd45efb6358d34bdd2f909cd8bff2815a04cb44cbea.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNavMegaMenuFeaturedCard',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: 'Standard featured card for the TopNavMegaMenu featured slot. Provides a consistent card with optional image, title, description, and CTA link.',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Card title.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text below the title.',
    },
    {
      name: 'image',
      type: 'string',
      description: 'Optional image URL displayed above the body.',
    },
    {
      name: 'imageAlt',
      type: 'string',
      description: 'Alt text for the image. When omitted, the image is explicitly decorative (alt="", role="presentation", aria-hidden), usually correct since the card already has a visible title. Provide it only when the image conveys information beyond the title and description.',
    },
    {
      name: 'linkLabel',
      type: 'string',
      description: 'CTA link text.',
    },
    {
      name: 'linkHref',
      type: 'string',
      description: 'CTA link URL.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom content rendered below the standard body.',
    },
  ],
}
```
