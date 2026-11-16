# Astryx component reference: Link/useLinkComponent.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Link/useLinkComponent.doc.mjs. Original SHA-256: 2452c57bd745eeccae7ee47f9ca88ea569399e55ddee409af5e6c8c00d546c55.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useLinkComponent',
  displayName: 'useLinkComponent',
  group: 'Link',
  keywords: [
    'link',
    'router',
    'client-side routing',
    'LinkProvider',
    'as',
    'polymorphic',
    'anchor',
    'nextjs',
    'href',
  ],
  params: [
    {
      name: 'as',
      type: 'LinkComponentType',
      description:
        "Component to render the link with, such as a router's link or 'a'. When set it wins over any LinkProvider.",
      required: false,
    },
  ],
  returns: [
    {
      name: 'LinkComponent',
      type: 'LinkComponentType',
      description:
        "The resolved component: as, else the nearest LinkProvider's component, else a native 'a'. It is stable while the resolved component is the same. It checks href and to under the Link href rule before rendering; when either is rejected it renders an anchor with no destination and never invokes the router. A custom component receives to={href} unless an explicit to is passed.",
    },
  ],
  usage: {
    description:
      "Resolves which component renders a link, so a custom component's links follow the app's router the same way Astryx's own links do. The order is the as argument, then the nearest LinkProvider's component, then a native anchor. Render the returned component with href (and to, for a router that reads it). Before rendering it checks both destinations under the Link href rule: a rejected destination renders an anchor with no destination, and a custom router is never invoked with it. A custom component receives to={href} unless to is passed explicitly.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it for links inside a custom component, so a LinkProvider wired to the router reaches them without a prop on every link.',
      },
      {
        guidance: true,
        description:
          "Pass as='a' for a destination the router cannot handle, such as a file download or a page outside the app.",
      },
      {
        guidance: false,
        description:
          "Import the router's link directly in a shared component; the component then ignores LinkProvider and the destination check.",
      },
    ],
  },
  relatedComponents: ['Link', 'LinkProvider'],
  relatedHooks: ['useLinkify'],
  importPath: '@astryxdesign/core/Link',
  category: 'utilities',
}
```
