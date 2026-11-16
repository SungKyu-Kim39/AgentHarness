# Astryx component reference: hooks/useAnnounce.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useAnnounce.doc.mjs. Original SHA-256: 0756135240a7d7a13a9bfad449df3b8c146fbefe649b012e5b129e2f98f05583.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useAnnounce',
  displayName: 'useAnnounce',
  keywords: [
    'announce',
    'live region',
    'aria-live',
    'screen reader',
    'accessibility',
    'a11y',
    'status',
    'alert',
    'polite',
    'assertive',
    'visually hidden',
    'wcag',
    'replace',
    'result count',
  ],
  params: [
    {
      name: 'options',
      type: 'UseAnnounceOptions',
      description: 'Configuration object.',
      required: false,
    },
    {
      name: 'options.hasReplace',
      type: 'boolean',
      description:
        "The instance states one current state, such as a search's result count: each message it writes withdraws the instance's previous message while that one has not been spoken yet, whatever their politeness, and is spoken at its own politeness. A message already spoken stays. Messages from other instances, and from instances without hasReplace, still join. Give each state a component reports its own instance, for example one for the result count and one for selection changes.",
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'announce',
      type: '(message: string, politeness?: "polite" | "assertive") => void',
      description:
        'Speaks a message through the live region the caller can be heard from: the shared one on the page body, or, when the calling component is rendered inside an open Astryx modal (Dialog, modal BottomSheet, modal Drawer, Lightbox, MobileNav, CommandPalette), a persistent region inside that modal, since a native modal hides the page-body region from assistive technology. Politeness defaults to "polite"; messages announced in the same frame are joined, in order, into one announcement, and an identical repeat is kept once, except that each message from a hasReplace instance replaces the previous message of that instance not yet spoken. An empty message clears any lingering status, including joined messages not yet spoken, instead of announcing.',
    },
  ],
  usage: {
    description:
      'Imperatively announces a message to screen readers through a visually-hidden live region. Use it for state that is only conveyed visually; search result counts, "no results", loading and saved confirmations, validation errors (WCAG 4.1.3 Status Messages). The polite and assertive regions are created empty on first use and stay mounted, which is what makes announcements reliable: most screen readers ignore a live region that is inserted together with its content. Each message is cleared a couple of seconds after it is announced so stale status does not linger in the accessibility tree. A message is delivered where its caller is: from inside an open Astryx modal it goes to a region inside that modal and is heard there with no change to the calling code; a message sent just as the modal is dismissed is delivered through whatever is exposed afterwards rather than lost. A call made outside the modal, even by the component that renders it, uses the page-body region.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for this instead of hand-rolling an aria-live div; a region rendered with its content usually does not announce at all.',
      },
      {
        guidance: true,
        description:
          'Keep "polite" for status and result counts; reserve "assertive" for errors and time-sensitive alerts, since it interrupts whatever the screen reader is saying.',
      },
      {
        guidance: true,
        description:
          'Announce the outcome, not the interaction; "12 results" rather than "search ran".',
      },
      {
        guidance: true,
        description:
          'Send a value that keeps changing, such as a result count as the user types, through its own useAnnounce({hasReplace: true}) instance, so input faster than a frame says only the latest count.',
      },
      {
        guidance: false,
        description:
          'Announce content that is already visible and correctly labeled in the DOM; that doubles up for screen reader users.',
      },
    ],
  },
  relatedComponents: ['VisuallyHidden', 'Toast'],
  relatedHooks: ['useClipboard'],
  importPath: '@astryxdesign/core/hooks',
  category: 'accessibility',
}
```
