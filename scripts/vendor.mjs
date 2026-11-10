// Build-machine only. No downloader is shipped as an employee-PC app feature.
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  cp,
  chmod,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
const digest = (bytes, algorithm = "sha256", encoding = "hex") =>
  createHash(algorithm).update(bytes).digest(encoding);
const lock = JSON.parse(await readFile("vendor-lock.json", "utf8"));
const mode = process.argv[2];
async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
async function tree(root) {
  const results = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`번들 심볼릭 링크 차단: ${file}`);
    if (entry.isDirectory()) results.push(...(await tree(file)));
    else results.push(file);
  }
  return results;
}
if (mode === "fetch") {
  await mkdir(".cache/vendor", { recursive: true });
  await mkdir("vendor/runtime", { recursive: true });
  const wrapper = JSON.parse(
    (
      await download("https://registry.npmjs.org/opencode-ai/1.19.5")
    ).toString(),
  );
  const license = await download(
    "https://raw.githubusercontent.com/anomalyco/opencode/v1.19.5/LICENSE",
  );
  await writeFile("vendor/LICENSE.OpenCode.txt", license);
  lock.opencodeLicense = {
    license: wrapper.license,
    sha256: digest(license),
    source:
      "https://raw.githubusercontent.com/anomalyco/opencode/v1.19.5/LICENSE",
  };
  const files = [];
  const notices = [
    "# L-Vibe bundled third-party components",
    "",
    "Build artifacts are pinned here and in package-lock.json. Employee PCs do not install packages.",
    "",
  ];
  for (const item of lock.runtimes) {
    const metadata = JSON.parse(
      (
        await download(
          `https://registry.npmjs.org/${item.name}/${item.version}`,
        )
      ).toString(),
    );
    const bytes = await download(metadata.dist.tarball);
    const [algorithm, expected] = metadata.dist.integrity.split("-");
    if (digest(bytes, algorithm, "base64") !== expected)
      throw new Error(`${item.name}: npm integrity mismatch`);
    if (item.archiveSha256 && item.archiveSha256 !== digest(bytes))
      throw new Error(`${item.name}: locked archive changed`);
    item.archiveSha256 = digest(bytes);
    item.integrity = metadata.dist.integrity;
    item.license = metadata.license ?? wrapper.license;
    const archive = `.cache/vendor/${item.name}.tgz`;
    const extracted = `.cache/vendor/${item.name}`;
    await writeFile(archive, bytes);
    await mkdir(extracted, { recursive: true });
    execFileSync("tar", [
      "-xzf",
      archive,
      "--strip-components=1",
      "-C",
      extracted,
    ]);
    const binary = (await tree(extracted)).find(
      (f) => path.basename(f) === item.executable,
    );
    if (!binary) throw new Error(`${item.name}: executable not found`);
    const destination = `vendor/runtime/${item.platform}`;
    await mkdir(destination, { recursive: true });
    // Keep companion native libraries, if this distribution has them.
    for (const file of await tree(path.dirname(binary))) {
      const relative = path.relative(path.dirname(binary), file);
      const target = path.join(destination, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await cp(file, target);
      files.push({
        path: `${item.platform}/${relative.split(path.sep).join("/")}`,
        sha256: digest(await readFile(target)),
      });
    }
    if (item.platform === "linux-x64")
      await chmod(`${destination}/${item.executable}`, 0o755);
    notices.push(
      `- ${item.name} ${item.version}: ${item.license}; https://github.com/anomalyco/opencode; license text: LICENSE.OpenCode.txt`,
    );
    console.log(`Pinned ${item.name} ${item.version}`);
  }
  for (const source of lock.sources) {
    const repo = new URL(source.repository).pathname.slice(1);
    const bytes = await download(
      `https://codeload.github.com/${repo}/tar.gz/${source.commit}`,
    );
    if (source.archiveSha256 && source.archiveSha256 !== digest(bytes))
      throw new Error(`${source.name}: locked source changed`);
    source.archiveSha256 = digest(bytes);
    const archive = `.cache/vendor/${source.name}.tgz`;
    const destination = `vendor/sources/${source.name}`;
    await writeFile(archive, bytes);
    await mkdir(destination, { recursive: true });
    execFileSync("tar", [
      "-xzf",
      archive,
      "--strip-components=1",
      "-C",
      destination,
    ]);
    source.licenses = [];
    for (const file of await tree(destination))
      if (/^(LICENSE|COPYING|NOTICE)/i.test(path.basename(file)))
        source.licenses.push({
          path: path.relative(destination, file),
          sha256: digest(await readFile(file)),
        });
    notices.push(
      `- ${source.name}: ${source.repository}/tree/${source.commit}; license files: ${source.licenses.map((x) => x.path).join(", ") || "REVIEW REQUIRED"}; ${source.usage}`,
    );
    console.log(`Pinned ${source.name} ${source.commit}`);
  }
  const sources = [];
  for (const file of await tree("vendor/sources"))
    sources.push({
      path: path.relative("vendor/sources", file).split(path.sep).join("/"),
      sha256: digest(await readFile(file)),
    });
  lock.sourceFiles = sources;
  await writeFile(
    "vendor/runtime/manifest.json",
    JSON.stringify({ schemaVersion: 1, files }, null, 2),
  );
  lock.runtimeFiles = files;
  await writeFile("vendor-lock.json", JSON.stringify(lock, null, 2) + "\n");
  await writeFile("vendor/THIRD_PARTY_NOTICES.md", notices.join("\n") + "\n");
} else if (mode === "verify") {
  if (!lock.runtimeFiles?.length || !lock.sourceFiles?.length)
    throw new Error("번들 확보가 필요합니다: npm run vendor:fetch");
  const manifest = JSON.parse(
    await readFile("vendor/runtime/manifest.json", "utf8"),
  );
  if (
    !lock.opencodeLicense ||
    digest(await readFile("vendor/LICENSE.OpenCode.txt")) !==
      lock.opencodeLicense.sha256
  )
    throw new Error("OpenCode license hash mismatch");
  if (JSON.stringify(manifest.files) !== JSON.stringify(lock.runtimeFiles))
    throw new Error("runtime manifest differs from lock");
  for (const item of lock.runtimeFiles)
    if (digest(await readFile(`vendor/runtime/${item.path}`)) !== item.sha256)
      throw new Error(`런타임 해시 불일치: ${item.path}`);
  for (const item of lock.sourceFiles)
    if (digest(await readFile(`vendor/sources/${item.path}`)) !== item.sha256)
      throw new Error(`원본 해시 불일치: ${item.path}`);
  console.log(
    `Verified ${lock.runtimeFiles.length} runtime files, ${lock.sourceFiles.length} source files. Release level: ${lock.releaseLevel}`,
  );
} else throw new Error("Usage: node scripts/vendor.mjs fetch|verify");
