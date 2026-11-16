# Astryx component reference: ButtonGroup/ButtonGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/ButtonGroup/ButtonGroup.doc.mjs. Original SHA-256: 888a92282256ebd64bbb60852f1a4213376e368fc1e32bccff5c8fb26863b467.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ButtonGroup',
  displayName: 'Button Group',
  group: 'Button',
  category: 'Action',
  keywords: ["button-group","connected","split","toolbar","actions","grouped","buttons"],
  playground: {
    defaults: {
      label: 'Actions',
      children: [
        {__element: 'Button', props: {label: 'Copy', variant: 'secondary'}},
        {__element: 'Button', props: {label: 'Paste', variant: 'secondary'}},
        {__element: 'Button', props: {label: 'Delete', variant: 'secondary'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-button-group', visualProps: ['size', 'orientation', 'elevation']},
    ],
  },
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: 'Groups multiple buttons together with connected styling: shared borders, proper border-radius handling (only on outer edges), and horizontal or vertical orientation. Under the touch presentation a press tracks like a menu: press a button and slide across the others, and the highlight follows. The button you lift on runs, and lifting outside the group runs nothing. A mouse press acts as a native button\'s. With a finger, each button\'s target grows toward 44 px, up to half the gap to a neighbour, without the buttons growing. A menu trigger in the group keeps its own opening.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Button or IconButton children.', required: true, slotElements: [{__element: 'Button', props: {label: 'Action'}}]},
        {name: 'label', type: 'string', description: 'Accessible label for the group (aria-label).', required: true},
        {name: 'orientation', type: "'horizontal' | 'vertical'", description: 'Layout direction of the button group.', default: "'horizontal'"},
        {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Default size for buttons in the group. Individual buttons can override.', default: "'md'"},
        {name: 'isDisabled', type: 'boolean', description: 'Whether all buttons in the group are disabled.', default: 'false'},
        {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: 'Resting shadow depth for the whole group. The connected buttons share one surface, so the shadow lifts them as a unit. Use for a group that floats above content.', default: "'none'"},
        {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: 'Ref forwarded to the root element.'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
    },
  ],
  usage: {
    description:
      'ButtonGroup joins related actions into a single connected control. Use it when multiple buttons represent related choices or operations that belong together visually, like copy/cut/paste, or undo/redo.',
    accessibility: [
      {
        name: 'Text label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          'Text in each button must have at least 4.5:1 contrast with its background in every state. For Hover and Pointer down, measure the final background after the overlay is applied.',
      },
      {
        name: 'Essential icon or spinner arc',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Icon only', 'Loading'],
        description:
          'An icon used instead of text must have at least 3:1 contrast with the button background. The moving spinner arc must also meet 3:1. An icon beside a visible label does not need its own check.',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if needed',
        states: ['Rest'],
        description:
          'Some groups need a divider or edge to show each button. That divider or edge must have at least 3:1 contrast.',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Focus visible'],
        description:
          'The focus outline must have at least 3:1 contrast with the area around it.',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: 'Not required',
        states: ['Disabled'],
        description:
          'Disabled controls do not need to meet these contrast ratios.',
      },
    ],
    bestPractices: [
      {guidance: true, description: 'Group buttons that perform related actions on the same object, like copy, cut, paste on selected text.'},
      {guidance: true, description: 'Use the same variant for all buttons in a group so they look like a single connected unit.'},
      {guidance: true, description: 'Keep groups small (2–4 buttons). For more actions, use a Toolbar or DropdownMenu instead.'},
      {guidance: false, description: "Don't mix wildly different actions. A Save button next to a Delete button in the same group is confusing."},
      {guidance: false, description: "Don't use ButtonGroup for navigation. Use SegmentedControl or TabList for switching between views."},
      {guidance: false, description: "Don't nest ButtonGroups. If you need multiple groups, place them side by side with a gap."},
      {guidance: true, description: 'Name the group for what its buttons act on. The label is the group\'s accessible name and a screen reader reads it before each member.'},
      {guidance: true, description: 'Keep the group a single Tab stop. Arrow keys move between members along the orientation, and Home/End jump to the ends. This is the WAI-ARIA APG roving tabindex technique: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex'},
      {guidance: false, description: "Don't disable the group to show that an action is in flight. Leave the group enabled and show progress on the button that started the work."},
    ],
    anatomy: [
      {name: 'Button', required: true, description: 'One or more Button or IconButton children that form the connected group.'},
      {name: 'Divider', required: false, description: 'A thin border between buttons, rendered automatically by the group.'},
    ],
  },
}
```
