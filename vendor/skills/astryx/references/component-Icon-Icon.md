# Astryx component reference: Icon/Icon.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Icon/Icon.doc.mjs. Original SHA-256: 705a38ee0e340816510e86a66461075c918b9628a1e2df6b4773b8d2580324e1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Icon',
  displayName: 'Icon',
  category: 'Content',
  keywords: [
    'icon',
    'svg',
    'glyph',
    'symbol',
    'pictogram',
    'graphic',
    'vector',
    'arrow',
    'chevron',
    'caret',
    'checkmark',
    'cross',
    'gear',
    'cog',
    'broom',
    'sparkle',
    'sparkles',
    'star',
    'heart',
    'bell',
    'trash',
    'pencil',
    'magnifyingglass',
    'paperclip',
    'house',
    'flame',
    'rocket',
    'lightning',
    'bolt',
    'globe',
    'sun',
    'moon',
    'bookmark',
    'thumbsup',
    'smiley',
    'emoji',
    'lock',
    'eye',
    'cloud',
    'hourglass',
    'trophy',
    'gift',
    'camera',
  ],
  playground: {
    // `icon` is required and its type can't be auto-generated, so the
    // properties-tab preview showed "Missing: icon". Seed a valid semantic
    // icon name so the interactive preview renders.
    defaults: {
      icon: 'search',
    },
  },
  props: [
    {
      name: 'icon',
      type: 'IconName | NamespacedIconName | ComponentType<SVGProps>',
      description:
        'Semantic icon name or SVG component. Valid semantic names: close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. A namespaced key such as `richtext:bold` names a glyph that one component or library registers, and a theme can replace it by key; a namespaced key that nothing registers renders nothing. For any icon not in this list, pass an SVG component directly (e.g. import from lucide-react or @heroicons/react). Note: this prop is called `icon`, not `name`.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'inherit' | 'blue' | 'red' | 'green' | 'gray' | 'cyan' | 'teal' | 'yellow' | 'orange' | 'pink' | 'purple'",
      description:
        'Color variant mapped to Astryx icon color tokens. Semantic values (primary through warning) follow the role, and inherit uses the surrounding text color. On the web, Icon also accepts the palette values blue, red, green, gray, cyan, teal, yellow, orange, pink, and purple, which pick a non-semantic hue.',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description:
        "Icon size. xsm, sm, md, and lg are 12, 16, 20, and 24px at a 16px root and scale with the root font size; a theme sets a size's glyph dimension with width and height, in px or rem, on components.icon['size:sm'] (and the other sizes). An explicit value wins. When omitted, Icon uses the nearest default supplied by an owning Astryx component for its icon slot, then falls back to md when no contextual default exists.",
      default: "Contextual; otherwise 'md'",
    },
    {
      name: 'variant',
      type: 'IconVariant',
      description:
        "Requests the active theme's alternate artwork for a semantic icon name, such as 'filled'. Names come from IconVariantMap, which an application augments from @astryxdesign/core/Icon; Astryx defines none. The theme's icon entry receives the variant only when the active theme lists it in iconVariants (and, for an entry the theme inherited, the theme that defined the entry lists it too); otherwise it draws its normal artwork. Ignored by an icon component passed directly. Selects artwork only: it is not written to the DOM and has no theming selector.",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for a MEANINGFUL, standalone icon (a status glyph or icon-only indicator with no adjacent text). Setting it exposes the icon to screen readers as role="img" with this text as the accessible name (aria-label) and removes the default aria-hidden. Omit it (default) for decorative icons and the icon stays hidden from assistive tech (aria-hidden="true"). This is the accessible-name / alt-text prop for icons: one prop instead of manually setting aria-label + role + aria-hidden. An empty string is treated as decorative. Do not set it when an interactive parent (Button, IconButton, link) already names the control.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        "StyleX styles for customization (color, size, opacity). Folded into the icon's own stylex.props() call so it composes with the base color/size styles. Must be a stylex.create() value, not an inline style object like style={{}}.",
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Class name added to the rendered glyph, beside the astryx-icon target class.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        "Inline styles merged onto the rendered glyph after Icon's own size and color styles.",
    },
    {
      name: 'ref',
      type: 'Ref<SVGSVGElement>',
      description:
        'Ref to the rendered SVG element, for an icon component and for a semantic or namespaced name. For a name, it is the <svg> inside the wrapper, or null when the resolved glyph has no <svg>.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-icon', visualProps: ['color', 'size']}],
    vars: [
      {
        name: '--_icon-width',
        description:
          'Glyph width for the size; set by width on the icon target',
        default: '0.75rem, 1rem, 1.25rem, or 1.5rem by size',
        private: true,
      },
      {
        name: '--_icon-height',
        description:
          'Glyph height for the size; set by height on the icon target',
        default: '0.75rem, 1rem, 1.25rem, or 1.5rem by size',
        private: true,
      },
    ],
    derived: [
      {property: 'width', vars: ['--_icon-width'], replaces: true},
      {property: 'height', vars: ['--_icon-height'], replaces: true},
    ],
  },
  usage: {
    description:
      'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    anatomy,
    bestPractices: [
      {
        guidance: true,
        description:
          'Use semantic icon names when available; they adapt to theme changes automatically.',
      },
      {
        guidance: true,
        description:
          "Override icons through the theme, not globally: defineTheme({icons: {close: <XMarkIcon />}}) scopes the swap to the active <Theme>, and extends shallow-merges it into derived themes. registerIcons() mutates a process-wide registry and warns in dev, so keep it for app bootstrap rather than making it a library's theming seam.",
      },
      {
        guidance: true,
        description:
          "To match artwork to the rendered size, make a theme or registered icon entry a pure, synchronous function of {size, variant}: defineTheme({icons: {info: ({size}) => <InfoIcon weight={size === 'sm' ? 'bold' : 'regular'} />}}). Icon passes the size it renders at; getIcon(), useIcon(), getIconRegistry() and theme.icons read the function at size md. A function that returns null draws nothing instead of falling back to the default icon. Do not use hooks, measure the DOM, or read browser or mutable state inside it.",
      },
      {
        guidance: true,
        description:
          'Pair icons with text labels for accessibility; icon-only elements need an accessible label.',
      },
      {
        guidance: true,
        description:
          'For a meaningful standalone icon (no adjacent text), give it an accessible name via the `label` prop: it sets role="img" + aria-label and unhides the icon.',
      },
      {
        guidance: true,
        description:
          'Use color tokens for icon colors, not hardcoded hex values.',
      },
      {
        guidance: true,
        description:
          'Be mindful of context; decorative icons in compact components can distract rather than help.',
      },
      {
        guidance: false,
        description:
          'Use icons as the sole means of conveying meaning; always provide a text alternative.',
      },
      {
        guidance: false,
        description:
          'Resize icons with arbitrary pixel values; use the provided size props.',
      },
      {
        guidance: false,
        description:
          'Mix icon styles (e.g. outline and filled) within the same context.',
      },
      {
        guidance: false,
        description:
          'Render raw SVG elements; always wrap in Icon for consistent sizing and color.',
      },
      {
        guidance: false,
        description:
          'Pass a `name` prop; Icon uses `icon` (not `name`) to specify which icon to render.',
      },
    ],
  },
}
```
