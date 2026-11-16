# Astryx component reference: Drawer/DrawerHeader.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Drawer/DrawerHeader.doc.mjs. Original SHA-256: e3fe76e8c807a8f220930077e26222389d0eae72942a403fa2f1ab27a76cf6ef.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DrawerHeader',
  subComponentOf: 'Drawer',
  displayName: 'Drawer Header',
  // Keeps the registry route DrawerHeader had as a canary-only Lab component.
  registry: {aliases: ['lab/drawer-header']},
  isHiddenFromOverview: true,
  description:
    'Header for drawers with a title, optional subtitle, close button, and start/end content slots. Same API as DialogHeader.',
  usage: {
    description:
      'Compose DrawerHeader in the header slot of a Layout inside the Drawer, as DialogHeader is composed in Dialog, for a title row and, when you pass onOpenChange, a close button. The Layout keeps the header on the drawer inset instead of padding it twice. Drawer renders no close button of its own. Unlike DialogHeader it does not take focus on open (Drawer uses data-autofocus) and does not name the drawer (Drawer label does).',
    anatomy: [
      {
        name: 'Header row',
        required: true,
        description:
          'Arranges the title block, optional start/end content, and close control.',
      },
      {
        name: 'Start content',
        required: false,
        description: 'Wraps optional leading content.',
      },
      {
        name: 'Title block',
        required: true,
        description: 'Groups the title and optional subtitle.',
      },
      {
        name: 'End content',
        required: false,
        description:
          'Groups optional trailing content with the optional close control.',
      },
      {
        name: 'Close icon',
        required: false,
        description: 'Visual close glyph inside the close button.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Drawer title, rendered as an h2. Keep it inline and non-interactive. It does not name the drawer; pass Drawer a label.',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description:
        'Subtitle below the title. Accepts inline content such as a Link; avoid block elements.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description:
        "Close button callback, called with false (no button if omitted). Pass the Drawer's own onOpenChange.",
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content before the title (e.g., a back button).',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content after the title, before the close button.',
    },
    {
      name: 'endContentEdgeCompensation',
      type: "'inline' | 'block' | 'all'",
      description:
        'Selects compensation axes for the end-content slot. Omit to preserve automatic close-action compensation.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        "Adds a border at the bottom edge. Defaults to the parent Layout's defaultHasDividers.",
    },
  ],
  playground: {
    defaults: {
      title: 'Host details',
      subtitle: 'web-prod-04',
      hasDivider: true,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-drawer-header'},
      {className: 'astryx-drawer-header-start-content'},
      {className: 'astryx-drawer-header-title-block'},
      {className: 'astryx-drawer-header-end-content'},
      {className: 'astryx-drawer-header-close-icon'},
    ],
  },
  examples: [
    {
      label: 'With close button',
      code: `
import {useState} from 'react';
import {Drawer, DrawerHeader} from '@astryxdesign/core/Drawer';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';

function Inspector() {
  const [isOpen, setIsOpen] = useState(true);

  // Passing onOpenChange renders a close button that calls it with false.
  return (
    <Drawer isOpen={isOpen} onOpenChange={setIsOpen} label="Details">
      <Layout
        header={<DrawerHeader title="Details" onOpenChange={setIsOpen} />}
        content={<LayoutContent>Content</LayoutContent>}
      />
    </Drawer>
  );
}
`,
    },
    {
      label: 'With subtitle and end content',
      code: `
import {DrawerHeader} from '@astryxdesign/core/Drawer';
import {Badge} from '@astryxdesign/core/Badge';

<DrawerHeader
  title="web-prod-04"
  subtitle="us-east-1"
  endContent={<Badge label="Healthy" />}
/>;
`,
    },
  ],
}
```
