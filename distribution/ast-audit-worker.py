"""Offline multilingual AST search/rewrite (ast-grep-py) and local security/quality audit worker.

Runs read-only over a host-prepared snapshot directory. Blocks network access, process creation,
and writes outside the temporary work directory via sys.addaudithook. Never writes directly to
the user's project tree; rewrites are returned as structured proposed file contents for host
approval, unsaved-buffer validation, and snapshotting.
"""
import ast
import json
import os
from pathlib import Path
import re
import sys


EXT_LANG = {
    '.py': 'python', '.pyi': 'python',
    '.ts': 'typescript', '.mts': 'typescript', '.cts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.jsx': 'javascript',
    '.c': 'c', '.h': 'c',
    '.cc': 'cpp', '.cpp': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp', '.hxx': 'cpp',
    '.cs': 'csharp',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.html': 'html', '.htm': 'html',
    '.css': 'css',
    '.json': 'json',
}

SECRET_RULES = [
    ('SEC-PRIVATE-KEY', 'high', 'Hardcoded private key header', re.compile(r'-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----')),
    ('SEC-AWS-KEY', 'high', 'Potential AWS Access Key ID', re.compile(r'\b(?:AKIA|ASIA)[0-9A-Z]{16}\b')),
    ('SEC-GH-TOKEN', 'high', 'Potential GitHub token', re.compile(r'\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b')),
    ('SEC-HARDCODED-SECRET', 'medium', 'Potential hardcoded credential assignment',
     re.compile(r'''(?i)\b(?:api_?key|secret_?key|access_?token|auth_?token|db_?password|passwd|password)\b\s*[:=]\s*["']([A-Za-z0-9+/=_\-!@#$%^&*]{12,})["']''')),
]

PLACEHOLDER_WORDS = ('example', 'placeholder', 'changeme', 'your_', 'dummy', 'fake', 'test', 'sample', 'xxxx', '0000')

SECURITY_PATTERNS = [
    ('SAST-SHELL-TRUE', 'high', 'Subprocess executed with shell=True', {'python'}, re.compile(r'\bsubprocess\.(?:run|Popen|call|check_call|check_output)\s*\([^)]*shell\s*=\s*True')),
    ('SAST-EVAL-EXEC', 'high', 'Dynamic eval/exec call', {'python', 'javascript', 'typescript', 'tsx'}, re.compile(r'(?<!\.)\b(?:eval|exec)\s*\(')),
    ('SAST-PICKLE-LOAD', 'high', 'Untrusted pickle deserialization', {'python'}, re.compile(r'\bpickle\.loads?\s*\(')),
    ('SAST-YAML-UNSAFE', 'high', 'yaml.load without SafeLoader', {'python'}, re.compile(r'\byaml\.load\s*\((?![^)]*SafeLoader)')),
    ('SAST-TLS-VERIFY-FALSE', 'medium', 'TLS certificate verification disabled', {'python'}, re.compile(r'\bverify\s*=\s*False\b')),
    ('SAST-SQL-FORMAT', 'high', 'Possible SQL query constructed via f-string or string concatenation', {'python', 'javascript', 'typescript', 'tsx', 'java', 'csharp'},
     re.compile(r'''(?i)\bexecute\s*\(\s*(?:f["'][^"']*(?:SELECT|INSERT|UPDATE|DELETE)\b|["'][^"']*(?:SELECT|INSERT|UPDATE|DELETE)\b[^"']*["']\s*\+)''')),
    ('SAST-DANGEROUS-HTML', 'medium', 'Unsanitized HTML injection sink', {'javascript', 'typescript', 'tsx'}, re.compile(r'\b(?:dangerouslySetInnerHTML|innerHTML\s*=|document\.write\s*\()')),
    ('SAST-UNSAFE-C', 'high', 'Unsafe unbounded C string function (strcpy/strcat/sprintf/gets)', {'c', 'cpp'}, re.compile(r'\b(?:strcpy|strcat|sprintf|vsprintf|gets)\s*\(')),
    ('SAST-WEAK-HASH', 'low', 'Weak hash algorithm (MD5/SHA1)', {'python', 'javascript', 'typescript', 'java', 'csharp'}, re.compile(r'\b(?:hashlib\.(?:md5|sha1)|createHash\(\s*["\'](?:md5|sha1)["\']\))')),
]


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
                raise PermissionError('File access outside snapshot blocked')
        elif event in ('os.remove', 'os.rmdir', 'os.mkdir', 'os.rename', 'os.link', 'os.symlink'):
            if not inside(args[0], [work]):
                raise PermissionError('Filesystem mutation outside work blocked')
        elif event in ('socket.connect', 'socket.connect_ex', 'socket.getaddrinfo', 'socket.gethostbyname', 'socket.sendto'):
            raise PermissionError('Network disabled for offline AST/audit worker')
        elif event in ('os.system', 'os.exec', 'os.fork', 'pty.spawn', 'subprocess.Popen', 'os.posix_spawn'):
            raise PermissionError('Subprocess creation disabled for offline AST/audit worker')

    sys.addaudithook(audit)


def _iter_files(source_root: Path, requested_paths):
    if requested_paths:
        for rel in requested_paths:
            p = (source_root / rel).resolve()
            if p.is_file() and source_root in p.parents:
                yield rel, p
        return
    for p in sorted(source_root.rglob('*')):
        if p.is_file():
            yield p.relative_to(source_root).as_posix(), p


def _pattern_to_regex(pattern: str) -> re.Pattern:
    # Fallback structural matcher when ast-grep-py is unavailable:
    # Converts ast-grep metavariables ($VAR, $$$ARGS) into bounded regex captures.
    tokens = []
    i = 0
    while i < len(pattern):
        if pattern.startswith('$$$', i):
            m = re.match(r'\$\$\$([A-Z0-9_]+)', pattern[i:])
            if m:
                tokens.append(f'(?P<{m.group(1)}>[\\s\\S]*?)')
                i += len(m.group(0))
                continue
        if pattern[i] == '$':
            m = re.match(r'\$([A-Z0-9_]+)', pattern[i:])
            if m:
                tokens.append(f'(?P<{m.group(1)}>[^\\s,;()\\[\\]{{}}]+)')
                i += len(m.group(0))
                continue
        if pattern[i].isspace():
            while i < len(pattern) and pattern[i].isspace():
                i += 1
            tokens.append(r'\s+')
            continue
        tokens.append(re.escape(pattern[i]))
        i += 1
    return re.compile(''.join(tokens))


def _render_rewrite(rewrite: str, groupdict: dict) -> str:
    out = rewrite
    for k, v in sorted(groupdict.items(), key=lambda kv: -len(kv[0])):
        out = out.replace('$$$' + k, v).replace('$' + k, v)
    return out


def _run_ast_search(source_root: Path, config: dict):
    language = str(config['language']).lower()
    pattern = str(config['pattern'])
    rewrite = config.get('rewrite')
    requested_paths = config.get('paths') or []

    sg_root_cls = None
    try:
        from ast_grep_py import SgRoot  # type: ignore
        sg_root_cls = SgRoot
    except Exception:
        sg_root_cls = None

    matches = []
    rewrites = []
    truncated = False
    engine = 'ast-grep-py' if sg_root_cls is not None else 'structural-regex-fallback'
    fallback_re = None if sg_root_cls is not None else _pattern_to_regex(pattern)

    for rel, file_path in _iter_files(source_root, requested_paths):
        ext_lang = EXT_LANG.get(file_path.suffix.lower())
        if not requested_paths and ext_lang != language:
            continue
        try:
            text = file_path.read_text(encoding='utf-8')
        except Exception:
            continue

        if sg_root_cls is not None:
            try:
                root = sg_root_cls(text, language).root()
                nodes = root.find_all(pattern=pattern)
            except Exception as exc:
                return {'status': 'error', 'engine': engine, 'error': f'AST pattern error: {exc}'}
            if not nodes:
                continue
            edits = []
            for idx, node in enumerate(nodes):
                if len(matches) >= 200:
                    truncated = True
                    break
                r = node.range()
                item = {
                    'path': rel,
                    'line': r.start.line + 1,
                    'endLine': r.end.line + 1,
                    'text': node.text()[:600],
                }
                if rewrite is not None:
                    replaced = node.replace(rewrite)
                    edits.append(replaced)
                    item['after'] = replaced.inserted_text[:600]
                matches.append(item)
                if len(matches) >= 200 and idx + 1 < len(nodes):
                    truncated = True
                    break
            if rewrite is not None and edits:
                new_text = root.commit_edits(edits)
                if new_text != text:
                    rewrites.append({'path': rel, 'before': text, 'after': new_text, 'replacements': len(edits)})
        else:
            file_matches = list(fallback_re.finditer(text))
            if not file_matches:
                continue
            parts = []
            cursor = 0
            applied_in_file = 0
            for idx, m in enumerate(file_matches):
                if len(matches) >= 200:
                    truncated = True
                    break
                start_line = text.count('\n', 0, m.start()) + 1
                end_line = text.count('\n', 0, m.end()) + 1
                item = {'path': rel, 'line': start_line, 'endLine': end_line, 'text': m.group(0)[:600]}
                if rewrite is not None:
                    rep = _render_rewrite(rewrite, m.groupdict())
                    item['after'] = rep[:600]
                    parts.append(text[cursor:m.start()])
                    parts.append(rep)
                    cursor = m.end()
                    applied_in_file += 1
                matches.append(item)
                if len(matches) >= 200 and idx + 1 < len(file_matches):
                    truncated = True
                    break
            if rewrite is not None and parts:
                parts.append(text[cursor:])
                new_text = ''.join(parts)
                if new_text != text:
                    rewrites.append({'path': rel, 'before': text, 'after': new_text, 'replacements': applied_in_file})
        if truncated:
            break

    return {
        'status': 'ok',
        'engine': engine,
        'language': language,
        'pattern': pattern,
        'matchCount': len(matches),
        'truncated': truncated,
        'matches': matches,
        'rewrites': rewrites,
    }


def _audit_python_ast(rel: str, text: str, categories: set):
    findings = []
    try:
        tree = ast.parse(text, filename=rel)
    except SyntaxError as exc:
        if 'quality' in categories:
            findings.append({'rule': 'PY-SYNTAX', 'severity': 'high', 'category': 'quality', 'path': rel, 'line': exc.lineno or 1, 'message': f'Python syntax error: {exc.msg}'})
        return findings

    for node in ast.walk(tree):
        if 'quality' in categories:
            if isinstance(node, ast.ExceptHandler) and node.type is None:
                findings.append({'rule': 'PY-BARE-EXCEPT', 'severity': 'low', 'category': 'quality', 'path': rel, 'line': node.lineno, 'message': 'Bare except: catches SystemExit/KeyboardInterrupt; catch Exception or specific types.'})
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for default in list(node.args.defaults) + [d for d in node.args.kw_defaults if d is not None]:
                    if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                        findings.append({'rule': 'PY-MUTABLE-DEFAULT', 'severity': 'medium', 'category': 'quality', 'path': rel, 'line': node.lineno, 'message': f'Mutable default argument in {node.name}(); use None and initialize inside body.'})
                        break
        if 'security' in categories:
            if isinstance(node, ast.Call):
                func = node.func
                name = func.id if isinstance(func, ast.Name) else func.attr if isinstance(func, ast.Attribute) else ''
                if name in ('eval', 'exec') and isinstance(func, ast.Name):
                    findings.append({'rule': 'PY-AST-EVAL', 'severity': 'high', 'category': 'security', 'path': rel, 'line': node.lineno, 'message': f'Dynamic code execution via {name}()'})
    return findings


def _run_code_audit(source_root: Path, config: dict):
    categories = set(config.get('categories') or ['security', 'secrets', 'quality'])
    requested_paths = config.get('paths') or []
    findings = []
    scanned_files = 0
    seen_keys = set()

    def add_finding(item):
        key = (item['rule'], item['path'], item['line'])
        if key in seen_keys:
            return
        seen_keys.add(key)
        findings.append(item)

    for rel, file_path in _iter_files(source_root, requested_paths):
        lang = EXT_LANG.get(file_path.suffix.lower())
        if not lang:
            continue
        try:
            text = file_path.read_text(encoding='utf-8')
        except Exception:
            continue
        scanned_files += 1
        lines = text.splitlines()

        if 'secrets' in categories:
            for idx, line in enumerate(lines, start=1):
                for rule_id, severity, msg, regex in SECRET_RULES:
                    m = regex.search(line)
                    if not m:
                        continue
                    captured = m.group(1).lower() if m.lastindex else m.group(0).lower()
                    if any(word in captured for word in PLACEHOLDER_WORDS):
                        continue
                    add_finding({'rule': rule_id, 'severity': severity, 'category': 'secrets', 'path': rel, 'line': idx, 'message': msg})

        if 'security' in categories:
            for idx, line in enumerate(lines, start=1):
                for rule_id, severity, msg, langs, regex in SECURITY_PATTERNS:
                    if lang not in langs:
                        continue
                    if regex.search(line):
                        add_finding({'rule': rule_id, 'severity': severity, 'category': 'security', 'path': rel, 'line': idx, 'message': msg})

        if lang == 'python':
            for item in _audit_python_ast(rel, text, categories):
                add_finding(item)

        if len(findings) >= 300:
            break

    # Optional bundled bandit scan if installed in site-packages and security category requested
    bandit_used = False
    if 'security' in categories and len(findings) < 300:
        try:
            from bandit.core import config as b_config, manager as b_manager  # type: ignore
            py_files = [str(p) for _rel, p in _iter_files(source_root, requested_paths) if p.suffix.lower() == '.py']
            if py_files:
                mgr = b_manager.BanditManager(b_config.BanditConfig(), 'file')
                mgr.discover_files(py_files, recursive=False)
                mgr.run_tests()
                bandit_used = True
                for issue in mgr.get_issue_list():
                    rel_path = Path(issue.fname).resolve().relative_to(source_root).as_posix()
                    add_finding({
                        'rule': f'BANDIT-{issue.test_id}',
                        'severity': str(issue.severity).lower(),
                        'category': 'security',
                        'path': rel_path,
                        'line': int(issue.lineno or 1),
                        'message': str(issue.text),
                    })
                    if len(findings) >= 300:
                        break
        except Exception:
            pass

    severity_rank = {'high': 0, 'medium': 1, 'low': 2}
    findings.sort(key=lambda f: (severity_rank.get(f['severity'], 3), f['path'], f['line']))
    summary = {
        'high': sum(1 for f in findings if f['severity'] == 'high'),
        'medium': sum(1 for f in findings if f['severity'] == 'medium'),
        'low': sum(1 for f in findings if f['severity'] == 'low'),
    }
    return {
        'status': 'ok',
        'scannedFiles': scanned_files,
        'banditUsed': bandit_used,
        'summary': summary,
        'totalFindings': len(findings),
        'findings': findings[:200],
        'truncated': len(findings) > 200,
    }


def main():
    config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    work = Path(config['work']).resolve(strict=True)
    source_root = Path(config['source']).resolve(strict=True)
    site_dirs = [Path(s).resolve() for s in (config.get('sites') or []) if Path(s).is_dir()]
    for s in reversed(site_dirs):
        sys.path.insert(0, str(s))
    allowed_read = [work, source_root, *site_dirs, Path(sys.base_prefix).resolve(), Path(sys.prefix).resolve()]
    _install_audit_hook(allowed_read, work)

    mode = config['mode']
    if mode == 'ast_search':
        result = _run_ast_search(source_root, config)
    elif mode == 'code_audit':
        result = _run_code_audit(source_root, config)
    else:
        result = {'status': 'error', 'error': f'Unsupported mode: {mode}'}
    payload = json.dumps(result, ensure_ascii=False)
    result_file = config.get('resultFile')
    if result_file:
        out_path = Path(result_file).resolve()
        if out_path != work and work not in out_path.parents:
            raise PermissionError('resultFile outside work directory blocked')
        out_path.write_text(payload, encoding='utf-8')
    else:
        print(payload)


if __name__ == '__main__':
    main()
