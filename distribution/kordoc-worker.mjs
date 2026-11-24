// Offline HWP/HWPX worker backed by pinned kordoc (MIT) with pure-ZIP XML fallback for HWPX.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const reqFile = process.argv[2];
if (!reqFile) throw new Error('Missing request file');
const config = JSON.parse(await readFile(reqFile, 'utf8'));

async function loadKordoc() {
  if (!config.nodeDir) return undefined;
  const candidates = [
    path.join(config.nodeDir, 'node_modules/kordoc/dist/index.js'),
    path.join(config.nodeDir, 'kordoc/dist/index.js'),
  ];
  for (const entry of candidates) {
    try {
      return await import(pathToFileURL(entry).href);
    } catch {}
  }
  return undefined;
}

function toBuffer(val) {
  if (Buffer.isBuffer(val)) return val;
  if (val instanceof ArrayBuffer) return Buffer.from(new Uint8Array(val));
  if (ArrayBuffer.isView(val)) return Buffer.from(val.buffer, val.byteOffset, val.byteLength);
  return Buffer.from(val);
}

function extractHwpxTextFallback(filePath) {
  const py = `
import json, re, sys, zipfile
from xml.etree import ElementTree as ET
with zipfile.ZipFile(sys.argv[1]) as z:
    sections = sorted(n for n in z.namelist() if re.match(r'^Contents/section\\d+\\.xml$', n))
    paras = []
    for name in sections:
        root = ET.fromstring(z.read(name))
        for elem in root.iter():
            if elem.tag.endswith('}p') or elem.tag == 'p':
                texts = [t.text for t in elem.iter() if (t.tag.endswith('}t') or t.tag == 't') and t.text]
                if texts:
                    paras.append(''.join(texts))
    print(json.dumps({'markdown': '\\n\\n'.join(paras), 'sections': len(sections)}, ensure_ascii=False))
`;
  const out = execFileSync(config.python || 'python3', ['-I', '-c', py, filePath], { encoding: 'utf8' });
  return JSON.parse(out);
}

function writeHwpxFallback(reqPath) {
  const py = `
import json, sys, zipfile
from pathlib import Path
req = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
tpl = req.get('template')
out = Path(req['output'])
spec = req.get('spec') or {}
out.parent.mkdir(parents=True, exist_ok=True)
if tpl:
    replacements = spec.get('replacements') or {}
    with zipfile.ZipFile(tpl, 'r') as zin, zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.startswith('Contents/section') and item.filename.endswith('.xml'):
                text = data.decode('utf-8', errors='replace')
                for k, v in replacements.items():
                    esc = str(v).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
                    text = text.replace('{{' + str(k) + '}}', esc)
                data = text.encode('utf-8')
            zout.writestr(item, data)
    print(json.dumps({'status': 'ok', 'engine': 'hwpx-template-fallback', 'bytes': out.stat().st_size}))
else:
    lines = []
    if spec.get('title'): lines.append(str(spec['title']))
    if spec.get('markdown'):
        lines.extend([l.lstrip('# ').strip() for l in str(spec['markdown']).splitlines() if l.strip()])
    for p in spec.get('paragraphs') or []:
        lines.append(str(p))
    esc = lambda s: s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    p_xml = ''.join(f'<hp:p><hp:run><hp:t>{esc(line)}</hp:t></hp:run></hp:p>' for line in (lines or ['']))
    section_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><hs:sec xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section">' + p_xml + '</hs:sec>'
    content_hpf = '<?xml version="1.0" encoding="UTF-8"?><opf:package xmlns:opf="http://www.idpf.org/2007/opf/"><opf:manifest><opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/></opf:manifest></opf:package>'
    version_xml = '<?xml version="1.0" encoding="UTF-8"?><hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" major="5" minor="0"/>'
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zout:
        zout.writestr('mimetype', 'application/hwp+zip', compress_type=zipfile.ZIP_STORED)
        zout.writestr('version.xml', version_xml)
        zout.writestr('Contents/content.hpf', content_hpf)
        zout.writestr('Contents/section0.xml', section_xml)
    print(json.dumps({'status': 'ok', 'engine': 'hwpx-minimal-fallback', 'bytes': out.stat().st_size}))
`;
  const out = execFileSync(config.python || 'python3', ['-I', '-c', py, reqPath], { encoding: 'utf8' });
  return JSON.parse(out);
}

const kordoc = await loadKordoc();

if (config.action === 'read') {
  const inputPath = config.input;
  if (kordoc && typeof kordoc.parse === 'function') {
    const buf = await readFile(inputPath);
    const res = await kordoc.parse(buf, { ocr: false });
    const markdown = typeof res === 'string' ? res : res?.markdown ?? res?.text ?? JSON.stringify(res);
    console.log(JSON.stringify({ status: 'ok', engine: 'kordoc', format: res?.format, markdown: String(markdown).slice(0, 120000) }));
  } else if (inputPath.toLowerCase().endsWith('.hwpx')) {
    const res = extractHwpxTextFallback(inputPath);
    console.log(JSON.stringify({ status: 'ok', engine: 'hwpx-xml-fallback', markdown: res.markdown.slice(0, 120000), sections: res.sections }));
  } else {
    throw new Error('바이너리 .hwp 읽기를 위한 kordoc 런타임이 준비되지 않았습니다.');
  }
} else if (config.action === 'write') {
  const { template, output, spec } = config;
  await mkdir(path.dirname(output), { recursive: true });
  if (kordoc && !template && typeof kordoc.markdownToHwpx === 'function') {
    const md = spec.markdown || [spec.title ? `# ${spec.title}` : '', ...(spec.paragraphs || [])].filter(Boolean).join('\n\n');
    const ab = await kordoc.markdownToHwpx(md, { title: spec.title });
    const buf = toBuffer(ab);
    await writeFile(output, buf);
    console.log(JSON.stringify({ status: 'ok', format: 'hwpx', engine: 'kordoc', bytes: buf.length }));
  } else if (kordoc && template && typeof kordoc.fillHwpx === 'function' && spec.fields && !spec.replacements) {
    const tplBuf = await readFile(template);
    const ab = tplBuf.buffer.slice(tplBuf.byteOffset, tplBuf.byteOffset + tplBuf.byteLength);
    const res = await kordoc.fillHwpx(ab, spec.fields);
    const buf = toBuffer(res.buffer);
    await writeFile(output, buf);
    console.log(JSON.stringify({ status: 'ok', format: 'hwpx', engine: 'kordoc-fill', bytes: buf.length, filled: res.filled?.length ?? 0, unmatched: res.unmatched ?? [] }));
  } else {
    const res = writeHwpxFallback(reqFile);
    console.log(JSON.stringify({ ...res, format: 'hwpx' }));
  }
} else {
  throw new Error('Unsupported kordoc action: ' + config.action);
}
