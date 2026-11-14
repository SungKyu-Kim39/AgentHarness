# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/css/dynamic-sibling-styling.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Styling siblings based on count and index

Historically, applying unique styles to each sibling in a list required complex `:nth-child` loops or JavaScript to inject inline styles. Modern CSS provides `sibling-index()` and `sibling-count()` to perform these calculations directly in your stylesheet, enabling dynamic layouts and color systems that automatically adapt as elements are added or removed.

## Dynamic color systems

You can create a color spectrum across a group of siblings by calculating a unique hue or lightness value for each child. This ensures a consistent gradient effect regardless of the number of items.

```css
.swatch {
  /* Calculate hue by dividing the full 360deg circle by total siblings */
  /* and multiplying by the current element's 1-based index */
  background-color: hsl(
    calc(360deg / sibling-count() * sibling-index()),
    70%,
    50%
  );
}
```

## Symmetrical layout and fan effects

To create symmetrical effects (like a "fan" or centering items), use the total count to find the midpoint of the list.

```css
.card {
  /* Find the center index (e.g., 3 if there are 5 siblings) */
  --center: calc((sibling-count() + 1) / 2);

  /* Rotate items away from the center: negative for left, positive for right */
  /* center element gets 0deg rotation */
  transform: rotate(calc(10deg * (sibling-index() - var(--center))));
}
```

## Circular and complex positioning

By combining these functions with CSS trigonometry (`sin()`, `cos()`), you can place elements in a perfect circle without any manual coordinates.

```css
.orb {
  /* Calculate the angle for this item's position on a 360deg circle */
  --angle: calc(360deg / sibling-count() * sibling-index());
  --radius: 150px;

  /* Set the pre-transformed position for all items to be centered */
  position: absolute;
  place-self: center;


  /* Position each element around the parent center */
  transform: translate(
    calc(cos(var(--angle)) * var(--radius)),
    calc(sin(var(--angle)) * var(--radius))
  );
}
```

### Fallback strategies

Baseline status for sibling-count() and sibling-index(): Newly available. It's been Baseline since 2026-08-18.
Supported by: Chrome 138 (Jun 2025), Edge 138 (Jun 2025), Firefox 154 (Aug 2026), and Safari 26.2 (Dec 2025).

If `sibling-index()` and `sibling-count()` are not supported, provide a fallback by injecting CSS custom properties via JavaScript. **MANDATORY:** Use feature detection with `CSS.supports()` to ensure the script only runs when necessary.

```js
/* MANDATORY: Check for native support before applying fallback */
if (!CSS.supports('top: calc(sibling-index() * 1px)')) {
  const items = document.querySelectorAll('.item');
  items.forEach((item, index) => {
    /* MANDATORY: Injected index must be 1-based to match native function */
    item.style.setProperty('--sibling-index', index + 1);
    item.style.setProperty('--sibling-count', items.length);
  });
}
```

In your CSS, use these variables as a base and override them with native functions inside an `@supports` block. **MANDATORY:** You MUST wrap the native function overrides in `@supports` to ensure the variables remain valid in older browsers.

```css
.item {
  /* 1. Set base values using variables (from JS fallback) */
  --index: var(--sibling-index);
  --count: var(--sibling-count);

  /* 2. Use the computed variables - replace this with your implementation-specific styles */
  background-color: hsl(calc(360deg / var(--count) * var(--index)), 70%, 50%);
}

@supports (top: calc(sibling-index() * 1px)) {
  .item {
    /* 3. Override with native functions ONLY if supported */
    --index: sibling-index();
    --count: sibling-count();
  }
}
```
