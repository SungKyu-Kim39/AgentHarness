# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/ui-behaviors/dynamic-sibling-animations.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Creating a stagger animation

Stagger animations provide an interesting effect where multiple ordered elements animate sequentially with a slight delay between each, rather than all animating at once. This technique is often used in lists, galleries, or navigation menus to guide the user's eye and add a polished, rhythmic feel to interactions.

## Stagger animations with `sibling-index()`

Use the `sibling-index()` property on the `animation-delay` property so that the animation on each element is offset by a number proportionate to their position in their parent. The `sibling-index()` function returns an integer, so it must be multiplied by a time unit to convert it to a time.

```css
#stagger-list > .item {
  --stagger-time: 0.1s;
  /* Define the animation first */
  animation: fade-in 0.4s;
  /* Set the `animation-delay` to a time multiplied by the `sibling-index()` */
  animation-delay: calc(sibling-index() * var(--stagger-time))
}
```

**MANDATORY:** Respect user preferences by disabling the animation for users who prefer reduced motion. 

```css
@media (prefers-reduced-motion: reduce){
  /* Disable animation for users who prefer reduced motion. */
  #stagger-list > .item {
    animation: none;
  }
}
```

## Fallback strategies

Baseline status for sibling-count() and sibling-index(): Newly available. It's been Baseline since 2026-08-18.
Supported by: Chrome 138 (Jun 2025), Edge 138 (Jun 2025), Firefox 154 (Aug 2026), and Safari 26.2 (Dec 2025).

Test for support for `sibling-index()` using CSS with `@supports (animation-delay: calc(sibling-index() * 0.1s)){}` or JavaScript with `!CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')`.

To support stagger animations in older browsers, use JavaScript to add a `--sibling-index` custom property to each sibling element. MANDATORY: wrap this in a `CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')` test to avoid running unneeded JavaScript.

```js
if(!CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')){
  const staggerList = document.getElementById('stagger-list');
  [...staggerList.children].forEach((el, index)=>el.style.setProperty('--sibling-index', index + 1));
}
```

Add an `animation-delay` declaration that uses the `--sibling-index` custom property. It must be before the `animation-delay` declaration that uses the `sibling-index()` function. This does not need to be wrapped in `@supports` - older browsers will not parse the second declaration and will use the first declaration.

```css
#stagger-list > .item {
  animation-delay: calc(var(--sibling-index) * var(--stagger-time));
  animation-delay: calc(sibling-index() * var(--stagger-time));
}
```
