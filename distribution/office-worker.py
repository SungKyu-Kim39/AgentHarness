"""Offline Office (XLSX, DOCX, PPTX) generation & PDF table extraction worker.

Uses pinned MIT libraries (openpyxl, python-docx, python-pptx, pdfplumber) in an isolated
directory with sys.addaudithook blocking network access, subprocess spawning, and writes
outside the host-assigned temporary work directory.
"""
import json
import os
from pathlib import Path
import sys


def _install_audit_hook(allowed_read, work):
    def inside(file, roots):
        if isinstance(file, int) or file == os.devnull:
            return True
        try:
            p = Path(os.fsdecode(file)).resolve()
            return any(p == root or root in p.parents for root in roots)
        except Exception:
            return False

    def audit(event, args):
        if event == 'open':
            file, mode, flags = args
            writing = (isinstance(mode, str) and any(c in mode for c in 'wax+')) or (
                isinstance(flags, int) and bool(flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND))
            )
            if not inside(file, [work] if writing else allowed_read):
                raise PermissionError('Office worker file access outside work directory blocked')
        elif event in ('os.remove', 'os.rmdir', 'os.mkdir', 'os.rename', 'os.link', 'os.symlink'):
            if not inside(args[0], [work]):
                raise PermissionError('Office worker filesystem mutation outside work blocked')
        elif event in ('socket.connect', 'socket.connect_ex', 'socket.getaddrinfo', 'socket.gethostbyname', 'socket.sendto'):
            raise PermissionError('Network disabled for offline office worker')
        elif event in ('os.system', 'os.exec', 'os.fork', 'pty.spawn', 'subprocess.Popen', 'os.posix_spawn'):
            raise PermissionError('Subprocess creation disabled for offline office worker')

    sys.addaudithook(audit)


def _parse_page_ranges(pages_str: str | None, total: int):
    if not pages_str:
        return list(range(1, min(total, 50) + 1))
    chosen = []
    for part in pages_str.split(','):
        part = part.strip()
        if not part:
            continue
        if '-' in part:
            a, b = part.split('-', 1)
            start = max(1, int(a.strip()))
            end = min(total, int(b.strip()))
            chosen.extend(range(start, end + 1))
        else:
            num = int(part)
            if 1 <= num <= total:
                chosen.append(num)
    return sorted(set(chosen))[:50]


def _read_pdf_tables(config: dict):
    import pdfplumber  # type: ignore

    pdf_path = Path(config['input']).resolve(strict=True)
    pages_out = []
    total_tables = 0
    with pdfplumber.open(str(pdf_path)) as pdf:
        total_pages = len(pdf.pages)
        selected = _parse_page_ranges(config.get('pages'), total_pages)
        for pno in selected:
            page = pdf.pages[pno - 1]
            raw_tables = page.extract_tables() or []
            cleaned_tables = []
            for tbl in raw_tables:
                rows = [[(cell or '').strip() for cell in row] for row in tbl if row]
                if rows:
                    cleaned_tables.append(rows)
                    total_tables += 1
            text_excerpt = (page.extract_text() or '').strip()[:2000]
            pages_out.append({
                'page': pno,
                'tableCount': len(cleaned_tables),
                'tables': cleaned_tables,
                'textPreview': text_excerpt,
            })
    return {
        'status': 'ok',
        'engine': 'pdfplumber',
        'totalPages': total_pages,
        'extractedPages': len(pages_out),
        'totalTables': total_tables,
        'pages': pages_out,
    }


def _write_xlsx(config: dict):
    import openpyxl  # type: ignore
    from openpyxl.styles import Alignment, Font, PatternFill  # type: ignore
    from openpyxl.chart import BarChart, LineChart, PieChart, Reference  # type: ignore

    spec = config['spec']
    template = config.get('template')
    output = Path(config['output'])

    if template:
        wb = openpyxl.load_workbook(template)
    else:
        wb = openpyxl.Workbook()
        if wb.active and spec.get('sheets'):
            wb.remove(wb.active)

    header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
    header_font = Font(bold=True, color='FFFFFF')

    for sheet_spec in spec.get('sheets', []):
        name = str(sheet_spec.get('name') or 'Sheet1')[:31]
        ws = wb[name] if name in wb.sheetnames else wb.create_sheet(title=name)
        headers = sheet_spec.get('headers') or []
        if headers:
            ws.append(headers)
            for col_idx in range(1, len(headers) + 1):
                cell = ws.cell(row=ws.max_row, column=col_idx)
                cell.fill = header_fill
                cell.font = header_font
                cell.alignment = Alignment(horizontal='center', vertical='center')
            ws.freeze_panes = 'A2'
        for row in sheet_spec.get('rows', []):
            ws.append(row)
        for cell_ref, val in (sheet_spec.get('cells') or {}).items():
            ws[str(cell_ref)] = val
        # Auto-fit reasonable column widths
        for col in ws.columns:
            max_len = 0
            col_letter = col[0].column_letter
            for cell in col:
                val = '' if cell.value is None else str(cell.value)
                max_len = max(max_len, len(val))
            ws.column_dimensions[col_letter].width = min(max(max_len + 4, 10), 48)
        for chart_spec in sheet_spec.get('charts', []):
            ctype = str(chart_spec.get('type', 'bar')).lower()
            chart = LineChart() if ctype == 'line' else PieChart() if ctype == 'pie' else BarChart()
            chart.title = str(chart_spec.get('title') or '')
            min_col = int(chart_spec.get('dataMinCol', 2))
            max_col = int(chart_spec.get('dataMaxCol', max(min_col, ws.max_column)))
            min_row = int(chart_spec.get('dataMinRow', 1))
            max_row = int(chart_spec.get('dataMaxRow', ws.max_row))
            data = Reference(ws, min_col=min_col, max_col=max_col, min_row=min_row, max_row=max_row)
            chart.add_data(data, titles_from_data=True)
            if ws.max_row >= 2:
                cats = Reference(ws, min_col=int(chart_spec.get('categoryCol', 1)), min_row=min_row + 1, max_row=max_row)
                chart.set_categories(cats)
            ws.add_chart(chart, str(chart_spec.get('anchor') or 'F2'))

    if not wb.sheetnames:
        wb.create_sheet(title='Sheet1')
    output.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(output))
    return {'status': 'ok', 'format': 'xlsx', 'sheets': wb.sheetnames, 'bytes': output.stat().st_size}


def _replace_placeholders_in_paragraph(paragraph, replacements: dict):
    full = paragraph.text
    updated = full
    for key, val in replacements.items():
        token = '{{' + str(key) + '}}'
        if token in updated:
            updated = updated.replace(token, str(val))
    if updated != full:
        if paragraph.runs:
            paragraph.runs[0].text = updated
            for run in paragraph.runs[1:]:
                run.text = ''
        else:
            paragraph.text = updated


def _write_docx(config: dict):
    import docx  # type: ignore
    from docx.shared import Inches  # type: ignore

    spec = config['spec']
    template = config.get('template')
    images_map = config.get('images') or {}
    output = Path(config['output'])

    doc = docx.Document(template) if template else docx.Document()

    replacements = spec.get('replacements') or {}
    if replacements:
        for p in doc.paragraphs:
            _replace_placeholders_in_paragraph(p, replacements)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for p in cell.paragraphs:
                        _replace_placeholders_in_paragraph(p, replacements)
        for section in doc.sections:
            for p in section.header.paragraphs:
                _replace_placeholders_in_paragraph(p, replacements)
            for p in section.footer.paragraphs:
                _replace_placeholders_in_paragraph(p, replacements)

    if spec.get('title'):
        doc.add_heading(str(spec['title']), level=0)
    if spec.get('subtitle'):
        doc.add_paragraph(str(spec['subtitle']))

    for block in spec.get('blocks', []):
        btype = block.get('type', 'paragraph')
        if btype == 'heading':
            doc.add_heading(str(block.get('text', '')), level=min(4, max(1, int(block.get('level', 1)))))
        elif btype == 'paragraph':
            doc.add_paragraph(str(block.get('text', '')))
        elif btype == 'bullets':
            for item in block.get('items', []):
                doc.add_paragraph(str(item), style='List Bullet')
        elif btype == 'table':
            headers = block.get('headers') or []
            rows = block.get('rows') or []
            cols = max(len(headers), max((len(r) for r in rows), default=0))
            if cols > 0:
                table = doc.add_table(rows=(1 if headers else 0) + len(rows), cols=cols)
                table.style = 'Table Grid'
                row_offset = 0
                if headers:
                    for idx, h in enumerate(headers):
                        table.rows[0].cells[idx].text = str(h)
                    row_offset = 1
                for r_idx, row in enumerate(rows):
                    for c_idx, val in enumerate(row[:cols]):
                        table.rows[row_offset + r_idx].cells[c_idx].text = str(val)
        elif btype == 'image':
            ref = str(block.get('path', ''))
            staged = images_map.get(ref)
            if staged and Path(staged).is_file():
                width = float(block.get('widthInches', 5.5))
                doc.add_picture(staged, width=Inches(min(max(width, 1.0), 6.5)))

    output.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(output))
    return {'status': 'ok', 'format': 'docx', 'paragraphs': len(doc.paragraphs), 'tables': len(doc.tables), 'bytes': output.stat().st_size}


def _write_pptx(config: dict):
    from pptx import Presentation  # type: ignore
    from pptx.util import Inches, Pt  # type: ignore

    spec = config['spec']
    template = config.get('template')
    images_map = config.get('images') or {}
    output = Path(config['output'])

    prs = Presentation(template) if template else Presentation()
    if not template:
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)

    for idx, s_spec in enumerate(spec.get('slides', [])):
        layout_idx = int(s_spec.get('layout', 0 if idx == 0 and not s_spec.get('bullets') and not s_spec.get('table') else 1))
        layout_idx = min(max(layout_idx, 0), len(prs.slide_layouts) - 1)
        slide = prs.slides.add_slide(prs.slide_layouts[layout_idx])
        if slide.shapes.title and s_spec.get('title'):
            slide.shapes.title.text = str(s_spec['title'])
        body_placeholder = None
        for ph in slide.placeholders:
            if ph.placeholder_format.idx == 1:
                body_placeholder = ph
                break
        if s_spec.get('subtitle') and body_placeholder is not None and not s_spec.get('bullets'):
            body_placeholder.text = str(s_spec['subtitle'])
        if s_spec.get('bullets') and body_placeholder is not None:
            tf = body_placeholder.text_frame
            tf.clear()
            for b_idx, item in enumerate(s_spec['bullets']):
                p = tf.paragraphs[0] if b_idx == 0 else tf.add_paragraph()
                p.text = str(item)
                p.level = 0
                p.font.size = Pt(18)
        if s_spec.get('table'):
            tbl_spec = s_spec['table']
            headers = tbl_spec.get('headers') or []
            rows = tbl_spec.get('rows') or []
            cols = max(len(headers), max((len(r) for r in rows), default=0))
            total_rows = (1 if headers else 0) + len(rows)
            if cols > 0 and total_rows > 0:
                shape = slide.shapes.add_table(total_rows, cols, Inches(0.8), Inches(2.0), Inches(11.5), Inches(4.2))
                table = shape.table
                offset = 0
                if headers:
                    for c_idx, h in enumerate(headers):
                        table.cell(0, c_idx).text = str(h)
                    offset = 1
                for r_idx, row in enumerate(rows):
                    for c_idx, val in enumerate(row[:cols]):
                        table.cell(offset + r_idx, c_idx).text = str(val)
        if s_spec.get('image'):
            img_ref = str(s_spec['image'])
            staged = images_map.get(img_ref)
            if staged and Path(staged).is_file():
                slide.shapes.add_picture(staged, Inches(1.0), Inches(1.8), width=Inches(10.5))
        if s_spec.get('notes'):
            slide.notes_slide.notes_text_frame.text = str(s_spec['notes'])

    output.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(output))
    return {'status': 'ok', 'format': 'pptx', 'slides': len(prs.slides), 'bytes': output.stat().st_size}


def main():
    config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    work = Path(config['work']).resolve(strict=True)
    site_dirs = [Path(s).resolve() for s in (config.get('sites') or []) if Path(s).is_dir()]
    for s in reversed(site_dirs):
        sys.path.insert(0, str(s))
    allowed_read = [work, *site_dirs, Path(sys.base_prefix).resolve(), Path(sys.prefix).resolve()]
    _install_audit_hook(allowed_read, work)

    action = config['action']
    if action == 'read_pdf_tables':
        result = _read_pdf_tables(config)
    elif action == 'write_xlsx':
        result = _write_xlsx(config)
    elif action == 'write_docx':
        result = _write_docx(config)
    elif action == 'write_pptx':
        result = _write_pptx(config)
    else:
        result = {'status': 'error', 'error': f'Unsupported action: {action}'}
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
