"""Fixed launcher inside a user-selected Conda environment, never model code."""
import hashlib
import json
import os
from pathlib import Path
import sys
import subprocess

request = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
prefix = Path(request['prefix']).resolve()
if not os.environ.get('CONDA_PREFIX') or Path(sys.prefix).resolve() != prefix or Path(os.environ['CONDA_PREFIX']).resolve() != prefix:
    raise RuntimeError('NED_PYTHON_ENVIRONMENT_MISMATCH')
project = Path(request['project']).resolve()
os.chdir(project)
if request['action'] in ('run', 'compile', 'pyinstaller'):
    script = Path(request['script']).resolve()
    script.relative_to(project)
    if hashlib.sha256(script.read_bytes()).hexdigest() != request['scriptSha256']:
        raise RuntimeError('NED_PYTHON_SOURCE_CHANGED')
    if request['action'] == 'run': args = ['-B', str(script), *request['args']]
    elif request['action'] == 'compile': args = ['-B', '-m', 'py_compile', str(script)]
    else: args = ['-B', '-m', 'PyInstaller', '--noconfirm', *request['args'], '--distpath', str(project/'dist'), '--workpath', str(project/'build'), '--specpath', str(Path(sys.argv[1]).resolve().parent), str(script)]
elif request['action'] == 'test':
    args = ['-B', '-m', 'pytest', *request['args']]
elif request['action'] == 'wheel':
    args = ['-B', '-m', 'build', '--no-isolation', '--wheel', '--outdir', str(project/'dist')]
else:
    raise ValueError('NED_PYTHON_ACTION_NOT_ALLOWED')
# Windows execv can terminate the wrapper before the replacement finishes.
# Keep the owned process alive and propagate the real project exit code.
raise SystemExit(subprocess.run([sys.executable, *args], stdin=subprocess.DEVNULL, check=False).returncode)
