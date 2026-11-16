# Astryx component reference: Markdown/Markdown.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Markdown/Markdown.doc.mjs. Original SHA-256: c1dfb26820f7a3d8f3b55be915307ab0b985e03991fe85f78e4bd119c70f590f.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Markdown',
  displayName: 'Markdown',
  category: 'Content',
  keywords: [
    'markdown',
    'rich text',
    'prose',
    'renderer',
    'streaming',
    'markup',
    'formatted text',
    'md',
    'markdown renderer',
  ],
  props: [
    {
      name: 'children',
      type: 'string',
      description: 'The markdown string to render.',
      required: true,
    },
    {
      name: 'display',
      type: "'block' | 'inline'",
      description:
        "Display type. Markdown defaults to block. Use 'inline' for markdown spans embedded inside text.",
      default: "'block'",
    },
    {
      name: 'density',
      type: "\'default\' | \'compact\'",
      description: 'Controls spacing between block-level elements.',
      default: "\'default\'",
    },
    {
      name: 'headingLevelStart',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'The HTML heading level that markdown # maps to. Shifts all heading levels down to fit the surrounding page hierarchy. Levels exceeding h6 are clamped to h6.',
      default: '1',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description:
        'Enables streaming mode; it uses incremental parsing and a smooth fade-in animation for chunk-by-chunk text delivery.',
      default: 'false',
    },
    {
      name: 'onLinkClick',
      type: '(href: string, event: MouseEvent) => void | false',
      description:
        'Handler for link clicks. Return false to prevent the default navigation behavior. Link destinations in the markdown follow the shared navigation rule described on the Link `href` prop, and Markdown also rejects every data: URL in a link or an image: a rejected destination renders as plain text and never reaches this handler or a custom link renderer.',
    },
    {
      name: 'sources',
      type: 'Record<string, MarkdownSource>',
      description:
        'Citation sources keyed by ID. When provided, [id] and 【id】 markers in the markdown that match a key are rendered as citation chips.',
    },
    {
      name: 'citationStyle',
      type: "'label' | 'number'",
      description:
        "How citations are displayed inline. 'label' shows a chip with source title, icon, and border. 'number' shows a compact numbered badge.",
      default: "'label'",
    },
    {
      name: 'contentWidth',
      type: 'number | string',
      description:
        'Max width for prose content (paragraphs, headings, lists, blockquotes). Tables and code blocks are unconstrained and can expand to the full container width. Use for readable line lengths in wide layouts.',
      default: '680',
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        'Alignment of prose content within the container when contentWidth is narrower than the available space.',
      default: "'start'",
    },
    {
      name: 'plugins',
      type: 'readonly MarkdownPluginEntry[]',
      description:
        'Ordered extensions created by createMarkdownPlugin(). Plugins may add bounded syntax, immutable typed AST transforms, and typed extension renderers. Use isMarkdownExtensionNode() to narrow extension data observed from other plugins. Renderer callbacks are pure; return a child component when hooks are needed. Omitted and empty lists preserve the released Markdown behavior.',
    },
    {
      name: 'inlinePlugins',
      type: 'MarkdownInlinePlugin[]',
      description:
        'Transforms regex matches in parsed text nodes into custom inline React elements. Use for prefixed identifiers, mentions, and other shorthand patterns. Inline code, fenced code blocks, and math are unaffected.',
    },
    {
      name: 'autolink',
      type: "'gfm'",
      description:
        "Opt-in autolinking of bare URLs and emails. 'gfm' applies GitHub-Flavored Markdown autolink-literal rules: bare https?://..., www...., <scheme:url>, <email>, and user@host all become links. Trailing sentence punctuation and unbalanced trailing close-parens are excluded; matches inside code spans, code blocks, existing links, and image alt text are skipped. Default behavior (option unset) is unchanged.",
    },
    {
      name: 'codeLanguages',
      type: 'ReadonlyArray<CodeLanguage>',
      description:
        "CodeBlock language values a fence may name, each imported on its own (e.g. graphql from @astryxdesign/core/CodeBlock/languages/graphql) or made with createCodeLanguage. A fence whose language word is one of a listed value's identifiers renders with it, ahead of a built-in; a diff-<identifier> fence takes the diff layer over it; a later entry wins. Pass the same list to RichTextEditor or RichTextView so read and edit match.",
    },
    {
      name: 'components',
      type: 'MarkdownComponents',
      description:
        'Custom React component overrides for rendered Markdown elements (code, inlineCode, math, link, heading, paragraph, image, blockquote, hr, citation). Providing math enables `$…$` inline and `$$…$$` display parsing and receives `{value, display}`; omit it when dollar text should stay literal.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling; className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for styling; inline styles bypass StyleX optimization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  playground: {
    defaults: {
      children:
        "## Getting Started\n\nInstall the package:\n\n```bash\nnpm install @astryxdesign/core\n```\n\nThen import and use any component:\n\n```tsx\nimport {Button} from '@astryxdesign/core/Button';\n```\n\n**Bold**, *italic*, and `inline code` all work.",
    },
  },
  theming: {
    targets: [
      {className: 'astryx-markdown', visualProps: ['density']},
      {
        className: 'astryx-markdown-heading',
        visualProps: ['density', 'level'],
      },
      {
        className: 'astryx-markdown-paragraph',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-list',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-codeblock',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-blockquote',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-table',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-hr',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-image',
        visualProps: ['density'],
      },
    ],
  },
  usage: {
    anatomy,
    description:
      'Renders a markdown string as Astryx-styled components. Use Markdown for user-generated content, AI responses, and documentation; it handles headings, lists, tables, code blocks, and citations with consistent styling.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set headingLevelStart to match the page hierarchy, e.g. start at 3 if the markdown sits inside an h2 section.',
      },
      {
        guidance: true,
        description:
          'Use contentWidth to keep prose at a readable line length in wide layouts.',
      },
      {
        guidance: true,
        description:
          'Emphasis and strong pair as CommonMark specifies, so *see **bold** more* puts the bold inside the emphasis. ***text*** renders as strong around emphasis, the order RichText draws, and is announced as both. Emphasis nested more than 100 levels deep stays as written text.',
      },
      {
        guidance: true,
        description:
          'Use plugins created by createMarkdownPlugin for reusable syntax, immutable AST transforms, and typed extension rendering. Keep the ordered list stable while its syntax configuration is unchanged.',
      },
      {
        guidance: true,
        description:
          'To render a plugin node outside Markdown, as another surface showing the same document does, read what the plugin declares with getMarkdownPluginCapabilities (syntax and transform, nothing else), and render each parsed extension node with MarkdownPluginNodeRenderer from the client-only @astryxdesign/core/Markdown/plugin-renderer subpath. It presents the node exactly as Markdown does, fallbacks and failure reports included, with no element of its own.',
      },
      {
        guidance: true,
        description:
          'Add markdownSoftBreaksPlugin when single line endings are meaningful. It matches remark-breaks for supported Markdown, including multiline link labels, while code and other opaque content stay unchanged.',
      },
      {
        guidance: true,
        description:
          'Add markdownSourceLinesPlugin when a feature maps the rendered document back to Markdown source lines (find, highlights, review comments). Every block Markdown renders, nested blocks included, then carries data-source-line and data-source-line-end (1-based, inclusive); components block renderers receive sourceLines to place on their own element, and plugin renderers read node.position lines. Inline elements, table rows, and cells carry none. Without the plugin no line work runs.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownTextTransform for prose matching; it preserves code, links, images, citations, math, and accepted extension syntax as protected contexts. Provide requiredSubstrings only when they conservatively cover every possible match.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownFenceTransform for declared code-fence languages with semantic data. createNode returns an owned block extension node; its standard plugin renderer and toText own presentation. A claimed fence renders through that plugin even when components.code is supplied; components.code renders every unclaimed fence and is the fallback when the plugin renderer declines, throws, or suspends, and without it the accessible, copyable CodeBlock is that fallback.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownSourceDecoration to attach non-visual metadata — search hits, review annotations — to the blocks a source range touches, and getMarkdownSourceDecorations to read it back in a later plugin. Decorations appear on the settled document rather than on partial streaming chunks, and never change rendering, copyable text, accessible names, ids, focus order, or navigation.',
      },
      {
        guidance: true,
        description:
          'Import parseMarkdownAst or parseInlineAst from @astryxdesign/core/Markdown/parser when server or React Server Component code needs to run plugins against the canonical readonly tree. The parser and plugin subpaths have no use-client boundary. The Markdown component remains client-owned, so function-bearing plugin entries must not be passed across an RSC serialization boundary.',
      },
      {
        guidance: true,
        description:
          'Use decodeMarkdownCharacterReferences (from @astryxdesign/core/Markdown/parser or @astryxdesign/core/Markdown) to show text the way Markdown renders its character references: &copy;, &#169;, and &#xA9; become ©, while unknown names and references without their semicolon stay as written. It decodes plain text and knows nothing of Markdown, so skip code and backslash-escaped references yourself. It uses the same table Markdown renders with.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownFrontmatter for typed document metadata. Its parse() method gives the host metadata directly; its plugin removes a complete leading block before rendering and withholds an unfinished block during streaming.',
      },
      {
        guidance: true,
        description:
          "Import createMarkdownRemarkTransform from '@astryxdesign/core/Markdown/remark' only to reuse an existing synchronous transform-only Remark plugin; it stays out of every other bundle. Prove each plugin with fixtures: anything outside the supported MDAST subset — async work, parser or compiler plugins, processor state, raw HTML, unsupported nodes, forged positions, or metadata Astryx cannot represent — keeps the last valid document and reports one diagnostic.",
      },
      {
        guidance: true,
        description:
          'Use inlinePlugins for prefixed identifiers, mentions, and other prose-only shorthand instead of preprocessing the markdown string.',
      },
      {
        guidance: true,
        description:
          'Provide components.math only for documents that use dollar-delimited math. The renderer owns typesetting and accessible output; Astryx passes the expression as text and never executes raw HTML.',
      },
      {
        guidance: true,
        description:
          'For direct parsing, use MathParseOptions and handle InlineNodeWithMath or BlockNodeWithMath. Incremental math parsing also uses createIncrementalState<true>() and IncrementalParseState<true>; default calls and ParseOptions annotations keep the legacy unions.',
      },
      {
        guidance: true,
        description:
          'Install createMarkdownHeadingLinks() through plugins when a document needs copyable h1–h6 permalinks. The returned entry carries its validated namespace and URL base across compatible Core package copies. Each built-in heading keeps its incoming fragment ID and gains an inline trailing # copy button: it is hidden at fine-pointer rest through useContainerReveal, reveals on heading-row hover or keyboard focus, and stays visible under the hook’s coarse/touch semantics. Unmodified tap, click, Enter, or Space copies the canonical URL without navigation, hash mutation, or scrolling; a check confirms success for 1.5 seconds. The no-plugin path stays unchanged, and nested headings use the same depth-first identity projection as Markdown-derived Outline.',
      },
      {
        guidance: true,
        description:
          'For multiple documents, create one heading-links plugin per document with headingIdPrefix and pass that same plugin to Markdown and useOutlineFromMarkdown. Use the same stable value for Markdown id when the root also needs a DOM id; permalinkBaseUrl may supply a safe caller-owned URL before the fragment.',
      },
      {
        guidance: false,
        description:
          'Use Markdown for hand-authored layouts; use Text and Heading directly when you control the content.',
      },
    ],
  },
  examples: [
    {
      label: 'Inline display',
      code: `
import {Text} from '@astryxdesign/core/Text';

<Text>
  This description includes{' '}
  <Markdown display="inline">{'\`inline code\` and **bold text**'}</Markdown>
  .
</Text>;
`,
    },
    {
      label: 'GFM autolinks',
      code: `
<Markdown autolink="gfm">
  {'Visit https://example.com or email contact@example.com. ' +
    'You can also bracket links: <https://docs.example.com>.'}
</Markdown>;
`,
    },
    {
      label: 'Linkable headings',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';
import {Outline, useOutlineFromMarkdown} from '@astryxdesign/core/Outline';

const documentId = 'guide';
const headingLinks = createMarkdownHeadingLinks({
  headingIdPrefix: documentId,
});
const plugins = [headingLinks];

function Guide({source}) {
  const items = useOutlineFromMarkdown(source, {plugins});
  return (
    <>
      <Markdown id={documentId} plugins={plugins}>{source}</Markdown>
      <Outline items={items} />
    </>
  );
}
`,
    },
    {
      label: 'First-party soft breaks',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {markdownSoftBreaksPlugin} from '@astryxdesign/core/Markdown/plugins';

<Markdown plugins={[markdownSoftBreaksPlugin]}>
  {'First line\\nSecond line'}
</Markdown>;
`,
    },
    {
      label: 'Source-line stamps',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {markdownSourceLinesPlugin} from '@astryxdesign/core/Markdown/plugins';

// Each rendered block carries data-source-line / data-source-line-end.
<Markdown plugins={[markdownSourceLinesPlugin]}>
  {'# Title\\n\\n- one\\n- two'}
</Markdown>;
`,
    },
    {
      label: 'Text transform helper',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownPlugin,
  createMarkdownTextTransform,
} from '@astryxdesign/core/Markdown/plugins';

const finalLabels = createMarkdownPlugin({
  name: 'final-labels',
  apiVersion: 1,
  transform: createMarkdownTextTransform({
    pattern: /\\bDraft\\b/g,
    requiredSubstrings: ['Draft'],
    replace: () => ({type: 'text', value: 'Final'}),
  }),
});

<Markdown plugins={[finalLabels]}># Draft</Markdown>;
`,
    },
    {
      label: 'Semantic fence helper',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownFenceTransform,
  createMarkdownPlugin,
  type MarkdownExtensionNode,
} from '@astryxdesign/core/Markdown/plugins';

type DiagramNode = MarkdownExtensionNode<
  'diagrams',
  'diagram',
  {readonly code: string; readonly label?: string},
  'block'
>;

const diagrams = createMarkdownPlugin<'diagrams', DiagramNode>({
  name: 'diagrams',
  apiVersion: 1,
  transform: createMarkdownFenceTransform({
    languages: ['mermaid'],
    createNode: ({code, meta}) => ({
      type: 'extension',
      plugin: 'diagrams',
      name: 'diagram',
      display: 'block',
      data: {code, ...(meta == null ? {} : {label: meta})},
    }),
  }),
  renderers: {
    diagram: {
      render: ({node}) => (
        <Diagram source={node.data.code} label={node.data.label} />
      ),
      toText: node => node.data.code,
    },
  },
});

<Markdown plugins={[diagrams]}>
  {'\`\`\`mermaid Checkout flow\\ngraph LR; A-->B\\n\`\`\`'}
</Markdown>;
`,
    },
    {
      label: 'Source decoration helper',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownPlugin,
  createMarkdownSourceDecoration,
  getMarkdownSourceDecorations,
} from '@astryxdesign/core/Markdown/plugins';

// Ranges are UTF-16 offsets into the same string Markdown renders. Every
// block a range touches is annotated; rendering, copyable text, and ids
// never change.
const searchHits = createMarkdownPlugin({
  name: 'search-hits',
  apiVersion: 1,
  transform: createMarkdownSourceDecoration({
    name: 'search-hit',
    ranges: [{start: 0, end: 15, data: {query: 'release'}}],
  }),
});

const readDecorations = createMarkdownPlugin({
  name: 'read-decorations',
  apiVersion: 1,
  transform: root => {
    report(root.children.map(getMarkdownSourceDecorations));
    return root;
  },
});

<Markdown plugins={[searchHits, readDecorations]}>{source}</Markdown>;
`,
    },
    {
      label: 'Native frontmatter',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownFrontmatter} from '@astryxdesign/core/Markdown/plugins';

const frontmatter = createMarkdownFrontmatter({
  name: 'document-metadata',
  parse: fields => ({
    title: fields.title ?? 'Untitled',
    draft: fields.draft === 'true',
  }),
});

const source = '---\\ntitle: Release notes\\ndraft: true\\n---\\n# Shipped';
const result = frontmatter.parse(source);

<Markdown plugins={[frontmatter.plugin]}>{source}</Markdown>;
`,
    },
    {
      label: 'Compatible Remark plugin',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownPlugin} from '@astryxdesign/core/Markdown/plugins';
import {createMarkdownRemarkTransform} from '@astryxdesign/core/Markdown/remark';

// A synchronous transform-only Remark plugin in the usual attacher shape.
const remarkRename =
  ({from, to}) =>
  tree => {
    const rename = node => {
      if (node.type === 'text') {
        node.value = node.value.split(from).join(to);
      }
      node.children?.forEach(rename);
    };
    rename(tree);
  };

const productName = createMarkdownPlugin({
  name: 'product-name',
  apiVersion: 1,
  transform: createMarkdownRemarkTransform(remarkRename, {
    from: 'Astryx',
    to: 'Astryx Design',
  }),
});

<Markdown plugins={[productName]}># Astryx release notes</Markdown>;
`,
    },
    {
      label: 'Entity links',
      code: `
import {Link} from '@astryxdesign/core/Link';

const entityPlugins = [
  {
    pattern: /\\b([A-Z][A-Z0-9]+-\\d+)\\b/g,
    render: (match, key) => (
      <Link key={key} href={\`/entities/\${match[1]}\`}>
        {match[0]}
      </Link>
    ),
  },
];

<Markdown inlinePlugins={entityPlugins}>
  {'See DOC-2048. Inline code stays plain: \`DOC-9999\`.'}
</Markdown>;
`,
    },
    {
      label: 'Math renderer',
      code: `
import {BlockMath, InlineMath} from 'react-katex';

function MathExpression({value, display}) {
  const Component = display === 'block' ? BlockMath : InlineMath;
  return <Component math={value} />;
}

<Markdown components={{math: MathExpression}}>
  {'Inline $x_1 + y$ and display math:\\n\\n$$\\n\\\\sum_i x_i\\n$$'}
</Markdown>;
`,
    },
  ],
}
```
