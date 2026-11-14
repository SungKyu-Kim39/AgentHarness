# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/webmcp/webmcp.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# WebMCP

WebMCP is a browser-native JavaScript API that allows web pages to expose their client-side functionality as structured "tools" to AI agents, browser assistants, and assistive technologies. 

IMPORTANT: WebMCP is currently in Early Preview on Chromium-based browsers (such as Chrome and Edge). It requires Chromium version `146.0.7672.0` or higher and the `#enable-webmcp-testing` flag.

**Crucial Distinction:** WebMCP runs entirely **client-side** in the browser tab. It is *not* a backend server, and it does *not* use HTTP, Server-Sent Events (SSE), or `stdio` transports. The web page itself acts as the tool registry.

Currently, WebMCP **only supports Tools**. It does not support the "Resources" or "Prompts" primitives found in the backend Model Context Protocol.

## Quick Overview

- **Imperative API**: Use `document.modelContext.registerTool()` for complex logic and dynamic interactions.
- **Declarative API**: Annotate standard HTML `<form>` elements with `toolname` and `tooldescription` to turn them into tools.
- **Frameworks (MANDATORY)**: React uses `useWebMCP` from `use-webmcp-tool`. Angular uses `provideExperimentalWebMcpTools` / `declareExperimentalWebMcpTool` from `@angular/core`. Vue uses `useWebMCP` from `@vueuse/core`. **DO NOT** call `registerTool()` from components.

## Best Practices

* **Naming and Semantics**: Use specific verbs describing exact behavior (e.g. `create-event` vs `start-event-creation-process`). Favor positive descriptions over listing limitations.
* **Descriptions**: Say what the tool does and when to use it. Do not repeat parameter names, types, enum values, defaults, or limits: the agent already receives them in the input schema (your `inputSchema`, or the one the browser builds from a form's controls). Put those details in the schema, and explain a non-obvious value in that parameter's own description.
* **Schema Design**: Accept raw user input (avoid agent math/calculation). Ensure all parameters have specific types and explain the purpose of options.
* **Reliability**: Validate constraints in code and return descriptive errors for retries. Handle rate limiting gracefully. Ensure the function returns *after* UI state updates for consistency.
* **Tool Strategy**: Tools should be atomic, composable, and distinct. Do not force flow control instructions ("Don't call B after A") — let the agent decide. Register/unregister tools dynamically depending on the current page context. Use `annotations: { readOnlyHint: true }` (placed after `execute`) for tools that do not modify state to inform the agent of safe execution.
* **Clean Up**: Always use `AbortSignal` to unregister tools when pages transition or resources are released to avoid leaks and collisions. Do not use `unregisterTool`.
* **Web Development Best Practices**: WebMCP tools run as client-side JavaScript in the browser tab. They must adhere to regular web development best practices (e.g., keeping secrets out of client-side code, accessing backend databases through secure API layers, and using Web Workers, WASM, or WebGPU for heavy compute).

### When to Discourage WebMCP
* **High-Risk Actions without Guardrails**: Avoid auto-submitting tools for destructive or irreversible actions (e.g., deleting data) unless the UI requires manual user confirmation outside the agent's control.
* **Hyper-Dynamic State**: If data changes faster than the agent can react, it may work with stale context.

### Anti-Patterns & Warnings (DO NOT DO THIS)

* **Do not use backend transports.** WebMCP is for browser tabs, not Node.js background processes.
* **Do not include Resources or Prompts.** These are not supported in the current WebMCP spec.
* **Do not ignore `inputSchema` structure.** Always provide clear descriptions for every parameter to minimize agent hallucinations.
* **Do not use outside of a Secure Context (HTTPS).**

## Implementation Status

WebMCP is currently in early preview in Chromium-based browsers (e.g., Chrome, Edge):

* **Current Status**: Early preview.
* **Required Version**: Chromium `146.0.7672.0` or higher.
* **Activation**: Requires enabling the flag `chrome://flags/#enable-webmcp-testing` or `edge://flags/#enable-webmcp-testing`.
* **Specification**: Evolving [Draft Community Group specification](https://webmachinelearning.github.io/webmcp/); not yet a standards-track recommendation.
