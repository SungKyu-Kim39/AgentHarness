import { createHash, randomUUID } from 'node:crypto';
import { copyFile, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { OwnedCommand } from './owned-command';

const isWin = process.platform === 'win32';
const available = (file: string) => lstat(file).then(s => s.isFile() && !s.isSymbolicLink(), () => false);
const sha = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

export interface DrawioNode {
  id: string;
  label: string;
  group?: string;
  style?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
export interface DrawioEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}
export interface DrawioGroup {
  id: string;
  label: string;
  style?: string;
}
export interface DrawioSpec {
  title?: string;
  direction?: 'LR' | 'TB';
  groups?: DrawioGroup[];
  nodes: DrawioNode[];
  edges?: DrawioEdge[];
}

export interface DiagramInput {
  format: 'drawio' | 'mermaid-svg' | 'mermaid-png';
  outputPath: string;
  source: string | DrawioSpec;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Parses simple Mermaid flowchart syntax into a structured DrawioSpec for automatic .drawio export. */
export function mermaidToDrawioSpec(mermaidText: string): DrawioSpec {
  const nodesMap = new Map<string, DrawioNode>();
  const edges: DrawioEdge[] = [];
  let direction: 'LR' | 'TB' = 'TB';

  const ensureNode = (rawId: string, rawLabel?: string) => {
    const id = rawId.trim();
    if (!id) return '';
    const existing = nodesMap.get(id);
    const label = rawLabel ? rawLabel.replace(/^["'\[({]+|["'\])}]$/g, '').trim() : existing?.label ?? id;
    if (!existing) nodesMap.set(id, { id, label });
    else if (rawLabel) existing.label = label;
    return id;
  };

  for (const rawLine of mermaidText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) continue;
    const dirMatch = /^(?:flowchart|graph)\s+(LR|RL|TB|TD|BT)\b/i.exec(line);
    if (dirMatch) {
      direction = dirMatch[1].toUpperCase() === 'LR' || dirMatch[1].toUpperCase() === 'RL' ? 'LR' : 'TB';
      continue;
    }
    // Edge pattern: A[Label A] -->|edge text| B(Label B)  or  A --> B
    const edgeMatch = /^([A-Za-z0-9_-]+)(?:\s*(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\}))?\s*(-->|-.->|==>)\s*(?:\|([^|]+)\|\s*)?([A-Za-z0-9_-]+)(?:\s*(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\}))?/.exec(line);
    if (edgeMatch) {
      const fromId = ensureNode(edgeMatch[1], edgeMatch[2] || edgeMatch[3] || edgeMatch[4]);
      const arrow = edgeMatch[5];
      const edgeLabel = edgeMatch[6]?.trim();
      const toId = ensureNode(edgeMatch[7], edgeMatch[8] || edgeMatch[9] || edgeMatch[10]);
      if (fromId && toId) edges.push({ from: fromId, to: toId, ...(edgeLabel ? { label: edgeLabel } : {}), dashed: arrow === '-.->' });
      continue;
    }
    const nodeMatch = /^([A-Za-z0-9_-]+)\s*(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})$/.exec(line);
    if (nodeMatch) {
      ensureNode(nodeMatch[1], nodeMatch[2] || nodeMatch[3] || nodeMatch[4]);
    }
  }
  return { direction, nodes: [...nodesMap.values()], edges };
}

/** Generates clean, non-overlapping mxGraph .drawio XML editable in Draw.io Desktop. */
export function buildDrawioXml(spec: DrawioSpec): string {
  const title = spec.title || 'Ned Diagram';
  const direction = spec.direction === 'LR' ? 'LR' : 'TB';
  const nodes = spec.nodes ?? [];
  const edges = spec.edges ?? [];
  const groups = spec.groups ?? [];

  // Compute topological depth for clean layered placement
  const depth = new Map<string, number>();
  for (const n of nodes) depth.set(n.id, 0);
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const e of edges) {
      const fromD = depth.get(e.from) ?? 0;
      const toD = depth.get(e.to) ?? 0;
      if (toD <= fromD && fromD < nodes.length) {
        depth.set(e.to, fromD + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const layers = new Map<number, DrawioNode[]>();
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    const arr = layers.get(d) ?? [];
    arr.push(n);
    layers.set(d, arr);
  }

  const coords = new Map<string, { x: number; y: number; w: number; h: number }>();
  const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
  for (const [layerIdx, items] of sortedLayers) {
    items.forEach((node, idx) => {
      const w = node.width ?? 180;
      const h = node.height ?? 64;
      const x = node.x ?? (direction === 'LR' ? 60 + layerIdx * 240 : 60 + idx * 230);
      const y = node.y ?? (direction === 'LR' ? 60 + idx * 110 : 60 + layerIdx * 130);
      coords.set(node.id, { x, y, w, h });
    });
  }

  const cells: string[] = [
    '        <mxCell id="0"/>',
    '        <mxCell id="1" parent="0"/>',
  ];

  const groupIds = new Map<string, string>();
  let nextCellId = 2;
  for (const group of groups) {
    const memberCoords = nodes.filter(n => n.group === group.id).map(n => coords.get(n.id)!).filter(Boolean);
    if (!memberCoords.length) continue;
    const minX = Math.min(...memberCoords.map(c => c.x)) - 24;
    const minY = Math.min(...memberCoords.map(c => c.y)) - 40;
    const maxX = Math.max(...memberCoords.map(c => c.x + c.w)) + 24;
    const maxY = Math.max(...memberCoords.map(c => c.y + c.h)) + 24;
    const cellId = `g_${nextCellId++}`;
    groupIds.set(group.id, cellId);
    const style = group.style ?? 'rounded=1;whiteSpace=wrap;html=1;dashed=1;fillColor=#f5f5f5;strokeColor=#666666;verticalAlign=top;fontStyle=1;';
    cells.push(
      `        <mxCell id="${cellId}" value="${xmlEscape(group.label)}" style="${xmlEscape(style)}" vertex="1" parent="1">` +
      `<mxGeometry x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" as="geometry"/></mxCell>`,
    );
  }

  const nodeCellIds = new Map<string, string>();
  for (const node of nodes) {
    const pos = coords.get(node.id)!;
    const cellId = `n_${nextCellId++}`;
    nodeCellIds.set(node.id, cellId);
    const style = node.style ?? 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;';
    cells.push(
      `        <mxCell id="${cellId}" value="${xmlEscape(node.label)}" style="${xmlEscape(style)}" vertex="1" parent="1">` +
      `<mxGeometry x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" as="geometry"/></mxCell>`,
    );
  }

  for (const edge of edges) {
    const src = nodeCellIds.get(edge.from);
    const dst = nodeCellIds.get(edge.to);
    if (!src || !dst) continue;
    const cellId = `e_${nextCellId++}`;
    const style = `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;${edge.dashed ? 'dashed=1;' : ''}`;
    cells.push(
      `        <mxCell id="${cellId}" value="${xmlEscape(edge.label ?? '')}" style="${style}" edge="1" parent="1" source="${src}" target="${dst}">` +
      `<mxGeometry relative="1" as="geometry"/></mxCell>`,
    );
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<mxfile host="Ned" modified="${new Date().toISOString()}" version="0.4.0">`,
    `  <diagram id="ned-diagram" name="${xmlEscape(title)}">`,
    '    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200">',
    '      <root>',
    ...cells,
    '      </root>',
    '    </mxGraphModel>',
    '  </diagram>',
    '</mxfile>',
    '',
  ].join('\n');
}

/** Offline .drawio XML generator and isolated headless-browser Mermaid SVG/PNG renderer. */
export class DiagramTools {
  private commands: OwnedCommand;
  private abort = new AbortController();

  constructor(
    private root: string,
    private resources: string,
    private options: {
      approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
      browserExecutable?: string;
      mermaidBundle?: string;
      playwrightNodeDir?: string;
      verifyWorkspaceTools?: () => Promise<void>;
    },
  ) {
    this.commands = new OwnedCommand(resources);
  }

  private browserPath(): string {
    return this.options.browserExecutable ?? path.join(this.resources, 'runtime/windows-x64/mcp/browser/chrome-win64/chrome.exe');
  }

  private mermaidScriptPath(): string {
    return this.options.mermaidBundle ?? path.join(this.resources, 'runtime/windows-x64/workspace-tools/node/node_modules/mermaid/dist/mermaid.min.js');
  }

  private playwrightNodeDir(): string {
    return this.options.playwrightNodeDir ?? path.join(this.resources, 'runtime/windows-x64/mcp/node');
  }

  private async renderMermaidOffline(mermaidCode: string, kind: 'svg' | 'png', work: string, signal: AbortSignal): Promise<Buffer> {
    const mermaidJs = this.mermaidScriptPath();
    const browser = this.browserPath();
    if (!(await available(mermaidJs))) {
      throw new Error('오프라인 Mermaid 번들(mermaid.min.js)을 찾지 못했습니다.');
    }
    if (!(await available(browser))) {
      throw new Error('오프라인 다이어그램 렌더링용 격리 브라우저 번들을 찾지 못했습니다.');
    }
    const htmlFile = path.join(work, 'render.html');
    const runnerFile = path.join(work, 'render.cjs');
    const outFile = path.join(work, kind === 'svg' ? 'diagram.svg' : 'diagram.png');
    const mermaidSource = await readFile(mermaidJs, 'utf8');
    // Inline pinned mermaid.min.js so Chromium makes zero network requests
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>body{margin:16px;background:#ffffff;font-family:"Malgun Gothic","Segoe UI",sans-serif;}</style></head>
<body>
<div id="container"></div>
<script>${mermaidSource}</script>
<script>
window.__renderDiagram = async (code) => {
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
  const { svg } = await mermaid.render('ned_diagram', code);
  document.getElementById('container').innerHTML = svg;
  return svg;
};
</script>
</body></html>`;
    await writeFile(htmlFile, html, 'utf8');
    const runner = `
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const pwPath = path.join(process.env.NED_PW_NODE, 'playwright-core');
const { chromium } = require(pwPath);
(async () => {
  const code = fs.readFileSync(process.env.NED_MERMAID_CODE, 'utf8');
  const browser = await chromium.launch({
    executablePath: process.env.NED_BROWSER,
    headless: true,
    args: ['--disable-gpu', '--disable-background-networking', '--proxy-server=http://127.0.0.1:9'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await page.route('**/*', route => {
      if (route.request().url().startsWith('file://')) return route.continue();
      return route.abort();
    });
    await page.goto(pathToFileURL(process.env.NED_HTML).href, { waitUntil: 'load' });
    const svg = await page.evaluate(c => window.__renderDiagram(c), code);
    if (process.env.NED_KIND === 'svg') {
      fs.writeFileSync(process.env.NED_OUT, svg, 'utf8');
    } else {
      const box = page.locator('#container svg').first();
      await box.screenshot({ path: process.env.NED_OUT, type: 'png' });
    }
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err && err.message || String(err)); process.exit(1); });
`;
    const codeFile = path.join(work, 'diagram.mmd');
    await writeFile(codeFile, mermaidCode, 'utf8');
    await writeFile(runnerFile, runner, 'utf8');

    const env: NodeJS.ProcessEnv = {
      ELECTRON_RUN_AS_NODE: '1',
      NED_PW_NODE: this.playwrightNodeDir(),
      NED_BROWSER: browser,
      NED_HTML: htmlFile,
      NED_MERMAID_CODE: codeFile,
      NED_KIND: kind,
      NED_OUT: outFile,
      TEMP: work,
      TMP: work,
      HOME: work,
      USERPROFILE: work,
    };
    for (const key of ['SystemRoot', 'SYSTEMROOT', 'WINDIR', 'PATH']) if (process.env[key]) env[key] = process.env[key];
    const res = await this.commands.run({ executable: process.execPath, args: [runnerFile], cwd: work, env }, signal, 60000);
    if (res.exitCode !== 0) {
      throw new Error(`오프라인 Mermaid 렌더링 실패: ${res.output.slice(0, 1000)}`);
    }
    return readFile(outFile);
  }

  async generate(session: string, project: string, input: DiagramInput, signal?: AbortSignal) {
    const combined = signal ? AbortSignal.any([signal, this.abort.signal]) : this.abort.signal;
    combined.throwIfAborted();
    await this.options.verifyWorkspaceTools?.();

    const extMap = { drawio: '.drawio', 'mermaid-svg': '.svg', 'mermaid-png': '.png' } as const;
    const expectedExt = extMap[input.format];
    if (path.extname(input.outputPath).toLowerCase() !== expectedExt) {
      throw new Error(`출력 파일 확장자는 ${expectedExt}여야 합니다.`);
    }
    const files = new ProjectFiles(project);
    const targetPath = await files.resolve(input.outputPath, true);

    await mkdir(path.join(this.root, 'diagram-work'), { recursive: true, mode: 0o700 });
    const work = await mkdtemp(path.join(this.root, 'diagram-work/gen-'));
    try {
      let bytes: Buffer;
      if (input.format === 'drawio') {
        const spec = typeof input.source === 'string' ? mermaidToDrawioSpec(input.source) : input.source;
        if (!spec.nodes?.length) throw new Error('다이어그램에 최소 1개 이상의 노드(nodes)가 필요합니다.');
        bytes = Buffer.from(buildDrawioXml(spec), 'utf8');
      } else {
        if (typeof input.source !== 'string' || !input.source.trim()) {
          throw new Error('Mermaid 다이어그램 원문 문자열(source)을 지정하세요.');
        }
        bytes = await this.renderMermaidOffline(input.source, input.format === 'mermaid-svg' ? 'svg' : 'png', work, combined);
      }

      const hash = sha(bytes);
      const existed = await lstat(targetPath).then(s => s.isFile(), () => false);
      const ok = await this.options.approve(
        `다이어그램 파일 ${existed ? '덮어쓰기' : '생성'} 승인: ${input.outputPath}`,
        `프로젝트: ${project}\n형식: ${input.format}\n출력 경로: ${input.outputPath}\n크기: ${bytes.length} bytes\nSHA-256: ${hash}`,
        combined,
      );
      if (!ok) throw new Error('다이어그램 생성을 취소했습니다.');
      combined.throwIfAborted();

      let snapshotId: string | undefined;
      if (existed) {
        snapshotId = randomUUID();
        const snapDir = path.join(this.root, 'snapshots', session);
        await mkdir(snapDir, { recursive: true, mode: 0o700 });
        await copyFile(targetPath, path.join(snapDir, `${snapshotId}${expectedExt}`));
      }
      await mkdir(path.dirname(targetPath), { recursive: true });
      const tmpDest = `${targetPath}.${randomUUID()}.tmp`;
      await writeFile(tmpDest, bytes);
      await rename(tmpDest, targetPath);

      return { status: 'written', format: input.format, path: input.outputPath, bytes: bytes.length, sha256: hash, ...(snapshotId ? { snapshot: snapshotId } : {}) };
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  async close() {
    this.abort.abort();
    await this.commands.close();
  }
}
