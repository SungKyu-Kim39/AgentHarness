// Product guidance only; Codex project .agents/ rules are deliberately unchanged.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const file = "vendor/skills/manifest.json",
  manifest = JSON.parse(await readFile(file));
const adapt = (text) =>
  text
    .replace(/\bspawn agents\b/g, "spawn external agents")
    .replace(/(?<!external )\bagent spawning\b/g, "external agent spawning");
const note =
  "\n## Ned controlled subagents\n\nUpdated by Ned contributors, 2026-11-16. Generic prohibitions now cover external agent installers/runners. Ned’s own spawn_subagent service may delegate bounded research or assigned-file implementation under the parent project and current native permissions. It does not install or execute upstream agents. Child agents cannot delegate, perform builds/Git writes/desktop actions, or answer user decisions. The main agent integrates confirmed results. This changes the host adapter, not the upstream license or provenance.\n";
for (const entry of manifest.skills) {
  entry.adapter = adapt(entry.adapter);
  for (const item of entry.files) {
    const p = path.join("vendor/skills", entry.directory, item.path),
      bytes = await readFile(p);
    if (sha(bytes) !== item.sha256) throw Error("Unreviewed skill bytes: " + p);
    if (!item.path.endsWith(".md")) continue;
    const before = bytes.toString();
    let after = adapt(before);
    if (
      item.path === "ADAPTATION.md" &&
      /external agents|external agent spawning/.test(entry.adapter) &&
      !after.includes("## Ned controlled subagents")
    )
      after += note;
    if (after !== before) {
      const next = Buffer.from(after);
      (entry.adapterUpdates ??= []).push({
        path: item.path,
        previousBundledSha256: item.sha256,
        bundledSha256: sha(next),
        change:
          "Ned host-owned subagents are supported; external agent installers/runners remain excluded.",
      });
      await writeFile(p, next);
      item.sha256 = sha(next);
    }
    const modification = entry.modifications?.find((m) => m.path === item.path);
    if (modification) modification.bundledSha256 = item.sha256;
    // The latest adapter update describes the final distributed bytes, including the notice.
    const latest = entry.adapterUpdates?.findLast((m) => m.path === item.path);
    if (latest) latest.bundledSha256 = item.sha256;
  }
}
const bytes = Buffer.from(JSON.stringify(manifest, null, 2) + "\n");
await writeFile(file, bytes);
const lock = JSON.parse(await readFile("skills-lock.json"));
lock.manifestSha256 = sha(bytes);
await writeFile("skills-lock.json", JSON.stringify(lock, null, 2) + "\n");
