import { build } from "esbuild";
import { build as vite } from "vite";
await build({
  entryPoints: ["src/main/index.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  outfile: "dist/main/index.cjs",
  external: ["electron"],
  sourcemap: false,
});
await build({
  entryPoints: ["src/preload/index.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  outfile: "dist/preload/index.cjs",
  external: ["electron"],
  sourcemap: false,
});
await vite();
