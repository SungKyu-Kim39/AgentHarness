import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

test('Windows TCP socketpair permits asyncio self-pipes while other loopback and external connections remain blocked', () => {
  const script = String.raw`
import asyncio, importlib.util, json, os, socket, sys
spec = importlib.util.spec_from_file_location('l_vibe_launch', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# Model Windows CPython's fallback rather than Linux's AF_UNIX socketpair.
def windows_fallback(family=None, type=socket.SOCK_STREAM, proto=0):
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.bind(('127.0.0.1', 0))
    listener.listen(1)
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        client.connect(listener.getsockname())
        server, peer = listener.accept()
        return server, client
    except BaseException:
        client.close()
        raise
    finally:
        listener.close()
socket.socketpair = windows_fallback

gateway = socket.socket()
gateway.bind(('127.0.0.1', 0))
gateway.listen(1)
unapproved = socket.socket()
unapproved.bind(('127.0.0.1', 0))
unapproved.listen(1)
original_name = os.name
try:
    os.name = 'nt'
    module.restrict_python_network({'embedding': {'dense': {'api_base': 'http://127.0.0.1:' + str(gateway.getsockname()[1]) + '/v1'}}})
finally:
    os.name = original_name

left, right = socket.socketpair()
try:
    assert left.getpeername() == right.getsockname()
    assert right.getpeername() == left.getsockname()
    left.sendall(b'private self-pipe')
    assert right.recv(64) == b'private self-pipe'
finally:
    left.close()
    right.close()

loop = asyncio.new_event_loop()
try:
    loop.call_soon(loop.stop)
    loop.run_forever()
finally:
    loop.close()

client = socket.socket()
try:
    client.connect(gateway.getsockname())
    accepted, _ = gateway.accept()
    accepted.close()
finally:
    client.close()

blocked = 0
for address in [unapproved.getsockname(), ('198.51.100.1', 443)]:
    for method in ['connect', 'connect_ex']:
        client = socket.socket()
        try:
            try:
                getattr(client, method)(address)
                raise AssertionError('Unapproved connection escaped the policy')
            except PermissionError:
                blocked += 1
        finally:
            client.close()
try:
    socket.getaddrinfo('example.com', 443)
    raise AssertionError('Unapproved DNS escaped the policy')
except PermissionError:
    blocked += 1
unapproved.setblocking(False)
try:
    unapproved.accept()
    raise AssertionError('Unapproved listener received a connection')
except BlockingIOError:
    pass
gateway.close()
unapproved.close()
print(json.dumps({'asyncio': 'ready', 'socketpair': 'verified', 'blocked': blocked, 'gateway': 'allowed'}))
`;
  const result = JSON.parse(execFileSync('python3', ['-I', '-B', '-c', script, path.resolve('scripts/openviking-launch.py')], { encoding: 'utf8', timeout: 15000 }));
  assert.deepEqual(result, { asyncio: 'ready', socketpair: 'verified', blocked: 5, gateway: 'allowed' });
});
