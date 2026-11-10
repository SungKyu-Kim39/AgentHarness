# SPDX-License-Identifier: GPL-3.0-or-later
"""Private entry point for four pinned upstream MCP servers.

Only host-created snapshots/configuration reach this process. The audit hook is
defence in depth, not an OS sandbox; native DuckDB and clangd have separate guards.
No user/project executable configuration or package discovery is loaded.
"""
from pathlib import Path
import asyncio
import json
import os
import sys


def main():
    config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    work = Path(config['work']).resolve(strict=True)
    site = Path(config['site']).resolve(strict=True)
    sys.path.insert(0, str(site))
    dll_handles = []
    if os.name == 'nt':
        # Explicitly reproduce only the reviewed pywin32 path setup. Do not
        # execute arbitrary .pth files or run pywin32 post-install actions.
        for folder in [site / 'win32', site / 'win32/lib', site / 'pywin32_system32']:
            if folder.is_dir(): sys.path.insert(0, str(folder))
        for folder in [Path(sys.executable).parent, site / 'pywin32_system32']:
            if folder.is_dir(): dll_handles.append(os.add_dll_directory(str(folder)))
    # Use Python's built-in MIME table, without system files or Windows registry.
    import mimetypes
    mimetypes.knownfiles = []
    mimetypes.MimeTypes.read_windows_registry = lambda self, strict=True: None
    mimetypes.init(files=[])
    os.chdir(work)
    os.environ.update({key: str(work) for key in ('HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'TMPDIR', 'TMP', 'TEMP')})
    os.environ.update(SERENA_HOME=str(work / 'serena-home'), MARKITDOWN_ENABLE_PLUGINS='false', DO_NOT_TRACK='1', HF_HUB_OFFLINE='1')
    allowed_read = [work, site, Path(sys.base_prefix).resolve(), Path(sys.prefix).resolve()]
    allowed_exec = {str(Path(config[key]).resolve()): key for key in ('git', 'clangd') if config.get(key)}

    def inside(file, roots):
        if isinstance(file, int): return True
        if file == os.devnull: return True
        try:
            p = Path(os.fsdecode(file)).resolve()
            return any(p == root or root in p.parents for root in roots)
        except (TypeError, ValueError, OSError): return False

    def audit(event, args):
        if event == 'open':
            file, mode, flags = args
            writing = (isinstance(mode, str) and any(c in mode for c in 'wax+')) or isinstance(flags, int) and flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND)
            if not inside(file, [work] if writing else allowed_read):
                # Certificate discovery may probe known system paths; it must not
                # read them. Requests are disabled by the socket policy as well.
                raise PermissionError('MCP file access outside the private snapshot is blocked')
        elif event in ('os.remove', 'os.rmdir', 'os.mkdir', 'os.chmod', 'os.utime', 'os.truncate'):
            if not inside(args[0], [work]): raise PermissionError('MCP write outside snapshot is blocked')
        elif event in ('os.rename', 'os.link', 'os.symlink'):
            if not all(inside(p, [work]) for p in args[:2]): raise PermissionError('MCP path mutation is blocked')
        elif event in ('socket.connect', 'socket.connect_ex', 'socket.getaddrinfo', 'socket.gethostbyname', 'socket.sendto'):
            raise PermissionError('Network is disabled for offline analysis MCPs')
        elif event in ('os.system', 'os.exec', 'os.fork', 'pty.spawn'):
            raise PermissionError('Unreviewed process creation is blocked')
        elif event == 'os.posix_spawn':
            if str(Path(args[0]).resolve()) not in allowed_exec:
                raise PermissionError('Only fixed Git/clangd can be spawned')
        elif event == 'subprocess.Popen':
            executable, argv, cwd, env = args
            if not isinstance(argv, (list, tuple)) or str(Path(executable).resolve()) not in allowed_exec:
                raise PermissionError('Only the fixed Git/clangd executable is allowed')
            if not inside(cwd or os.getcwd(), [work]): raise PermissionError('Process working directory is outside snapshot')
    sys.addaudithook(audit)
    service = config['service']
    if service == 'git':
        os.environ.update(GIT_PYTHON_GIT_EXECUTABLE=config['git'], GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=str(work / 'empty-gitconfig'), GIT_OPTIONAL_LOCKS='0', GIT_TERMINAL_PROMPT='0', GIT_PAGER='cat', GIT_ATTR_NOSYSTEM='1')
        (work / 'empty-gitconfig').write_text('')
        from mcp_server_git.server import create_server
        server = create_server(work / 'source')
        @server.tool(name='l_vibe_snapshot_tracked_paths')
        def tracked_paths() -> str:
            """Host-internal preparation: paths from the copied Git index only."""
            import git
            with git.Repo(work / 'source') as repo:
                paths = sorted({file for file, stage in repo.index.entries})
                if len(paths) > 20000: raise ValueError('Tracked file count exceeds the snapshot budget')
                return json.dumps(paths)
        asyncio.run(server.run_stdio_async())
    elif service == 'markitdown':
        import onnxruntime
        onnxruntime.disable_telemetry_events()
        import zipfile
        selected = Path(config['input']).resolve(strict=True)
        if selected.suffix.lower() in ('.docx', '.pptx', '.xlsx'):
            with zipfile.ZipFile(selected) as archive:
                members = archive.infolist()
                if len(members) > 10000 or sum(m.file_size for m in members) > 256 * 1024 * 1024 or any(m.file_size > 64 * 1024 * 1024 or m.file_size / max(1, m.compress_size) > 1000 for m in members):
                    raise ValueError('Compressed document expansion exceeds the conversion budget')
        from markitdown import MarkItDown
        original = MarkItDown.convert_uri
        allowed = selected.as_uri()
        def local_only(self, uri, *args, **kwargs):
            if uri != allowed: raise ValueError('Only the host-selected copied local document is permitted')
            return original(self, uri, *args, **kwargs)
        MarkItDown.convert_uri = local_only
        from markitdown_mcp.__main__ import mcp
        mcp.run()
    elif service == 'duckdb':
        import duckdb
        from mcp_server_motherduck.database import DatabaseClient
        from mcp_server_motherduck.server import create_mcp_server
        inputs = [Path(p).resolve(strict=True) for p in config['inputs']]
        dbs = [p for p in inputs if p.suffix.lower() == '.duckdb']
        if len(dbs) > 1: raise ValueError('At most one local DuckDB database is supported')
        def initialize(self):
            connection = duckdb.connect(str(dbs[0]) if dbs else ':memory:', read_only=bool(dbs), config={
                'enable_external_access': True,
                'autoinstall_known_extensions': False, 'autoload_known_extensions': False,
                'allow_community_extensions': False, 'allow_unsigned_extensions': False,
                'memory_limit': '256MB', 'threads': 2, 'max_temp_directory_size': '0B',
            })
            connection.execute('SET allowed_paths = ?', [[str(p) for p in inputs]])
            connection.execute('SET enable_external_access = false')
            for i, file in enumerate(inputs):
                extension = file.suffix.lower()
                if extension == '.duckdb': continue
                reader = 'read_parquet' if extension == '.parquet' else 'read_csv_auto'
                literal = str(file).replace("'", "''")
                connection.execute(f"CREATE TEMP VIEW input_{i} AS SELECT * FROM {reader}('{literal}')")
            connection.execute('SET lock_configuration = true')
            return connection
        DatabaseClient._initialize_connection = initialize
        original_query = DatabaseClient.query
        def query(self, sql):
            self._ensure_connected()
            statements = self.conn.extract_statements(sql)
            if len(statements) != 1 or statements[0].type != duckdb.StatementType.SELECT:
                raise ValueError('Exactly one SELECT statement is allowed; writes, settings, extensions and attachments are blocked')
            return original_query(self, sql)
        DatabaseClient.query = query
        create_mcp_server(str(dbs[0]) if dbs else ':memory:', home_dir=str(work), read_only=True, ephemeral_connections=False, max_rows=200, max_chars=50000, query_timeout=15, allow_switch_databases=False).run(transport='stdio', show_banner=False)
    elif service == 'serena':
        run_serena(config, work, site)
    else:
        raise ValueError('Unknown pinned service')


def run_serena(config, work, site):
    import shlex
    import yaml
    source = work / 'source'
    home = work / 'serena-home'; home.mkdir(exist_ok=True)
    tools = ['get_symbols_overview', 'find_symbol', 'find_referencing_symbols']
    common = dict(agent_interface='tools', fixed_tools=tools, activation_command=None, ls_specific_settings={'cpp': {'ls_path': config['clangd'], 'compile_commands_dir': '.serena/compile'}})
    global_config = yaml.safe_load((site / 'serena/resources/serena_config.template.yml').read_text())
    global_config.update(common, web_dashboard=False, web_dashboard_open_on_launch=False, gui_log_window=False, projects=[], base_modes=[], default_modes=['interactive'], log_level='ERROR', trusted_project_path_patterns=[str(source)])
    (home / 'serena_config.yml').write_text(yaml.safe_dump(global_config), encoding='utf-8')
    project_config = yaml.safe_load((site / 'serena/resources/project.template.yml').read_text())
    project_config.update(common, project_name='L-Vibe snapshot', language_servers=['cpp'], read_only=True, ignore_all_files_in_gitignore=False, ignored_paths=[], default_modes=['interactive'])
    (source / '.serena').mkdir(exist_ok=True)
    (source / '.serena/project.yml').write_text(yaml.safe_dump(project_config), encoding='utf-8')
    # A redirect-only VFS confines native preprocessing, including absolute
    # includes and #embed, to copied inputs and the pinned clang resource headers.
    def tree(directory):
        entries = []
        for p in sorted(directory.iterdir()):
            if p.name == '.serena' or p.is_symlink(): continue
            if p.is_dir(): entries.append({'type': 'directory', 'name': p.name, 'contents': tree(p)})
            elif p.is_file(): entries.append({'type': 'file', 'name': p.name, 'external-contents': str(p)})
        return entries
    resource = Path(config['clangd']).parent.parent / 'lib/clang/23'
    # clangd must also reopen its generated preamble inside the private work
    # directory. A bounded directory remap permits those files as they appear,
    # while fallthrough:false still rejects every path outside these roots.
    roots = [{'type': 'directory-remap', 'name': str(work), 'external-contents': str(work)}]
    if resource.is_dir(): roots.append({'type': 'directory', 'name': str(resource), 'contents': tree(resource)})
    overlay = work / 'vfs.json'
    overlay.write_text(json.dumps({'version': 0, 'case-sensitive': os.name != 'nt', 'use-external-names': False, 'fallthrough': False, 'roots': roots}), encoding='utf-8')
    db = source / 'compile_commands.json'
    original = json.loads(db.read_text(encoding='utf-8-sig')) if db.exists() else []
    origin = Path(config['project'])
    compiled = {}
    for entry in original:
        if not isinstance(entry, dict): continue
        directory = Path(entry.get('directory', str(origin)))
        file = Path(entry.get('file', ''))
        try: relative = (directory / file).relative_to(origin)
        except ValueError: continue
        target = source / relative
        if not target.is_file(): continue
        args = entry.get('arguments') or shlex.split(entry.get('command', ''), posix=os.name != 'nt')
        flags = []; index = 1
        while index < len(args):
            arg = str(args[index]).strip('"'); index += 1
            if arg in ('-D', '-U', '/D', '/U', '-I', '/I', '-isystem', '-iquote') and index < len(args):
                arg += str(args[index]).strip('"'); index += 1
            if arg.startswith(('-D', '-U', '/D', '/U')) and len(arg) < 1024:
                flags.append(('-' + arg[1:]) if arg.startswith('/') else arg)
            elif arg.startswith('-std='): flags.append(arg)
            elif arg.startswith('/std:'): flags.append('-std=' + arg[5:])
            else:
                prefix = next((p for p in ('-isystem', '-iquote', '-I', '/I') if arg.startswith(p) and len(arg) > len(p)), None)
                if not prefix: continue
                try:
                    include = (source / (directory / arg[len(prefix):]).relative_to(origin)).resolve()
                    include.relative_to(source)
                except ValueError: continue
                if include.is_dir(): flags.append('-I' + str(include))
        compiled[str(target)] = flags
    commands = []
    for file in source.rglob('*'):
        if file.suffix.lower() not in ('.c', '.cc', '.cpp', '.cxx', '.h', '.hpp', '.hh', '.hxx'): continue
        flags = compiled.get(str(file), [])
        commands.append({'directory': str(source), 'file': str(file), 'arguments': ['clang', '-x', 'c' if file.suffix == '.c' else 'c++', '-nostdinc', '-nostdinc++', '-ivfsoverlay', str(overlay), '-I' + str(source), *(['-isystem', str(resource / 'include')] if resource.is_dir() else []), *flags, '-c', str(file)]})
    db.write_text(json.dumps(commands), encoding='utf-8')
    (work / 'analysis-context.json').write_text(json.dumps({'compileDatabaseProvided': bool(original), 'matchedCompilationUnits': len(compiled), 'analyzedUnits': len(commands), 'externalSdkIncluded': False}), encoding='utf-8')
    from solidlsp.language_servers.clangd_language_server import ClangdLanguageServer
    original_launch = ClangdLanguageServer._create_process_launch_info
    def fixed_launch(self):
        info = original_launch(self)
        # LLVM's in-memory PCH uses an absolute synthetic /__clang_tmp path,
        # outside our redirect-only VFS. Disk PCH stays in the private TEMP/TMPDIR
        # and is visible through the bounded work-directory remap.
        info.cmd += ['--enable-config=false', '--clang-tidy=false', '--header-insertion=never', '--pch-storage=disk', '-j=2']
        return info
    ClangdLanguageServer._create_process_launch_info = fixed_launch
    if config.get('trace'):
        from solidlsp.ls import SolidLanguageServer
        original_diagnostics = SolidLanguageServer._store_published_diagnostics
        def diagnostics(self, params):
            print('L_VIBE_LSP_DIAGNOSTICS ' + json.dumps(params), file=sys.stderr)
            return original_diagnostics(self, params)
        SolidLanguageServer._store_published_diagnostics = diagnostics
    # Upstream uses shell=True for LSP launch; the adapter always passes fixed
    # argv directly and keeps clangd in the host-owned process group/Windows Job.
    import subprocess
    from solidlsp.util.subprocess_util import ManagedSubprocessLauncher, ManagedSubprocess, subprocess_kwargs
    def direct_launch(self, info, name, start_new_session):
        if not isinstance(info.cmd, list) or Path(info.cmd[0]).resolve() != Path(config['clangd']).resolve():
            raise PermissionError('Only pinned clangd can be launched')
        child = subprocess.Popen(info.cmd, stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.PIPE, env={**os.environ, **info.env}, cwd=info.cwd, shell=False, start_new_session=False, **subprocess_kwargs())
        return ManagedSubprocess(child, name, False)
    ManagedSubprocessLauncher.launch = direct_launch
    from serena.agent import SerenaAgent
    SerenaAgent._send_usage_info = lambda self: None
    from serena.mcp import SerenaMCPFactory
    from serena.config.serena_config import AgentInterface
    factory = SerenaMCPFactory('stdio', project=str(source))
    factory.create_mcp_server(agent_interface=AgentInterface.TOOLS, enable_web_dashboard=False, enable_gui_log_window=False, open_web_dashboard=False, trace_lsp_communication=config.get('trace', False), log_level='DEBUG' if config.get('trace') else 'ERROR', tool_timeout=45).run(transport='stdio')


if __name__ == '__main__':
    main()
