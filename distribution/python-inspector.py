"""Offline Python package API & docstring inspector (local Context7 equivalent).

Reads installed distribution metadata and parses .py/.pyi files statically via Python AST
without importing third-party packages or executing their startup code.
"""
import ast
import importlib.metadata
import inspect
import json
import re
from pathlib import Path
import sys


def _unparse(node):
    if node is None:
        return None
    try:
        return ast.unparse(node)
    except Exception:
        return None


def _format_args(args: ast.arguments) -> str:
    parts = []
    posonly = list(args.posonlyargs)
    normal = list(args.args)
    all_pos = posonly + normal
    defaults = [None] * (len(all_pos) - len(args.defaults)) + list(args.defaults)
    for idx, (arg, default) in enumerate(zip(all_pos, defaults)):
        item = arg.arg
        if arg.annotation is not None:
            ann = _unparse(arg.annotation)
            if ann:
                item += f': {ann}'
        if default is not None:
            dv = _unparse(default)
            if dv is not None:
                item += f' = {dv}'
        parts.append(item)
        if posonly and idx == len(posonly) - 1:
            parts.append('/')
    if args.vararg is not None:
        item = '*' + args.vararg.arg
        if args.vararg.annotation is not None:
            ann = _unparse(args.vararg.annotation)
            if ann:
                item += f': {ann}'
        parts.append(item)
    elif args.kwonlyargs:
        parts.append('*')
    for arg, default in zip(args.kwonlyargs, args.kw_defaults):
        item = arg.arg
        if arg.annotation is not None:
            ann = _unparse(arg.annotation)
            if ann:
                item += f': {ann}'
        if default is not None:
            dv = _unparse(default)
            if dv is not None:
                item += f' = {dv}'
        parts.append(item)
    if args.kwarg is not None:
        item = '**' + args.kwarg.arg
        if args.kwarg.annotation is not None:
            ann = _unparse(args.kwarg.annotation)
            if ann:
                item += f': {ann}'
        parts.append(item)
    return '(' + ', '.join(parts) + ')'


def _trim_doc(doc, limit=600):
    if not doc:
        return ''
    text = inspect.cleandoc(doc)
    return text if len(text) <= limit else text[:limit] + ' ...'


def _parse_file_symbols(path: Path, module_name: str):
    try:
        source = path.read_text(encoding='utf-8', errors='replace')
        tree = ast.parse(source, filename=str(path))
    except Exception:
        return [], ''
    module_doc = _trim_doc(ast.get_docstring(tree) or '', 500)
    entries = []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if node.name.startswith('_') and not (node.name.startswith('__') and node.name.endswith('__')):
                continue
            prefix = 'async def ' if isinstance(node, ast.AsyncFunctionDef) else 'def '
            ret = f' -> {_unparse(node.returns)}' if node.returns is not None else ''
            entries.append({
                'kind': 'function',
                'module': module_name,
                'name': node.name,
                'qualname': f'{module_name}.{node.name}',
                'signature': f'{prefix}{node.name}{_format_args(node.args)}{ret}',
                'doc': _trim_doc(ast.get_docstring(node) or ''),
                'line': node.lineno,
                'file': path.name,
            })
        elif isinstance(node, ast.ClassDef):
            if node.name.startswith('_'):
                continue
            bases = [_unparse(b) for b in node.bases]
            base_str = f"({', '.join(b for b in bases if b)})" if bases else ''
            methods = []
            for child in node.body:
                if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    if child.name.startswith('_') and child.name != '__init__':
                        continue
                    prefix = 'async def ' if isinstance(child, ast.AsyncFunctionDef) else 'def '
                    ret = f' -> {_unparse(child.returns)}' if child.returns is not None else ''
                    methods.append({
                        'name': child.name,
                        'qualname': f'{module_name}.{node.name}.{child.name}',
                        'signature': f'{prefix}{child.name}{_format_args(child.args)}{ret}',
                        'doc': _trim_doc(ast.get_docstring(child) or '', 320),
                        'line': child.lineno,
                    })
            entries.append({
                'kind': 'class',
                'module': module_name,
                'name': node.name,
                'qualname': f'{module_name}.{node.name}',
                'signature': f'class {node.name}{base_str}',
                'doc': _trim_doc(ast.get_docstring(node) or ''),
                'methods': methods[:40],
                'line': node.lineno,
                'file': path.name,
            })
    return entries, module_doc


def _normalize_dist(name: str) -> str:
    return name.lower().replace('_', '-').replace('.', '-')


def _find_site_dirs(env_prefix: Path):
    candidates = [
        env_prefix / 'Lib' / 'site-packages',
        env_prefix / 'site-packages',
    ]
    lib_dir = env_prefix / 'lib'
    if lib_dir.is_dir():
        for child in sorted(lib_dir.iterdir()):
            sp = child / 'site-packages'
            if sp.is_dir():
                candidates.append(sp)
    found = []
    seen = set()
    for path in candidates:
        if path.is_dir():
            resolved = path.resolve()
            if resolved.is_relative_to(env_prefix) and str(resolved) not in seen:
                seen.add(str(resolved))
                found.append(resolved)
    return found


def _locate_distribution(site_dirs, package: str):
    wanted = _normalize_dist(package)
    search_paths = [str(p) for p in site_dirs]
    for dist in importlib.metadata.distributions(path=search_paths):
        name = dist.metadata.get('Name') or ''
        if _normalize_dist(name) == wanted:
            return dist
    for dist in importlib.metadata.distributions(path=search_paths):
        top = (dist.read_text('top_level.txt') or '').splitlines()
        if any(_normalize_dist(t.strip()) == wanted for t in top if t.strip()):
            return dist
    return None


def _collect_source_files(site_dirs, package: str, dist):
    root_names = []
    if dist is not None:
        top = (dist.read_text('top_level.txt') or '').splitlines()
        root_names.extend(t for t in map(str.strip, top) if re.fullmatch(r'[a-zA-Z_][a-zA-Z0-9_]*', t))
    cleaned = package.replace('-', '_')
    if cleaned not in root_names:
        root_names.append(cleaned)
    files = []
    submodules = []
    has_native_ext = False
    for sp in site_dirs:
        for root_name in root_names:
            pkg_dir = sp / root_name
            if pkg_dir.is_symlink():
                continue
            if pkg_dir.is_dir():
                for p in sorted(pkg_dir.rglob('*')):
                    if len(files) >= 120:
                        break
                    if not p.is_file() or not p.resolve().is_relative_to(pkg_dir) or p.stat().st_size > 1024 * 1024:
                        continue
                    rel_parts = p.relative_to(sp).parts
                    if any(part == '__pycache__' or part == 'tests' or part == 'test' for part in rel_parts):
                        continue
                    if p.suffix in ('.pyd', '.so'):
                        has_native_ext = True
                        continue
                    if p.suffix not in ('.py', '.pyi'):
                        continue
                    mod_parts = list(p.relative_to(sp).with_suffix('').parts)
                    if mod_parts and mod_parts[-1] == '__init__':
                        mod_parts = mod_parts[:-1]
                    mod_name = '.'.join(mod_parts) or root_name
                    files.append((p, mod_name))
                    if mod_name not in submodules:
                        submodules.append(mod_name)
            else:
                for suffix in ('.pyi', '.py'):
                    single = sp / (root_name + suffix)
                    if single.is_file() and single.resolve().is_relative_to(sp) and single.stat().st_size <= 1024 * 1024:
                        files.append((single, root_name))
                        if root_name not in submodules:
                            submodules.append(root_name)
                for ext in ('.pyd', '.so'):
                    if list(sp.glob(f'{root_name}*{ext}')):
                        has_native_ext = True
    # Prefer .pyi stubs before .py for the same module when deduplicating later, keep both parsed
    return files, submodules[:80], has_native_ext


def main():
    request = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    env_prefix = Path(request['envPrefix']).resolve(strict=True)
    package = str(request['package']).strip()
    symbol = (request.get('symbol') or '').strip() or None
    query = (request.get('query') or '').strip().lower() or None
    max_chars = int(request.get('maxChars') or 16000)

    site_dirs = _find_site_dirs(env_prefix)
    if not site_dirs:
        print(json.dumps({'status': 'error', 'error': f'site-packages not found under {env_prefix}'}, ensure_ascii=False))
        return

    dist = _locate_distribution(site_dirs, package)
    source_files, submodules, has_native_ext = _collect_source_files(site_dirs, package, dist)
    if dist is None and not source_files and not has_native_ext:
        installed = sorted({d.metadata.get('Name') for d in importlib.metadata.distributions(path=[str(p) for p in site_dirs]) if d.metadata.get('Name')})
        print(json.dumps({
            'status': 'not_found',
            'package': package,
            'envPrefix': str(env_prefix),
            'hint': 'Package is not installed in this environment. Install it via manage_python_venv or check installed packages.',
            'installedSample': installed[:60],
        }, ensure_ascii=False))
        return

    all_symbols = []
    top_doc = ''
    for file_path, mod_name in source_files:
        entries, mod_doc = _parse_file_symbols(file_path, mod_name)
        if not top_doc and mod_doc and mod_name in (package.replace('-', '_'), submodules[0] if submodules else ''):
            top_doc = mod_doc
        all_symbols.extend(entries)

    matched = []
    if symbol:
        sym_lower = symbol.lower()
        for entry in all_symbols:
            if entry['name'].lower() == sym_lower or entry['qualname'].lower().endswith('.' + sym_lower) or entry['qualname'].lower() == sym_lower:
                matched.append(entry)
            elif entry.get('methods'):
                for m in entry['methods']:
                    if m['name'].lower() == sym_lower or f"{entry['name']}.{m['name']}".lower() == sym_lower or m['qualname'].lower().endswith('.' + sym_lower):
                        matched.append({**m, 'kind': 'method', 'module': entry['module'], 'parentClass': entry['name']})
    elif query:
        for entry in all_symbols:
            hay = f"{entry['qualname']} {entry['signature']} {entry.get('doc', '')}".lower()
            if query in hay:
                matched.append(entry)
            elif entry.get('methods'):
                for m in entry['methods']:
                    mhay = f"{m['qualname']} {m['signature']} {m.get('doc', '')}".lower()
                    if query in mhay:
                        matched.append({**m, 'kind': 'method', 'module': entry['module'], 'parentClass': entry['name']})
    else:
        matched = all_symbols[:40]

    payload = {
        'status': 'ok',
        'mode': 'static-ast',
        'nativeSymbolsNotInspected': has_native_ext,
        'package': dist.metadata.get('Name') if dist else package,
        'version': dist.version if dist else 'unknown',
        'summary': (dist.metadata.get('Summary') if dist else '') or '',
        'envPrefix': str(env_prefix),
        'moduleDoc': top_doc,
        'submodules': submodules[:40],
        'totalSymbolsParsed': len(all_symbols),
        'matches': matched[:50],
    }
    text = json.dumps(payload, ensure_ascii=False)
    while len(text) > max_chars and payload['matches']:
        payload['matches'].pop()
        payload['truncated'] = True
        text = json.dumps(payload, ensure_ascii=False)
    if len(text) > max_chars:
        text = json.dumps({'status': 'ok', 'mode': 'static-ast', 'truncated': True, 'matches': []})
    print(text)


if __name__ == '__main__':
    main()
