"""Graphify static extraction on a host-validated private snapshot. No execution/LLM/network."""
import contextlib
import json
from pathlib import Path
import socket
import sys

def blocked(*args, **kwargs):
    raise PermissionError('Ned static analysis has no network permission')

socket.socket.connect = blocked
socket.socket.connect_ex = blocked
socket.getaddrinfo = blocked

def main():
    root = Path(sys.argv[1]).resolve()
    source = root / 'source'
    from graphify.extract import extract
    with contextlib.redirect_stdout(sys.stderr):
        graph = extract([p for p in source.rglob('*') if p.is_file()], root=source, cache_root=root / 'cache', parallel=False)
    nodes, edges = graph.get('nodes', []), graph.get('edges', [])
    print(json.dumps({'source': 'Graphify', 'mode': 'static-AST', 'nodeCount': len(nodes), 'edgeCount': len(edges),
                      'nodes': nodes[:300], 'edges': edges[:600], 'truncated': len(nodes) > 300 or len(edges) > 600}, ensure_ascii=False))

if __name__ == '__main__': main()
