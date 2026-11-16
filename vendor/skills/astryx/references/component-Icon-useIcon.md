# Astryx component reference: Icon/useIcon.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Icon/useIcon.doc.mjs. Original SHA-256: ff471896cd47f094720ce764d306df4f5962f1f5857e5a02adcdf2e8c9f3f8bf.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useIcon',
  displayName: 'useIcon',
  group: 'Icon',
  keywords: [
    'icon',
    'semantic icon',
    'theme icons',
    'icon registry',
    'getIcon',
    'registerIcons',
    'success',
    'warning',
    'error',
  ],
  params: [
    {
      name: 'name',
      type: 'IconName | NamespacedIconName',
      description:
        "Semantic icon name, such as 'success', 'warning' or 'close', or a namespaced extension key such as 'richtext:bold'. Both resolve through the same registry.",
      required: true,
    },
  ],
  returns: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        "The icon for that name from the nearest Theme's icons (or, outside any Theme, from the registered theme the document root names), else from registerIcons() overrides, else the built-in default. A function entry is read at {size: 'md'}.",
    },
  ],
  usage: {
    description:
      "Resolves a semantic icon name to a React node through the nearest Theme, so a custom component draws the same success, warning or error icon that Astryx components draw and follows a theme that overrides it. Resolution reads the nearest Theme's icons (outside any Theme, the registered theme the document root names), then registerIcons() overrides, then the built-in default. The node is returned as is, with no size or color wrapper: the built-in icons are 1em squares in currentColor, so they follow the surrounding text. A function entry is read at {size: 'md'}. Render <Icon icon={name} /> instead when the icon needs another size, a color or a label.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it in a custom component that places a semantic icon itself, so a Theme that overrides the icon changes the component too.',
      },
      {
        guidance: true,
        description:
          'Render <Icon icon={name} /> when the icon needs a size other than md, a color, or an accessible label.',
      },
      {
        guidance: false,
        description:
          'Import a specific icon library glyph for a semantic purpose that a theme should control, such as a success or error state.',
      },
    ],
  },
  relatedComponents: ['Icon', 'Theme'],
  relatedHooks: ['useTheme'],
  importPath: '@astryxdesign/core/Icon',
  category: 'utilities',
}
```
