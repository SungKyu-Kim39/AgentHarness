# Astryx component reference: PowerSearch/usePowerSearchConfig.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/PowerSearch/usePowerSearchConfig.doc.mjs. Original SHA-256: 20bf62ca8c5d6afcf98bbb890851805a18b2473c9947c5799c0e3c069bde9f48.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'usePowerSearchConfig',
  displayName: 'usePowerSearchConfig',
  group: 'PowerSearch',
  keywords: [
    'powersearch',
    'search',
    'filter',
    'filters',
    'query builder',
    'table filter',
    'usePowerSearchConfig',
    'createPowerSearchConfig',
  ],
  params: [
    {
      name: 'definitions',
      type: 'ReadonlyArray<FieldDefinition>',
      description:
        'Typed field definitions (key, type, label, enumValues) used to build PowerSearch fields and operators.',
      required: true,
    },
    {
      name: 'configName',
      type: 'string',
      description:
        'Optional name for the PowerSearchConfig object (defaults to "PowerSearchConfig").',
      required: false,
    },
  ],
  returns: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        'Memoized PowerSearch configuration object with fields and type-appropriate operators.',
    },
    {
      name: 'applyFilters',
      type: '<T extends InferData<D>>(filters: ReadonlyArray<PowerSearchFilter>, data: ReadonlyArray<T>) => T[]',
      description:
        'Client-side filtering helper that filters a dataset using the active PowerSearch filter rules.',
    },
  ],
  usage: {
    description:
      'Memoizes a PowerSearch configuration built from typed field definitions and returns it along with an applyFilters function for client-side filtering. Automatically maps field types (string, number, boolean, date, enum, etc.) to their canonical operators and provides an efficient predicate evaluator to filter datasets.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Declare field definitions as const outside the component or memoize them so usePowerSearchConfig only recalculates when needed.',
      },
      {
        guidance: true,
        description:
          'Pass the returned config to PowerSearch and use applyFilters to compute the filtered data rows for a Table or List.',
      },
      {
        guidance: false,
        description:
          'Recreate field definitions inline on every render without as const or memoization.',
      },
    ],
  },
  relatedComponents: ['PowerSearch', 'Table'],
  relatedHooks: ['useTableFilterState', 'useTableFiltering'],
  importPath: '@astryxdesign/core/PowerSearch',
  category: 'utilities',
}
```
