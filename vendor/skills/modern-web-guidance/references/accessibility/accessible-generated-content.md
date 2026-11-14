# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/accessibility/accessible-generated-content.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Accessible generated content

- **DON'T** use `content` to convey meaningful text (labels, state, instructions) — keep that in the DOM (WCAG F87). The alt text argument is harm reduction for cases where decoration accidentally carries meaning, not a license.
- Use the alternative text argument of `content` to provide alt text for screen readers. E.g. `content: url(cloud.svg) / "Save";`
- Use `content: "text" / "";` to prevent purely decorative text from being announced to screen readers.
- **DON'T** use an empty alt text argument for images — they're already presentational by default. E.g. this is wrong: `content: url(cloud.svg) / "";`.
- **DON'T** use the alt text argument to describe emojis unless the description differs from the official emoji name. E.g. don't do `content: "🎉" / "celebration";`, but `content: "🎉" / "Yay!";` is fine.

**ONLY** use the alt text argument when the text is different than the primary value and is not already present in the DOM. I.e. this is wrong:

HTML:
```html
<button class="save">Save</button>
```

CSS:
```css
button.save::before {
  content: url(cloud.svg) / "Save";
}
```

A screen reader would read it out as "Save save".

## Fallback strategies

Baseline status for Alt text for generated content: Newly available. It's been Baseline since 2024-07-09.
Supported by: Chrome 77 (Sep 2019), Edge 79 (Jan 2020), Firefox 128 (Jul 2024), and Safari 17.4 (Mar 2024).

If your Baseline target includes browsers that do not support the `/` alternative text syntax, precede the declaration with a single-value `content` fallback so unsupported browsers do not drop the entire declaration as invalid CSS:

```css
.more-link::after {
  /* Fallback: render the glyph in browsers without `/` support
     (screen readers there will still announce it) */
  content: " →";
  content: " →" / "";
}
```

For non-empty alternative text (`content: url(...) / "..."`), a single-value `content: url(...)` fallback keeps the image visible in older browsers but drops its alt text. If that label is required in older browsers, put it in the DOM instead (e.g., via a visually hidden `<span>` or `aria-label`) and use a plain `content: url(...)` declaration without `/`.
