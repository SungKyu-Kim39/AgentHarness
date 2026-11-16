# Astryx component reference: Drawer/Drawer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Drawer/Drawer.doc.mjs. Original SHA-256: ba2cff3c3827b39eb088c73804d7231b9b98cddf763f9191c8b7a28459054061.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Drawer',
  displayName: 'Drawer',
  // Keeps the registry route Drawer had as a canary-only Lab component.
  registry: {aliases: ['lab/drawer']},
  group: 'Drawer',
  category: 'Overlay',
  keywords: [
    'drawer',
    'side panel',
    'panel',
    'inspector',
    'detail view',
    'overlay',
    'slide',
    'sidebar',
    'dialog',
    'side drawer',
    'sidesheet',
  ],
  // No isInline docs-preview prop (the drawer has no inline containment), so
  // this is the overlay preview: closed on load with an open trigger, knobs
  // live, and opening renders the real top-layer drawer — see
  // ComponentPlaygroundConfig.overlay (#3657).
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      label: 'Details',
      children: {
        __element: 'Section',
        props: {padding: 4},
        children: {
          __element: 'VStack',
          props: {gap: 2},
          children: [
            {__element: 'Heading', props: {level: 3}, children: 'Details'},
            {
              __element: 'Text',
              props: {type: 'body'},
              children: 'Adjust the properties below, then open the preview.',
            },
          ],
        },
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'astryx-drawer', visualProps: ['side']},
      {className: 'astryx-drawer-header'},
      {className: 'astryx-drawer-header-start-content'},
      {className: 'astryx-drawer-header-title-block'},
      {className: 'astryx-drawer-header-end-content'},
      {className: 'astryx-drawer-header-close-icon'},
    ],
    derived: [{property: 'padding', expand: 'container'}],
  },
  description:
    "Side panel that floats above page content, using the native <dialog> element. Slides in from the inline start or end edge; full height, never reflows the layout underneath. Like Dialog, it is a container: set padding (or a theme's drawer padding) and a lone Section child or bleed children such as Table and Divider align against that inset. The default inset is --spacing-4 (16px), as in Dialog.",
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Whether the drawer is open. Fully controlled; pair with onOpenChange.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Called when the drawer requests an open-state change. Escape and a scrim click call it with false as purpose allows; a DrawerHeader given the same callback calls it from its close button. The caller owns the open state. With sibling drawers open, Escape only closes the last-opened one.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the drawer. Required; the drawer has no built-in heading to derive a name from.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Drawer content, rendered inside a full-height scrollable area. Compose your own header/body/footer; an element with data-autofocus is focused on open. Children stay mounted during the exit animation; keep the last-selected item rendered instead of nulling content on close.',
      required: true,
    },
    {
      name: 'side',
      type: "'start' | 'end'",
      description:
        "Edge the drawer slides from: 'end' is right in LTR (the inspector convention), 'start' is left. Inline axis only; for a bottom sheet use BottomSheet.",
      default: "'end'",
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        "Desktop width budget. A number is pixels; a string is any CSS length ('50%', '32rem'). Below the 640px mobile breakpoint this remains the maximum while the drawer preserves a 56px reveal of the page behind.",
      default: '400',
    },
    {
      name: 'experimental',
      type: '{isFullWidthOnMobile?: boolean}',
      stability: 'experimental',
      description:
        'Experimental options: anything in this object may change or be removed in a patch release, and omitting it keeps the stable behavior. isFullWidthOnMobile (default false) covers the full viewport width below the 640px mobile breakpoint instead of preserving the default 56px reveal of the page behind, which makes the drawer read as an overlay, not a navigation.',
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'Modal scrim behind the drawer. true uses showModal() (top layer, focus trap, scroll lock; clicking the scrim closes unless purpose prevents it; modal only); false uses the manual Popover API for a non-modal top-layer overlay that does NOT trap focus and keeps the page behind interactive.',
      default: 'true',
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        'Configures implicit dismissal, matching Dialog. info: Escape and a scrim click close. form: Escape closes, a scrim click does not. required: neither closes (Escape is consumed) and a modal drawer is exposed as an alertdialog, so give its content a way out. A non-modal drawer has no scrim, so form and info behave the same.',
      default: "'info'",
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        "Internal padding of the drawer content using the spacing scale, matching Dialog. When omitted, uses the theme default for drawers: --spacing-4 (16px) unless the theme sets padding on drawer. Pass 0 for a full-bleed content area. A lone Section child escapes the padding, bleed children such as Table and Divider compensate against it, and a Layout picks it up for its regions. The content area's block-end edge adds the home-indicator safe area on top in every mode.",
    },
  ],
  usage: {
    anatomy,
    description:
      'A side panel that floats above page content for inspectors and detail views: the "click a table row, see its details" pattern. Unlike a docked panel it overlays the layout instead of reflowing it. Works on desktop and touch: the width budget applies on desktop and the panel preserves a 56px page reveal below 640px without exceeding the width budget. Escape closes the drawer (unless purpose is required) and focus returns to the element that opened it. Entry/exit slide animation respects prefers-reduced-motion. On a phone or tablet (a coarse primary pointer), a tap or a drag that lands while the drawer is still sliding in reaches nothing (for a drawer without a scrim, only one on the panel: the page stays live), and the drawer finishes sliding in; keys and assistive technology stay live, and a mouse or a trackpad still clicks: at once when it was the last pointer used, otherwise once it moves. Stacking contract: sibling drawers stack last-opened on top, Escape closes only the topmost, and closing peels innermost-first; render them as siblings, never nested.\n\nLike Dialog, the drawer is a container: its content area is inset by --spacing-4 (16px) by default, by the padding prop, or by a theme\'s padding on drawer. Compose the header, body, and footer the way Dialog does, with a Layout: DrawerHeader in the header slot (it shows a close button when you pass it onOpenChange, like DialogHeader), the body in LayoutContent, and actions in LayoutFooter. The Layout redistributes the inset to those regions so they line up on one content line, and the header is not inset twice. A lone Section child also escapes the inset. Drawer renders no close button of its own, so give every drawer a visible way to close, especially a non-modal one, which has no scrim to click. Put data-autofocus on the control that should receive focus on open.\n\nChoosing a surface: use Dialog for a centered decision or short form, Drawer for full-height side detail that keeps the page in sight, BottomSheet for block-axis sheets on touch, and a docked panel (a layout column) when content should reflow the page instead of floating over it.\n\nTheming: the panel is the single stable target (astryx-drawer, with data-side reflecting side), and the scrim is the panel\'s native ::backdrop. DrawerHeader exposes astryx-drawer-header targets for its row, slots, and close icon.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for contextual detail views (row inspectors, entity details) where the user should keep the underlying list in sight.',
      },
      {
        guidance: true,
        description:
          'Keep the caller as the source of truth: derive isOpen from selection state and clear the selection in onOpenChange.',
      },
      {
        guidance: true,
        description:
          'Use hasScrim={false} for master-detail flows; non-modal drawers do not trap focus and the page behind stays interactive.',
      },
      {
        guidance: true,
        description:
          'Keep the last-selected item rendered on close: children stay mounted during the exit animation, so nulling content mid-close blanks the panel while it slides out.',
      },
      {
        guidance: true,
        description:
          'Give every drawer a visible close action, usually DrawerHeader with onOpenChange; a non-modal drawer has no scrim to click.',
      },
      {
        guidance: true,
        description:
          'Use purpose="form" when a stray scrim click would discard unsaved input.',
      },
      {
        guidance: false,
        description:
          'Use a Drawer for short confirmations or small forms; use Dialog or AlertDialog instead.',
      },
      {
        guidance: false,
        description:
          'Reach for a Drawer when the content should push the page aside; a Drawer floats over content, so use a docked panel or layout column instead.',
      },
      {
        guidance: false,
        description:
          'Use a Drawer as a bottom or top sheet; it is inline-axis only, so use BottomSheet for block-axis sheets.',
      },
      {
        guidance: false,
        description:
          'Nest a Drawer inside another Drawer; render drawers as siblings; the last-opened stacks on top and Escape closes it first.',
      },
    ],
  },
  // CLI snippets. The docsite renders the paired Drawer blocks in ../../blocks.
  examples: [
    {
      label: 'Basic',
      code: `const [isOpen, setIsOpen] = useState(false);
<>
  <Button label="Open drawer" onClick={() => setIsOpen(true)} />
  <Drawer
    isOpen={isOpen}
    onOpenChange={setIsOpen}
    label="Details"
    width={360}>
    <Layout
      header={<DrawerHeader title="Details" onOpenChange={setIsOpen} />}
      content={
        <LayoutContent>
          <Text type="body">Close with Escape, the scrim, or the close button.</Text>
        </LayoutContent>
      }
    />
  </Drawer>
</>
// Modal by default: the scrim dims the page and focus is trapped. Escape, a
// scrim click, or the header's close button closes it, and focus returns to
// the trigger.`,
    },
    {
      label: 'Modal or non-modal (hasScrim)',
      code: `const [openModal, setOpenModal] = useState(false);
const [openPanel, setOpenPanel] = useState(false);
<>
  {/* Modal (default): the scrim dims the page, focus is trapped, and a
      scrim click closes. */}
  <Drawer isOpen={openModal} onOpenChange={setOpenModal} label="Edit details">
    <EditForm />
  </Drawer>
  {/* Non-modal: no scrim, no focus trap; the page behind stays interactive.
      With no scrim to click, the header's close button is the visible exit. */}
  <Drawer
    isOpen={openPanel}
    onOpenChange={setOpenPanel}
    label="Details"
    hasScrim={false}>
    <Layout
      header={<DrawerHeader title="Details" onOpenChange={setOpenPanel} />}
      content={<LayoutContent><DetailsPanel /></LayoutContent>}
    />
  </Drawer>
</>`,
    },
    {
      label: 'Edit form with footer actions',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Edit host"
  purpose="form">
  <Layout
    header={<DrawerHeader title="Edit host" onOpenChange={setIsOpen} />}
    content={<LayoutContent><HostFields /></LayoutContent>}
    footer={
      <LayoutFooter>
        <HStack gap={2} hAlign="end">
          <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
          <Button label="Save" variant="primary" onClick={save} />
        </HStack>
      </LayoutFooter>
    }
  />
</Drawer>
// purpose="form" keeps Escape but ignores scrim clicks, so a stray click
// outside does not discard edits. The footer stays pinned while the fields
// scroll.`,
    },
    {
      label: 'Slide in from the start edge',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Navigation"
  side="start">
  <NavPanel />
</Drawer>
// 'start' is left in LTR and mirrors under RTL; 'end' (the default) is the
// inspector convention.`,
    },
    {
      label: 'Width budget: pixels or any CSS length',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Details"
  width="50%">
  <DetailsPanel />
</Drawer>
// A number is pixels (width={320}); a string is any CSS length ('32rem',
// '50%'). The budget also caps the drawer on mobile.`,
    },
  ],
}
```
