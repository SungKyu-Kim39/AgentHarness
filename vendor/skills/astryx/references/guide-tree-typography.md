# Astryx guide: tree/typography.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/cli 0.7.16, assets/docs/tree/typography.doc.mjs. Source shown for reference only; no upstream CLI is installed. Online installation examples are omitted.

```javascript
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs typography`: the typography namespace. Groups guides for
 * font setup, the type scale, and best practices.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'typography',
  title: 'Typography',
  summary:
    'Font families, geometric type scale, weight, line-height, and semantic text tokens for consistent, accessible text styling.',
  keywords: [
    'typography',
    'font',
    'fonts',
    'type scale',
    'heading',
    'text',
    'weight',
    'line-height',
    'display',
  ],
  slots: {
    guides: {title: 'Guides', accepts: {kinds: ['generic']}},
  },
};

```
