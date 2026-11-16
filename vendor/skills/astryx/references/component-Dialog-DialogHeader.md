# Astryx component reference: Dialog/DialogHeader.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Dialog/DialogHeader.doc.mjs. Original SHA-256: 548bf15ef7e22b9e7e3b0ae17518a3fa82e52c5ca3a272894f9ac61808dc50ea.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DialogHeader',
  subComponentOf: 'Dialog',
  displayName: 'Dialog Header',
  isHiddenFromOverview: true,
  description: 'Header for dialogs with a title, optional subtitle, close button, and start/end content slots.',
  usage: {
    description: 'Use DialogHeader to give a dialog a labelled title area and optional close control.',
    anatomy: [
      {name: 'Header row', required: true, description: 'Arranges the title block, optional start/end content, and close control.'},
      {name: 'Start content', required: false, description: 'Wraps optional leading content.'},
      {name: 'Title block', required: true, description: 'Groups the title and optional subtitle.'},
      {name: 'End content', required: false, description: 'Groups optional trailing content with the optional close control.'},
      {name: 'Close icon', required: false, description: 'Visual close glyph inside the close button.'},
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Dialog title, rendered inside the focusable h2 (receives focus on open; its text content labels the dialog via aria-labelledby unless the Dialog has an explicit aria-label/aria-labelledby). Keep it inline, non-interactive, and non-empty.',
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description: 'Subtitle below the title. Accepts inline content such as a Link; avoid block elements.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: 'Close button callback (no button if omitted).',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content before the title (e.g., a back button).',
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
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content after the title, before close button.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'endContentEdgeCompensation',
      type: "'inline' | 'block' | 'all'",
      description: 'Selects compensation axes for the end-content slot. Omit to preserve automatic close-action compensation.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: 'Adds border at the bottom edge.',
      default: 'true',
    },
  ],
  playground: {
    defaults: {
      title: 'Delete file?',
      subtitle: 'This action cannot be undone.',
      hasDivider: true,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-dialog-header'},
      {className: 'astryx-dialog-header-start-content'},
      {className: 'astryx-dialog-header-title-block'},
      {className: 'astryx-dialog-header-end-content'},
      {className: 'astryx-dialog-header-close-icon'},
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';

<DialogHeader title="Delete file?" subtitle="This action cannot be undone." />;
`,
    },
    {
      label: 'With close button',
      code: `
import {useState} from 'react';
import {DialogHeader} from '@astryxdesign/core/Dialog';

function Header() {
  const [, setIsOpen] = useState(true);

  // Passing onOpenChange renders a close button that calls it with false.
  return <DialogHeader title="Settings" onOpenChange={setIsOpen} />;
}
`,
    },
    {
      label: 'With a link in the subtitle',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Link} from '@astryxdesign/core/Link';

<DialogHeader
  title="Share conversation"
  subtitle={
    <>
      Anyone with the link can view it. Review the{' '}
      <Link href="#sharing-policy">sharing policy</Link> first.
    </>
  }
/>;
`,
    },
    {
      label: 'With start and end content',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';

<DialogHeader
  title="Notifications"
  startContent={<Icon icon="chevronLeft" size="sm" />}
  endContent={<Badge label="3" />}
/>;
`,
    },
  ],
}
```
