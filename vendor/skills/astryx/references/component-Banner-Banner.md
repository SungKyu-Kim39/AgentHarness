# Astryx component reference: Banner/Banner.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Banner/Banner.doc.mjs. Original SHA-256: e0444b2cca77fe31d4f2dac9eff2d33bf26abfb8aa1a9f0bb71bf9bf4362b40e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Banner',
  displayName: 'Banner',
  category: 'Feedback & Status',
  keywords: ["banner","alert","notification","callout","notice","status","message","info","warning","error","success","toast"],
  usage: {
    description:
      'Banner shows a persistent message at the top of a page or section. Use it for form errors, system updates, maintenance notices, or success confirmations that the user needs to see until they act on it.',
    bestPractices: [
      {guidance: true, description: 'Pick a status that matches the message: info for updates, warning for caution, error for problems, success for confirmations.'},
      {guidance: true, description: 'Use the card container inside page content and the section container for full-width messages that span the entire page.'},
      {guidance: true, description: 'Make info and success banners dismissable. Keep error banners visible until the user fixes the issue.'},
      {guidance: true, description: 'Keep titles short and scannable: "Payment failed" not "There was a problem processing your most recent payment."'},
      {guidance: false, description: 'Use Banner for short-lived messages that disappear on their own; use Toast instead.'},
      {guidance: false, description: 'Stack multiple banners with the same status; combine related messages into one banner.'},
      {guidance: true, description: 'Set collapsible={false} when the user needs the content to act on the message, like the list of fields that failed validation. Keep the default toggle when the detail is long enough to bury the banner\'s own message.'},
      {guidance: true, description: 'Banner status controls color and icon only; it does not create a live region. Announce async outcomes from the transition handler with useAnnounce. Pass role="alert" only for an urgent message the person must act on now: Banner puts it on the title and description, so controls, endContent and supporting content are not read as part of the alert. Do not also announce that message with useAnnounce.'},
      {guidance: false, description: 'Rely on the status color or icon alone to carry meaning; say which status it is in the title text, because the icon is decorative to a screen reader.'},
    ],
    anatomy: [
      {name: 'Banner frame', required: true, description: 'Outer frame that groups the status surface and optional content surface. It carries whole-banner elevation and, for elevated card banners, the radius that shapes that silhouette.'},
      {name: 'Status surface', required: true, description: 'The primary painted surface. It communicates status and contains the icon, title, description, actions, and controls.'},
      {name: 'Icon', required: true, description: 'Automatically set based on the status (info, warning, error, success).'},
      {name: 'Title', required: true, description: 'The main message. Always required.'},
      {name: 'Description', required: false, description: 'Additional detail below the title.'},
      {name: 'Action button', required: false, description: 'A button for the user to act on the message, like "Review" or "Retry".'},
      {name: 'Dismiss button', required: false, description: 'Lets the user close the banner. Enabled by setting isDismissable.'},
      {name: 'Content surface', required: false, description: 'Secondary surface for extra detail below the status surface, like a list of errors. Sits behind an expand/collapse toggle by default; set collapsible={false} to keep it visible.'},
    ],
  },

  examples: [
    {
      label: 'Announce an async outcome from its transition handler',
      code: `import {useState} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {useAnnounce} from '@astryxdesign/core/hooks';

function SaveSettings() {
  const announce = useAnnounce();
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  async function handleSave() {
    try {
      await saveSettings();
      setResult('success');
      announce('Settings saved');
    } catch {
      setResult('error');
      announce('Settings could not be saved');
    }
  }

  return (
    <>
      <Button label="Save settings" onClick={handleSave} />
      {result != null ? (
        <Banner
          status={result}
          title={result === 'success' ? 'Settings saved' : 'Save failed'}
        />
      ) : null}
    </>
  );
}`,
    },
  ],

  props: [
    {
      name: 'status',
      type: "'info' | 'warning' | 'error' | 'success'",
      description: 'Status type controlling icon and color.',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Title text or ReactNode displayed in the header.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Description text rendered below the title in the header.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Override the default status icon.',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDismissable',
      type: 'boolean',
      description: 'Whether the banner can be dismissed by the user.',
      default: 'false',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        'Called when the dismiss button is clicked; banner hides itself regardless of whether this is provided.',
    },
    {
      name: 'dismissLabel',
      type: 'string',
      description:
        'Accessible name and visible tooltip for the dismiss button (pass it already translated). Defaults to "Dismiss <title>" for a string title, so stacked banners are distinguishable; set it when the title is a ReactNode.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Action content rendered in the header area, end-aligned. Wraps to its own row below the text when the header is too narrow to hold both.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description:
        'Container type: card has border-radius; section is full-width with no border-radius for page-level use.',
      default: "'card'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        'Resting shadow depth. Use for a floating banner that hovers above content; `none` is the default inline banner. A `card`-container banner rounds its shadow to match.',
      default: "'none'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Content rendered in the card-background area below the colored header. Sits behind an expand/collapse toggle unless `collapsible={false}`.',
    },
    {
      name: 'collapsible',
      type: 'boolean | {defaultIsOpen?: boolean; isOpen?: boolean; onOpenChange?: (isOpen: boolean) => void}',
      description:
        'Whether the content area (children) sits behind an expand/collapse toggle in the header. On by default, starting collapsed. `false` opts out: children are always visible with no toggle. `{defaultIsOpen: true}` starts open; `{isOpen, onOpenChange}` is controlled. Takes the same CollapsibleConfig as Collapsible.',
      default: 'true',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],

  playground: {
    defaults: {
      title: 'System maintenance scheduled',
      description: 'The platform will be briefly unavailable on Sunday from 2–4 AM PST.',
      status: 'info',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-banner-frame', visualProps: ['container', 'elevation']},
      {className: 'astryx-banner', visualProps: ['container', 'status']},
      {className: 'astryx-banner-icon', visualProps: ['status']},
      {className: 'astryx-banner-description'},
      {className: 'astryx-banner-content', visualProps: ['container', 'status']},
    ],
    vars: [
      {name: '--_banner-radius', description: 'Border radius of the card container (header, content area and the elevated root silhouette)', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_banner-radius']},
    ],
  },
}
```
