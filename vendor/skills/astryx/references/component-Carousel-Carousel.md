# Astryx component reference: Carousel/Carousel.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Carousel/Carousel.doc.mjs. Original SHA-256: 09aa7f5193218c93f5014317c06cb5b2eb381d32f32104b710f188ee729f8ac1.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Carousel',
  displayName: 'Carousel',
  category: 'Container',
  keywords: ['carousel', 'slider', 'scroll', 'gallery', 'filmstrip', 'swiper', 'horizontal', 'overflow', 'snap'],
  usage: {
    description:
      'Carousel scrolls a row of items horizontally when they overflow the available width. Use it for card grids, image galleries, product lists, or any set of items that should be browsable without taking up the full page.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should land precisely at the start edge, like a gallery or product list.'},
      {guidance: true, description: "For iOS paging under a finger and on a trackpad swipe, pass hasSnap={useSnapPaging()} from @astryxdesign/core/SnapPaging. A flick moves one view, or one item with useSnapPaging({pages: 'item'}). A mouse wheel keeps native snapping. Only a carousel given it loads the paging code."},
      {guidance: true, description: 'Reach for hasLoop on small, cyclable sets like a photo gallery, where wrapping past the last item back to the first feels natural.'},
      {guidance: true, description: 'Always provide an aria-label that describes what the carousel contains, like "Featured products" or "Team members".'},
      {guidance: true, description: 'Carousel implements the WAI-ARIA APG carousel pattern (https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) without auto-rotation: the region is labelled and carries aria-roledescription="carousel", each item is a group named "Slide N of M", and the scroll container is a tab stop while its content overflows, so keyboard users can pan it with the arrow keys; while everything fits it stays out of the tab order.'},
      {guidance: true, description: 'Use a consistent gap and item width so the carousel looks intentional, not like content overflowing by accident.'},
      {guidance: true, description: 'Trust the built-in navigation: trackpad users can swipe horizontally, and mouse users can hold Shift while scrolling the wheel to move through items.'},
      {guidance: false, description: 'Use a carousel for content every user must see. Not everyone scrolls horizontally, so put critical content above the fold.'},
      {guidance: false, description: 'Auto-advance items. Let the user scroll at their own pace.'},
      {guidance: false, description: 'Nest carousels. A carousel inside a carousel is confusing and breaks keyboard navigation.'},
    ],
    anatomy: [
      {name: 'Scroll container', required: true, description: 'The horizontal overflow area that holds all items.'},
      {name: 'Items', required: true, description: 'The children rendered in a row inside the scroll container. With hasSnap, each item snaps to the start edge.'},
      {name: 'Fade edges', required: false, description: 'Gradient fades on the left and right edges that indicate more content is available. Enabled by default, disable with hasEdgeFade={false}.'},
      {name: 'Navigation buttons', required: false, description: 'Prev/next buttons that appear when the content can scroll in that direction. Enabled by default, disable with hasButtons={false}.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Carousel items rendered in a horizontal scroll container.', required: true},
    {name: 'gap', type: "0 | 0.5 | 1 | 1.5 | 2 | 3 | 4", description: 'Gap between items using the spacing token scale.', default: '1'},
    {name: 'hasButtons', type: 'boolean', description: 'Show prev/next navigation buttons when content is scrollable.', default: 'true'},
    {name: 'hasEdgeFade', type: 'boolean', description: 'Show a gradient edge-fade mask when content overflows, signalling that more items exist off-screen.', default: 'true'},
    {name: 'hasLoop', type: 'boolean', description: 'Wrap-around scrolling: next at the end scrolls to the start, prev at the start scrolls to the end. Buttons stay visible at both edges. Only engages when content overflows.', default: 'false'},
    {name: 'hasSnap', type: 'boolean | SnapPaging', description: "Snap each child to the start edge. hasSnap uses native CSS scroll snap. hasSnap={useSnapPaging()} adds iOS paging under a finger and on a trackpad swipe, on the same stops: a flick moves one view, or one item with useSnapPaging({pages: 'item'}). Only that value loads the paging code.", default: 'false'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Inline padding inside the scroll container, with matching scroll-padding so snap points align to the content edge.'},
    {name: 'aria-label', type: 'string', description: 'Accessible label for the carousel region.', default: "\'Carousel\'"},
    {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: 'Ref forwarded to the root element.'},
    {name: 'handleRef', type: 'React.Ref<CarouselHandle>', description: 'Imperative handle exposing scrollNext(), scrollPrev(), scrollTo(index), canScrollNext(), and canScrollPrev() for programmatic scroll control.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value.'},
    {name: 'className', type: 'string', description: 'CSS class name for the root element. Prefer xstyle for styling.'},
    {name: 'style', type: 'CSSProperties', description: 'Inline styles for the root element. Prefer xstyle.'},
    {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
  ],
  playground: {
    defaults: {
      children: [
        {__element: 'Card', props: {padding: 4}, children: 'Slide 1'},
        {__element: 'Card', props: {padding: 4}, children: 'Slide 2'},
        {__element: 'Card', props: {padding: 4}, children: 'Slide 3'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-carousel'},
      {className: 'astryx-carousel-scroller', visualProps: ['gap', 'padding', 'snap', 'edgeFade']},
    ],
  },
}
```
