# Astryx component reference: DropdownMenu/DropdownMenuGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DropdownMenu/DropdownMenuGroup.doc.mjs. Original SHA-256: 21ff48e89fc8d5238b7019c246d2bab4be3ddeb4b2c74fded042e506d7ed2f69.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DropdownMenuGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Group',
  isHiddenFromOverview: true,
  playground: {
    // A standalone group has no required props, so the properties-tab preview
    // would render an empty box. Seed a title so the heading shows.
    defaults: {title: 'Version history'},
  },
  description:
    'A group of rows in a compound menu. A visible title names role="group" through aria-labelledby; an omitted title leaves the group unnamed. The heading is not a menuitem, so arrow keys and typeahead skip it. Keep title content non-interactive and place controls in DropdownMenu header or footer. The data-driven equivalent is the `{type: "section", title, items}` entry in `items`; both forms share the heading treatment and theme target. Host attributes and DOM handlers (id, data-*, aria-*) reach the group element; its role, and its name while it has a title, stay component-owned.',
  usage: {
    description:
      'Use DropdownMenuGroup to give related compound-menu rows one visible and programmatic name. Use an untitled group only when a separate name would not help people understand the rows.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use short, descriptive title content that explains what the grouped rows have in common.',
      },
      {
        guidance: true,
        description:
          'Keep the title non-interactive so every available action remains in the menu arrow-key order.',
      },
      {
        guidance: false,
        description:
          'Place buttons, links, fields, or other controls in title. Put them in DropdownMenu header or footer instead.',
      },
      {
        guidance: false,
        description:
          'Wrap rows that do not form a meaningful set; a group adds structure only when its relationship helps users.',
      },
    ],
    anatomy: [
      {
        name: 'Group',
        required: true,
        description:
          'The role="group" wrapper containing the heading and menu rows.',
      },
      {
        name: 'Heading',
        required: false,
        description:
          'Visible non-interactive title content that names the group and carries the dropdown-menu-section-heading theme target.',
      },
      {
        name: 'Rows',
        required: false,
        description:
          'Menu items, selectable items, radio groups, or submenus owned by DropdownMenu.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        "Non-interactive heading content shown above the rows and used as the group's accessible name. Omit for an unnamed group; place controls in DropdownMenu header or footer.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The grouped rows: DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, or DropdownMenuSubMenu.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles applied to the role="group" wrapper. Must be a stylex.create() value, not an inline style object.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name applied to the role="group" wrapper.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline styles applied to the role="group" wrapper.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the role="group" wrapper.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-dropdown-menu-section-heading'}],
  },
}
```
