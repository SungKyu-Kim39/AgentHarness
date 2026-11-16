# Astryx component reference: TabList/Tab.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TabList/Tab.doc.mjs. Original SHA-256: f256cb042cdc0dfd9f9049b9b83d39b59774c2291d1a62755f659aa36657f6a0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Tab',
  subComponentOf: 'TabList',
  displayName: 'Tab',
  isHiddenFromOverview: true,
  description:
    'Individual tab item that renders as a button or an anchor link, with selected-state styling and optional icons.',
  // Tab requires TabList context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'tab-1', label: 'Tab'},
    wrapper: {component: 'TabList', props: {value: 'tab-1'}},
  },
  examples: [
    {
      label: 'Underline the whole tab in one strip',
      code: `import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {appTheme} from './theme';

// Without a nested Theme, the selected indicator spans the tab's content and
// stops at its inline padding. An editor-style strip can run it edge to edge by restyling
// the tab-indicator target in a nested Theme. Only this strip changes: every
// other TabList keeps the app theme's indicator. insetInline is not a
// guaranteed property of the tab-indicator target, so treat this override as
// best effort across releases.
const fullWidthIndicatorTheme = defineTheme({
  name: 'full-width-tab-indicator',
  extends: appTheme,
  components: {
    'tab-indicator': {
      base: {insetInline: '0'},
    },
  },
});

// An open-files bar switches views, so it uses TabList's navigation pattern
// (no role="tablist"). The nested Theme takes the app's color mode.
function EditorTabs() {
  const {mode} = useTheme();
  return (
    <Theme theme={fullWidthIndicatorTheme} mode={mode}>
      <TabList value="app" onChange={() => {}} aria-label="Open files" size="sm" hasDivider>
        <Tab value="app" label="App.tsx" />
        <Tab value="styles" label="styles.css" />
      </TabList>
    </Theme>
  );
}`,
    },
    {
      label: 'Describe a tab with help text',
      code: `import {useRef, useState} from 'react';
import {Icon} from '@astryxdesign/core/Icon';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// The tab is one button, so its help text is a Tooltip anchored on the Tab
// through its ref, not a second button inside it. The tooltip describes the
// tab itself. Render it after the TabList: the strip holds only tabs. The
// info glyph in endContent is decorative.
function SettingsTabs() {
  const [value, setValue] = useState('general');
  const generalRef = useRef(null);
  return (
    <>
      <TabList value={value} onChange={setValue} role="tablist" aria-label="Settings">
        <Tab
          ref={generalRef}
          value="general"
          label="General"
          panelId="panel-general"
          endContent={<Icon icon="info" size="sm" />}
        />
        <Tab value="advanced" label="Advanced" panelId="panel-advanced" />
      </TabList>
      <Tooltip
        content="Name, language, and time zone for this workspace."
        anchorRef={generalRef}
      />
      <div id="panel-general" role="tabpanel" hidden={value !== 'general'}>
        …
      </div>
      <div id="panel-advanced" role="tabpanel" hidden={value !== 'advanced'}>
        …
      </div>
    </>
  );
}`,
    },
  ],
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        'Unique value for this tab, matched against TabListContext.value.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for this tab. Used as visible text by default, or as aria-label when isLabelHidden is true.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Whether the label is visually hidden. When true, only the icon and endContent are displayed, and label is used as aria-label for accessibility.',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'URL to navigate to; when provided, the tab renders as an anchor element. Ignored in a TabList given an explicit role="tablist".',
    },
    {
      name: 'panelId',
      type: 'string',
      description:
        'Id of the panel this tab controls, wired up as aria-controls where the TabList speaks the tabs pattern. Put the same id on the panel element. No effect under the navigation pattern, and a development warning says so.',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description:
        'Custom component to render instead of <a> for link tabs. Overrides the LinkProvider default. Only applies when href is provided.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon element shown when the tab is not selected.',
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
      name: 'selectedIcon',
      type: 'ReactNode',
      description:
        'Icon element shown when the tab is selected; falls back to icon if not provided.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'checkCircle',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered after the label, such as a badge count or status dot. The tab is one button, so endContent holds only non-interactive content: no button, link, InfoTip, or other focusable control. To explain a tab, anchor a Tooltip on the Tab through its ref, render it after the TabList, and put a decorative info Icon here.',
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
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
}
```
