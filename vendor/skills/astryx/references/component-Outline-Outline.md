# Astryx component reference: Outline/Outline.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Outline/Outline.doc.mjs. Original SHA-256: 3601235c5d81069e066ef2ab34ee54c8e649ce5e3238447afa0fc120a113c1c9.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Outline',
  displayName: 'Outline',
  group: 'Outline',
  category: 'Navigation',
  keywords: [
    'outline',
    'table of contents',
    'toc',
    'heading navigation',
    'scroll spy',
    'documentation',
    'anchors',
    'sliding indicator',
  ],
  playground: {
    defaults: {
      items: [
        {id: 'overview', label: 'Overview', level: 2},
        {id: 'installation', label: 'Installation', level: 2},
        {id: 'configuration', label: 'Configuration', level: 3},
        {id: 'api-reference', label: 'API reference', level: 2},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-outline', visualProps: ['density']},
      {className: 'astryx-outline-indicator'},
      {
        className: 'astryx-outline-item',
        visualProps: ['level'],
        states: ['active'],
      },
    ],
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        'Document outline navigation with sliding indicator track. Renders a flat heading list as anchor links with a density variant and scroll-spy active state when uncontrolled.',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            'Ordered heading items. Each item has id, label, and level (1-6). The id should match the target heading element id.',
          required: true,
        },
        {
          name: 'activeId',
          type: 'string',
          description:
            'Currently active heading id. Providing this prop makes active state controlled and disables built-in scroll-spy.',
        },
        {
          name: 'onActiveIdChange',
          type: '(id: string) => void',
          description:
            'Called when the active item changes from built-in scroll-spy or from an outline link click.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the nav landmark.',
          default: "'Table of contents'",
        },
        {
          name: 'density',
          type: "'default' | 'compact'",
          description:
            "Density variant controlling item padding. 'compact' for dense UIs, 'default' for standard spacing.",
          default: "'default'",
        },
        {
          name: 'onNavigateStart',
          type: '(id: string) => void',
          description:
            'Called with the item id when navigation begins, before the scroll starts. Pair with onNavigateEnd to drive an arrival effect (flash, ring, pulse) on the target heading.',
        },
        {
          name: 'onNavigateEnd',
          type: '(id: string) => void',
          description:
            'Called with the item id once the navigation resolves - when the smooth scroll settles, or when reduced motion turns it into an instant jump. Fires exactly once per onNavigateStart, including when the user interrupts the scroll, so a "navigating" state can never leak.',
        },
        {
          name: 'offset',
          type: 'number',
          description:
            "Height in px of a fixed header overlaying the top of the scroll root. Shifts both the activation line and the scroll landing by the same amount, so a heading activates exactly where navigating to it puts it - below the header, not underneath it. Composes with each heading's own scroll-margin-top (the header, then the breathing room below it); it does not replace it. Leave at 0 when nothing overlays the content and let scroll-margin-top do the work.",
          default: '0',
        },
        {
          name: 'scrollContainerRef',
          type: 'React.RefObject<HTMLElement | null>',
          description:
            'Scroll container to track, instead of auto-detecting the nearest scrollable ancestor. Use it when content scrolls inside a split pane, modal, or dashboard panel rather than the viewport.',
        },
        {
          name: 'hasScrollOnClick',
          type: 'boolean',
          description:
            'Whether activating an item smooth-scrolls to it. Set to false to own the scrolling yourself (virtualized content, a router): the Outline still updates the active item, the hash, and the navigate callbacks, but performs no scroll.',
          default: 'true',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `
import {Outline} from '@astryxdesign/core/Outline';

const items = [
  {id: 'overview', label: 'Overview', level: 2},
  {id: 'installation', label: 'Installation', level: 2},
  {id: 'theming', label: 'Theming', level: 2},
  {id: 'tokens', label: 'Tokens', level: 3},
  {id: 'accessibility', label: 'Accessibility', level: 2},
];

// Uncontrolled: built-in scroll-spy tracks the topmost visible heading.
<Outline items={items} />;
`,
        },
        {
          label: 'Compact (density="compact")',
          code: `
import {Outline} from '@astryxdesign/core/Outline';

// Dense sidebars use the compact variant; the sliding indicator
// automatically matches the shorter item height.
<Outline items={items} density="compact" />;
`,
        },
        {
          label: 'Controlled active section',
          code: `
import {useState} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function ControlledOutline() {
  const [activeId, setActiveId] = useState('overview');

  // Providing activeId disables built-in scroll-spy; you own the active state.
  return (
    <Outline
      items={items}
      activeId={activeId}
      onActiveIdChange={setActiveId}
    />
  );
}
`,
        },
        {
          label: 'Generate items from markdown',
          code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';
import {Outline, useOutlineFromMarkdown} from '@astryxdesign/core/Outline';

const markdownRootId = 'guide';
const plugins = [
  createMarkdownHeadingLinks({headingIdPrefix: markdownRootId}),
];

function MarkdownOutline({markdown, isStreaming}) {
  // Pass the same plugin entry and finality to Markdown and Outline. Nested
  // headings consume the shared depth-first sequence, while Outline continues
  // to return root headings only.
  const items = useOutlineFromMarkdown(markdown, {
    plugins,
    isFinal: !isStreaming,
  });
  return (
    <>
      <Markdown id={markdownRootId} plugins={plugins}>{markdown}</Markdown>
      <Outline items={items} />
    </>
  );
}
`,
        },
        {
          label: 'Scoped scroll container (split pane, modal, panel)',
          code: `
import {useRef} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function PanelDocs() {
  const scrollContainerRef = useRef(null);

  // Without scrollContainerRef the outline auto-detects the nearest scrollable
  // ancestor, which is the viewport here - so the highlight would never move.
  return (
    <div style={{display: 'flex'}}>
      <div ref={scrollContainerRef} style={{overflowY: 'auto', height: 480}}>
        <h2 id="overview">Overview</h2>
        {/* ...content... */}
      </div>
      <Outline items={items} scrollContainerRef={scrollContainerRef} offset={64} />
    </div>
  );
}
`,
        },
        {
          label: 'Navigate callbacks (flash the heading on arrival)',
          code: `
import {useState} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function FlashOnArrival() {
  const [flashId, setFlashId] = useState(null);

  // onNavigateEnd fires once the smooth scroll settles - and once per
  // onNavigateStart even if the user scrolls away mid-jump, so this never
  // gets stuck.
  return (
    <Outline
      items={items}
      onNavigateStart={() => setFlashId(null)}
      onNavigateEnd={id => setFlashId(id)}
    />
  );
}
`,
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes. Features a sliding indicator track that animates to the active heading. Each link is in the normal Tab order, and Enter/Space activate.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a flat ordered list of headings and let level control indentation.',
      },
      {
        guidance: true,
        description:
          'Use activeId when custom scroll logic owns the active section.',
      },
      {
        guidance: true,
        description:
          'Use density="compact" in dense sidebars where vertical space is tight.',
      },
      {
        guidance: true,
        description:
          'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content. For linkable Markdown headings, pass the same createMarkdownHeadingLinks() entry to Markdown and Outline; configure headingIdPrefix on that plugin for multiple roots.',
      },
      {
        guidance: true,
        description:
          'Pass scrollContainerRef when the content scrolls in a split pane, modal, or panel instead of the viewport.',
      },
      {
        guidance: true,
        description:
          'Set offset to the height of a fixed header that overlays the content, so headings land below it instead of underneath it.',
      },
      {
        guidance: false,
        description:
          'Use Outline for application navigation - use SideNav or TopNav for routes.',
      },
      {
        guidance: false,
        description:
          'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.',
      },
      {
        guidance: false,
        description:
          'Rely on onNavigateEnd to mean "arrived" - it also fires when the user interrupts the scroll.',
      },
    ],
  },
}
```
