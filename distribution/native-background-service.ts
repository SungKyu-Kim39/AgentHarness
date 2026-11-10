import { Context, Effect, Layer } from 'effect';
import { SidecarChanged } from '../../shared/ipc-rpc/events';
import { emitIpcEvent } from '../ipc-events';
import { getMainWindows } from '../windows';
import { Shutdown } from '../lifecycle/shutdown';
import { getRuntime } from '../l-vibe-control.mjs';
import { DesktopCli } from './desktop-cli';
import { SidecarCredentials } from './sidecar-credentials';

export * as BackgroundService from './background-service';
export interface Interface {
  readonly connection: Effect.Effect<SidecarCredentials.Data>;
  readonly reconnect: Effect.Effect<SidecarCredentials.Data>;
}
export class Service extends Context.Service<Service, Interface>()('opencode/desktop/BackgroundService') {}

export const layer = Layer.effect(Service, Effect.gen(function* () {
  const cli = yield* DesktopCli.Service;
  const shutdown = yield* Shutdown.Service;
  const native = getRuntime();
  const connection = Effect.gen(function* () {
    const executable = yield* cli.resolve;
    const data = yield* Effect.promise(() => native.connection(executable.command));
    SidecarCredentials.set(data);
    getMainWindows().forEach(win => emitIpcEvent(win.webContents, new SidecarChanged({ url: data.url })));
    return data;
  });
  const stop = Effect.promise(() => native.close());
  const remove = yield* shutdown.add({ stop, resume: Effect.void });
  yield* Effect.addFinalizer(() => stop.pipe(Effect.andThen(Effect.sync(remove))));
  return Service.of({ connection, reconnect: connection });
}));
