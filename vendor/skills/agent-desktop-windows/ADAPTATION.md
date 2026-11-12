# Ned offline adaptation

Upstream: https://github.com/vercel-labs/agent-desktop/tree/2b0a7334fc111730454b726e6800aa41cdafc093/skills/agent-desktop-windows

Original authors: vercel-labs/agent-desktop contributors

Commit: 2b0a7334fc111730454b726e6800aa41cdafc093

License: Apache-2.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under Apache-2.0; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: The bundled native Windows UIA runtime requires an interactive desktop. UAC secure desktop, locked sessions and elevated apps are not supported. The Ned host exposes only approved window-scoped semantic tools; raw CLI examples below are reference syntax, not executable permission. No automatic headed/global-input fallback, force, terminal commands, arbitrary app launch or self-approval. Never modify managed Ned/Zed settings through desktop automation. Inspect actual capabilities and report failed/unexecuted verification accurately.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 6d1ce79a23caf84a5ef75695a4896a1b8bdde7d2b4ff55a655c20118b38e189c; bundled 84f2ed29be90fd4389b9b74c7b1e1909be11f419260238e2ed6a37f27ff5b59b
