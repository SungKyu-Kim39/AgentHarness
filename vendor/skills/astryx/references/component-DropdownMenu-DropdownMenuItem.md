# Astryx component reference: DropdownMenu/DropdownMenuItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DropdownMenu/DropdownMenuItem.doc.mjs. Original SHA-256: 7fc8d46ce07d81947fcee64426698ad6e269808a56b9118d24e0d72fa09b2c21.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DropdownMenuItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Item',
  isHiddenFromOverview: true,
  description:
    'One action or destination row in the pointer presentation of DropdownMenu. The parent menu owns keyboard navigation; the row owns activation, disabled state, destination behavior, content layout, and its theme target. Supported host attributes, DOM handlers, className, style, xstyle, and ref reach or compose on the role="menuitem" root.',
  usage: {
    description:
      'Use DropdownMenuItem inside DropdownMenu compound mode for one action or destination. Keep label, description, icon, and endContent non-interactive; controls belong in separate rows or the menu header/footer.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use href for a destination so LinkProvider, modified clicks, middle clicks, and browser link affordances remain available.',
      },
      {
        guidance: true,
        description:
          'Use hasCloseOnSelect=false only when activation reports a result in place on the same row.',
      },
      {
        guidance: false,
        description:
          'Put buttons, links, or other focusable controls inside label, description, or endContent. Each menu row is one interactive target.',
      },
    ],
    anatomy: [
      {
        name: 'Row',
        required: true,
        description:
          'The role="menuitem" root that owns activation, disabled state, destination behavior, and theme state.',
      },
      {
        name: 'Content',
        required: true,
        description:
          'The non-interactive label plus optional icon, description, and end content.',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-dropdown-menu-item',
        visualProps: ['size', 'variant'],
      },
    ],
  },
  playground: {
    // Standalone DropdownMenuItem has no required props, so the properties-tab
    // preview renders an empty row without seeded content. Seed a label and
    // description so the preview is meaningful.
    defaults: {label: 'Edit', description: 'Modify this item'},
  },
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Icon to display before the label. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description:
        "Callback when the item is selected. A keyboard activation arrives as a synthesized click carrying the key's modifiers. On a row with `href` it runs before the browser navigates and is skipped for a modified click (⌘, Ctrl, Shift, Alt, middle button), which is left to the browser.",
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Address the row navigates to. The row then renders as a real anchor with role="menuitem" (through LinkProvider), so a modified click or a middle click keeps the browser\'s meaning — a new tab — instead of running onClick.',
    },
    {
      name: 'target',
      type: "'_blank' | '_self'",
      description: 'Link target. Only used with href.',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        'Link relationship. noopener noreferrer is added for target="_blank". Only used with href.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Whether the row is unavailable. Disabled rows expose aria-disabled, remove link destinations, and suppress activation.',
      default: 'false',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Non-interactive content rendered after the label and description.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      description:
        'Whether activating the item closes the menu. Set false for an action that reports its result on the item itself.',
      default: 'true',
    },
    {
      name: 'variant',
      type: "'default' | 'destructive'",
      description:
        "Visual variant. 'destructive' renders the label, description, and icon in the error color for dangerous actions (e.g. Delete).",
      default: "'default'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        'Ref forwarded to the row root, the element carrying role="menuitem". Register the row with an element-keyed observer or overlay.',
    },
  ],
}
```
