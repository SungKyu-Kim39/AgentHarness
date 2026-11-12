# Ned offline adaptation

Upstream: https://github.com/vercel-labs/agent-desktop/tree/2b0a7334fc111730454b726e6800aa41cdafc093/skills/agent-desktop

Original authors: vercel-labs/agent-desktop contributors

Commit: 2b0a7334fc111730454b726e6800aa41cdafc093

License: Apache-2.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under Apache-2.0; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: Use only the Ned desktop_* host tools, never raw CLI/MCP commands. First desktop_status, then explicitly approved desktop_list_windows and desktop_snapshot of one selected window. Each observation/action needs separate native approval; project file auto-approval never applies. Use qualified refs returned in this session. Check state after each action. Do not retry uncertain delivery. Ned/Zed/approval/system/terminal windows, global input, headed coordinates, arbitrary app launch, clipboard, traces and raw batch operations are not exposed. Do not install packages or connect online. Describe unsupported actions as unavailable; never bypass with another executor.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 941873a93fca670fc16362de192521f2b5ca27675fb55f18c2112cde86ca9089; bundled 9238803827fff5ab1ad43c61bdb3684c0b862a870b46340666c91d72e5824649
- references/commands-system.md: upstream 164676e9ffddae0895e86ae1a638edbd0823c7e849ae102ff251d9b957ee60df; bundled 8e9b3d36836a4937c65de97717e3414cf83f28019942b823081010dddf48b1d3
