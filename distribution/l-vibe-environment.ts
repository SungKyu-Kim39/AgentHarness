import { mkdirSync } from "node:fs"
import path from "node:path"

// Called before lazy Desktop/server modules resolve configuration. Native
// credential/provider binding replaces this closed initial configuration later.
// HOME, USERPROFILE and OS ACLs are deliberately left unchanged here.
export function configureLVibeEnvironment(root: string) {
  const runtime = path.join(root, "runtime")
  for (const name of ["config", "data", "cache", "state"])
    mkdirSync(path.join(runtime, name), { recursive: true, mode: 0o700 })

  Object.assign(process.env, {
    XDG_CONFIG_HOME: path.join(runtime, "config"),
    XDG_DATA_HOME: path.join(runtime, "data"),
    XDG_CACHE_HOME: path.join(runtime, "cache"),
    XDG_STATE_HOME: path.join(runtime, "state"),
    OPENCODE_CONFIG_DIR: path.join(runtime, "config", "opencode"),
    OPENCODE_CONFIG_CONTENT: JSON.stringify({
      update: "disable",
      share: "disabled",
      warming: false,
      plugins: [],
      skills: [],
      permissions: [{ action: "*", resource: "*", effect: "deny" }],
      policies: [
        { action: "provider.use", resource: "*", effect: "deny" },
        { action: "integration.connect", resource: "*", effect: "deny" },
        { action: "integration.use", resource: "*", effect: "deny" },
        { action: "plugin.use", resource: "*", effect: "deny" },
        { action: "mcp.use", resource: "*", effect: "deny" },
        { action: "skill.use", resource: "*", effect: "deny" },
        { action: "websearch.use", resource: "*", effect: "deny" },
      ],
    }),
    OPENCODE_DISABLE_MODELS_FETCH: "1",
    OPENCODE_CONFIG_PROJECT_DISABLE: "1",
    OPENCODE_DISABLE_CLAUDE_CODE: "1",
    OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: "1",
    OPENCODE_DISABLE_EMBEDDED_WEB_UI: "1",
    DO_NOT_TRACK: "1",
    OTEL_SDK_DISABLED: "true",
  })
  delete process.env.OPENCODE_CONFIG
  delete process.env.OPENCODE_PERMISSION
  delete process.env.OPENCODE_SERVER_CHANNEL
  delete process.env.OPENCODE_PTY_HANDOFF
}
