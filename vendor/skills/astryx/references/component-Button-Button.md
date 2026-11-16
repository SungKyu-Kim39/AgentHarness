# Astryx component reference: Button/Button.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Button/Button.doc.mjs. Original SHA-256: c8ca4b7fe8747a08e0d008fb60d5c0d296ab502ec8d3800f07e4d92a64bc712c.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Button',
  displayName: 'Button',
  group: 'Button',
  category: 'Action',

  keywords: ["button","btn","cta","submit","action","loading","primary","secondary","ghost","destructive","danger"],

  usage: {
    description:
      'Button triggers an action when clicked. Use it for form submissions, confirmations, navigation, or any interaction that needs a clear call to action.',
    bestPractices: [
      {guidance: true, description: 'Reserve primary for the single most important action in the view. Use secondary or ghost for everything else based on emphasis.'},
      {guidance: true, description: 'Write labels that describe the action ("Save changes", "Delete account", "Send invite"), not vague labels like "OK" or "Click here".'},
      {guidance: true, description: 'Show a loading state for actions that take time, like saving or submitting, so the user knows it is working.'},
      {guidance: true, description: 'Always provide a label for icon-only buttons so screen readers can announce what the button does. Add a tooltip for sighted users.'},
      {guidance: true, description: 'For a dedicated icon-only button, use IconButton from \'@astryxdesign/core/IconButton\'. It is a separate component, not exported from \'@astryxdesign/core/Button\'.'},
      {guidance: false, description: 'Place more than one primary button in the same view; this dilutes the visual hierarchy.'},
      {guidance: false, description: 'Use the destructive variant without a confirmation step for irreversible actions like deleting data.'},
      {guidance: false, description: 'Use a button for navigation. If it only takes the user to another page, use a link instead. Buttons are for actions like saving, deleting, or submitting.'},
      {guidance: false, description: "Restyle Button's `::before` (through `xstyle` or a `className` rule) and expect it to hold through a touch press: under a coarse primary pointer, while a press is on or fading, Button paints the press on that pseudo-element (`z-index: -1`, its opacity animated), so your styles merge into the press layer for that moment. At rest Button adds nothing there. Style a child element instead."},
    ],
    accessibility: [
      {
        name: 'Text label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          'Button text must have at least 4.5:1 contrast with the button background in every state. For Hover and Pointer down, measure the final background after the overlay is applied.',
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
        name: 'Badge text',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          'Badge text inside a button must have at least 4.5:1 contrast with the Badge background. Check all 14 built-in Badge colors in Rest, Hover, and Pointer down on page and surface backgrounds. This covers 336 pairs per mode. Check custom end content separately.',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if needed',
        states: ['Rest'],
        description:
          'The button edge needs 3:1 contrast only when users need it to see the control. A text-only button can rely on its label.',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Focus visible'],
        description:
          'The focus outline needs at least 3:1 contrast with the area around the button. Check every style. Destructive buttons use a red outline.',
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
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that reinforces the label, like a trash icon on a Delete button.'},
      {name: 'Label', required: true, description: 'The visible text describing the action. Also used as the accessible name.'},
      {name: 'End content', required: false, description: 'A trailing badge or icon after the label, like a notification count or dropdown arrow.'},
      {name: 'Spinner', required: false, description: 'Replaces the icon during loading to show the action is in progress.'},
    ],
  },

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label. Rendered as visible text by default; used as aria-label when isIconOnly is true.',
      required: true,
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: 'Visual style variant.',
      default: "'secondary'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant.',
      default: "'md'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        'Resting shadow depth for floating buttons (e.g. a FAB). `none` is the default flat button; `low`/`med`/`high` map to the shadow token scale. Ignored inside a ButtonGroup, where elevation is owned by the group.',
      default: "'none'",
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      description: 'HTML button type attribute.',
      default: "'button'",
    },
    {
      name: 'name',
      type: 'string',
      description: 'HTML name attribute for form submission.',
    },
    {
      name: 'value',
      type: 'string | number | readonly string[]',
      description: 'HTML value attribute for form submission.',
    },
    {
      name: 'form',
      type: 'string',
      description: 'Associates the button with a form element by ID.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows a loading spinner and blocks re-activation while staying focusable (aria-busy + aria-disabled, not native disabled, so keyboard focus is never dropped mid-action). Announces "Loading" via a live region.',
      default: 'false',
    },
    {
      name: 'isInterruptible',
      type: 'boolean',
      description: 'Keep the button clickable while a clickAction is pending: the spinner and aria-busy still show, but the button is not disabled and the action is not deduped, so a re-click lands and interrupts the in-flight action with a fresh one.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the button. Uses aria-disabled instead of native disabled so the button stays focusable.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon element rendered before the label text. An Astryx Icon with no explicit size defaults to sm for sm/md buttons and md for lg buttons.',
      slotElements: [{__element: 'Icon', props: {icon: 'check'}}],
    },
    {
      name: 'isIconOnly',
      type: 'boolean',
      description:
        'When true, renders as a square icon-only button with label as aria-label. Requires icon. Tip: for a dedicated icon-only button component, use IconButton from \'@astryxdesign/core/IconButton\' instead.',
      default: 'false',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        "Width of the button. Numbers are treated as pixels, strings are used as-is (e.g., '100%' for a full-width button). By default the button sizes to its content, never grows past its container, and truncates its label with an ellipsis when a row is too narrow; icon-only buttons stay square.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Optional override for visible text. When provided, displayed instead of label, but label is still required (it provides the accessible name). For most cases, just use label alone: <Button label="Save" />.',
    },
    {
      name: 'endContent',
      type: 'ReactElement<IconProps> | ReactElement<BadgeProps>',
      description:
        'Trailing icon or badge rendered after the label. Ignored when isIconOnly is true. Color is inherited from the button variant.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'tooltip',
      type: 'string',
      description: 'Tooltip text shown on hover.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        'Standard click handler (passed through from ButtonHTMLAttributes).',
    },
    {
      name: 'clickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description:
        'Async click handler. Shows loading state while the returned promise is pending.',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'When provided, renders the button as a link element (<a> or custom link component). The destination follows the shared navigation rule described on the Link `href` prop.',
    },
    {
      name: 'as',
      type: 'ComponentType',
      description:
        'Custom link component to use when href is provided (e.g. Next.js Link).',
    },
    {
      name: 'target',
      type: 'string',
      description: 'HTML target attribute when rendered as a link (e.g. "_blank").',
    },
    {
      name: 'rel',
      type: 'string',
      description: 'HTML rel attribute when rendered as a link (e.g. "noopener noreferrer").',
    },
  ],
  examples: [
    {
      label: 'Actions in narrow rows',
      code: `
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {StackItem} from '@astryxdesign/core/Stack';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';

// On a phone (or any card narrower than its actions), a labelled Button
// shrinks with its row and truncates its label with an ellipsis instead of
// overflowing or being clipped by the card. The full label stays the
// accessible name. Icon-only buttons keep their square size.
function ReviewersCard() {
  const [emails, setEmails] = useState('');
  return (
    <Card maxWidth={560}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3} maxLines={1}>
              Design review
            </Heading>
          </StackItem>
          <Button label="Request review from the design team" size="sm" />
          <IconButton
            label="More review options"
            icon={<Icon icon="moreHorizontal" />}
            variant="ghost"
            size="sm"
          />
        </HStack>
        <TextInput
          label="Reviewer emails"
          placeholder="name@example.com"
          value={emails}
          onChange={setEmails}
        />
        {/* In a 320px form footer the long primary action truncates.
            StackItem size="static" keeps the short Cancel label whole. */}
        <HStack gap={2} hAlign="end">
          <StackItem size="static">
            <Button label="Cancel" variant="secondary" />
          </StackItem>
          <Button label="Send invitations to all 12 reviewers" variant="primary" />
        </HStack>
      </VStack>
    </Card>
  );
}
`,
    },
  ],
  playground: {
    defaults: {
      label: 'Click me',
      variant: 'primary',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-button', visualProps: ['size', 'variant', 'elevation']},
    ],
    vars: [
      {name: '--_button-radius', description: 'Border radius', default: 'var(--radius-element)', private: true},
      {name: '--button-focus-offset', description: 'Focus ring outline offset', default: 'var(--focus-outline-offset)'},
      {name: '--button-icon-only-aspect', description: 'Aspect ratio for icon-only buttons', default: '1 / 1'},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_button-radius']},
    ],
  },
}
```
