# Astryx component reference: Link/Link.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Link/Link.doc.mjs. Original SHA-256: 8a21210604c6af134a7f97e2e062b67e8210b49fb2e03fa40abc31e98f7f9079.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Link',
  displayName: 'Link',
  category: 'Action',
  keywords: ["link","anchor","href","hyperlink","navigation","url","external","textlink"],
  playground: {
    defaults: {
      href: '#',
      children: 'Learn more',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-link', visualProps: ['color']},
    ],
  },
  components: [
    {
      name: 'Link',
      displayName: 'Link',
      description:
        'Styled anchor link with variants, external link support, and polymorphic rendering.',
      props: [
        {
          name: 'as',
          type: 'LinkComponentType',
          description: 'Custom component to render instead of <a>',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label (aria-label). Only use when children are not self-descriptive (e.g. icon-only links). Omit for text links; the link text is the accessible name.',
        },
        {
          name: 'href',
          type: 'string',
          description:
            'Link destination URL. Astryx-owned links and clickable surfaces block javascript:, vbscript:, and data:text/html after control-character removal, outer-whitespace trimming, and case-insensitive scheme inspection. The same rule covers native anchors, custom routers, Markdown links, and every activation method. Relative paths, fragments, protocol-relative URLs, HTTP(S), mailto, tel, safe custom schemes, and accepted downloads keep their existing behavior. A rejected destination renders inertly without invoking a custom router. There is no bypass prop; exceptional behavior requires caller-owned custom rendering outside this guarantee. Images and other resource URLs have separate policies.',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: 'Always show underline',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the link. It cannot navigate or run `onClick`, keeps its Tab stop, and is announced as disabled.',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description:
            'Opens in new tab with external icon and safe rel tokens',
          default: 'false',
        },
        {
          name: 'newTabLabel',
          type: 'string',
          description:
            'Screen-reader text announcing that an external link opens in a new tab. Override for localization.',
          default: "'(opens in new tab)'",
        },
        {
          name: 'target',
          type: 'string',
          description:
            'Where to open linked document. target="_blank" automatically adds noopener noreferrer.',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            'Link relationship tokens. noopener noreferrer are merged automatically for target="_blank".',
        },
        {
          name: 'download',
          type: 'string | boolean',
          description:
            'Causes the browser to download the linked URL. A string specifies the suggested filename.',
        },
        {
          name: 'referrerPolicy',
          type: 'HTMLAttributeReferrerPolicy',
          description: 'Referrer policy for the link.',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: 'Click event handler',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: 'Tooltip text displayed on hover',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: 'Applies base font sizing',
          default: 'false',
        },
        {
          name: 'type',
          type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3' | 'inherit'",
          description: 'Text type forwarded to Text, or a custom text type the theme defines. Use `inherit` for a link inside a Text, so the link takes the size and line height of the text around it.',
          default: "'body'",
        },
        {
          name: 'size',
          type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
          description: 'Explicit font size override forwarded to Text.',
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          description: 'Font weight override forwarded to Text.',
        },
        {
          name: 'color',
          type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
          description: 'Text color forwarded to Text.',
          default: "'accent'",
        },
        {
          name: 'display',
          type: "'inline' | 'block'",
          description: 'Display type for Text.',
          default: "'inline'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description: 'Maximum lines before truncation.',
          default: '0',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Link content',
          required: true,
        },
        {
          name: 'ref',
          type: 'Ref<HTMLAnchorElement | HTMLButtonElement>',
          description: 'Ref to the root element: the anchor, or the button when the link renders as a button.',
        },
      ],    },
    {
      name: 'LinkProvider',
      isHiddenFromOverview: true,
      displayName: 'Link Provider',
      description:
        'Provider that sets the default link component for all Astryx link-rendering components in the subtree. ' +
        'Wrap your app root to replace native <a> elements with your framework router (Next.js Link, React Router Link, etc.).',
      props: [
        {
          name: 'component',
          type: 'LinkComponentType',
          description:
            'Component to use for all link elements. It receives accepted `href` and `to` values under the shared navigation rule described on the Link `href` prop. Supported structured destinations, including their `protocol`, are checked without changing object identity. If either supplied destination is rejected, Astryx renders inert content without invoking this component; it does not pass undefined or fall back to the other destination.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Subtree',
          required: true,
        },
      ],
    },
  ],
  usage: {
    accessibility: [
      {
        name: 'Link text',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          'Link text must have at least 4.5:1 contrast with the background behind it. For Pointer down, measure against the pressed overlay the link paints behind its text.',
      },
    ],
    description:
      'A styled anchor for inline and standalone text navigation. Supports external links, underline variants, tooltips, and custom link components for router integration. Use it for navigating between pages or to external URLs.',
    bestPractices: [
      { guidance: true, description: 'Write descriptive, concise link text that clearly communicates the destination.' },
      { guidance: true, description: 'Set `isStandalone` when the link appears outside of inline text, so it receives proper base font sizing.' },
      { guidance: true, description: 'Put a Link inside a <Text maxLines> to truncate it with the surrounding text; inside a clamped Text the link flows in the text\'s lines.' },
      { guidance: true, description: 'Only set `label` when the link content is not descriptive text (e.g. an icon-only link). For text links, the visible text is already the accessible name; adding `label` overrides it for screen readers, which is harmful.' },
      { guidance: false, description: 'Use Link for actions that do not navigate; use a Button instead.' },
      { guidance: false, description: 'Use generic text like "click here" or "read more"; describe the destination.' },
      { guidance: false, description: 'Set `label` on text links; `aria-label` prevents assistive technology from reading the actual link content.' },
      { guidance: false, description: 'Give a Link inside a clamped Text its own `display` or `maxLines`, or render it as a button (`onClick` with no `href`), and expect the outer clamp to cut it; that Link keeps its own box.' },
      { guidance: false, description: 'Put a Link with block-level content, such as an HStack with an icon, inside a clamped Text; block content breaks the clamp. Clamp a text-only Link, or place the composed Link outside the clamp.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The visible text of the link.'},
      {name: 'External icon', required: false, description: 'Extra-small icon after the label when `isExternalLink` is set. It takes the link color. Screen readers hear the new-tab text instead of the icon.'},
    ],
  },
}
```
