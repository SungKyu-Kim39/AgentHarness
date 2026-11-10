// Private, fixed entry point. The host never passes model-selected executable,
// browser flags, profile paths, JavaScript or MCP method names to this worker.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.chdir(config.work);
Object.assign(process.env, {
  HOME: config.work, USERPROFILE: config.work, APPDATA: config.work,
  LOCALAPPDATA: config.work, XDG_CONFIG_HOME: config.work, XDG_CACHE_HOME: config.work,
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1', PLAYWRIGHT_BROWSERS_PATH: '0',
  CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS: '1', DO_NOT_TRACK: '1',
});
const flags = [
  '--proxy-server=' + config.proxy, '--proxy-bypass-list=<-loopback>',
  '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost', '--disable-quic',
  '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
  '--disable-background-networking', '--disable-component-update', '--disable-sync',
  '--disable-default-apps', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-breakpad', '--disable-domain-reliability',
  '--disable-features=MediaRouter,OptimizationHints,AutofillServerCommunication,CertificateTransparencyComponentUpdater',
  '--auth-server-allowlist=', '--auth-negotiate-delegate-allowlist=',
];
if (config.testNoSandbox && process.platform === 'linux') flags.push('--no-sandbox');
if (config.service === 'playwright') {
  const file = path.join(config.work, 'playwright.json');
  fs.writeFileSync(file, JSON.stringify({
    browser: { browserName: 'chromium', isolated: true, launchOptions: { executablePath: config.browser, headless: true, args: flags, chromiumSandbox: !config.testNoSandbox }, contextOptions: { acceptDownloads: false, serviceWorkers: 'block', viewport: { width: 1280, height: 800 } } },
    webmcp: false, capabilities: ['core'], saveSession: false,
    outputDir: path.join(config.work, 'output'), outputMaxSize: 8 * 1024 * 1024,
    network: { allowedOrigins: [config.origin] }, timeouts: { navigation: 15000, action: 5000 },
  }));
  process.argv = [process.execPath, path.join(config.node, '@playwright/mcp/cli.js'), '--config', file];
  require(process.argv[1]);
} else if (config.service === 'devtools') {
  const entry = path.join(config.node, 'chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js');
  process.argv = [process.execPath, entry, '--headless', '--isolated', '--no-page-id-routing', '--no-usage-statistics', '--no-performance-crux', '--no-javascript-evaluation', '--no-file-navigations', '--no-category-webmcp', '--no-category-third-party', '--no-category-extensions', '--executable-path=' + config.browser, ...flags.map(flag => '--chrome-arg=' + flag)];
  import(pathToFileURL(entry).href).catch(() => { console.error('Pinned DevTools worker failed'); process.exitCode = 1; });
} else throw new Error('Unknown pinned browser service');
