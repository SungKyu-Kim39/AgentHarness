import { _electron as electron } from "playwright";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const root = await mkdtemp(path.join(tmpdir(), "l-vibe-ui-"));
const project = path.join(root, "sample-project");
await mkdir(project);
await writeFile(
  path.join(project, "hello.c"),
  "int main(void) { return 0; }\n",
);
let app;
try {
  app = await electron.launch({
    args: [".", "--no-sandbox", "--headless", "--ozone-platform=headless"],
    env: { ...process.env, XDG_CONFIG_HOME: path.join(root, "config") },
    timeout: 30000,
  });
  const page = await app.firstWindow();
  await page.waitForSelector(".welcome h2");
  assert.equal(await page.title(), "L-Vibe");
  assert.equal(await page.evaluate(() => typeof window.require), "undefined");
  assert.equal(await page.evaluate(() => typeof window.process), "undefined");
  const security = await app.evaluate(({ BrowserWindow }) => {
    const p =
      BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
    return {
      sandbox: p.sandbox,
      contextIsolation: p.contextIsolation,
      nodeIntegration: p.nodeIntegration,
    };
  });
  assert.deepEqual(security, {
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
  });
  const malformed = await page.evaluate(() =>
    window.vibe.invoke({ action: "state", apiKey: "not-allowed" }),
  );
  assert.equal(malformed.ok, false);
  await page.getByRole("button", { name: "코드 이해하기" }).click();
  assert.match(
    await page.getByLabel("작업 요청").inputValue(),
    /프로젝트 구조/,
  );
  await page.getByRole("button", { name: "모델 설정", exact: true }).click();
  await page.waitForSelector("[role=dialog]");
  assert.equal(await page.locator("[role=dialog] input").count(), 0);
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await app.evaluate(({ dialog }, folder) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [folder],
    });
  }, project);
  await page
    .getByRole("button", { name: "프로젝트 열기", exact: true })
    .first()
    .click();
  await page.waitForFunction(() =>
    document.querySelector(".file-tree")?.textContent.includes("hello.c"),
  );
  await page.getByRole("button", { name: "hello.c", exact: true }).click();
  await page.waitForSelector(".file-modal pre");
  assert.match(await page.locator(".file-modal pre").innerText(), /return 0/);
  await page.getByRole("button", { name: "파일 닫기" }).click();
  await page.setViewportSize({ width: 1500, height: 960 });
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/l-vibe-desktop.png" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
  );
  console.log(
    "Electron UI passed: isolated preload, IPC validation, project dialog, file read, settings, no horizontal overflow.",
  );
} finally {
  await app?.close();
  await rm(root, { recursive: true, force: true });
}
