// Backport only the compiled snapshot block; retain each pinned host's other code/version.
const start = '        const reply = await ctx.client.call(name, fixed, signal);\n';
const end = '          const refs = /* @__PURE__ */ new Map();';
const old = String.raw`        const reply = await ctx.client.call(name, fixed, signal);
        if (name === "desktop_snapshot" && !reply.isError) {
          const data = envelope(reply).data;
          if (!data?.window || !selected || !same(data.window, selected) || !permittedDesktopWindow(data.window)) throw new Error("\uAD00\uCC30\uB41C \uCC3D\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
`;
export function snapshotBytePatch(original, compiled) {
  original=Buffer.from(original).toString('utf8');compiled=Buffer.from(compiled).toString('utf8');
  const before=compiled.indexOf('        if (name === "desktop_snapshot") ctx.refs.clear();\n');
  const after=compiled.indexOf(end,before);
  if(before<0||after<0||compiled.indexOf(start)!==before+'        if (name === "desktop_snapshot") ctx.refs.clear();\n'.length)throw new Error('Unexpected fixed snapshot layout');
  const replacement=compiled.slice(before,after);
  if(!replacement.includes('Object.hasOwn(data.window, key)')||!replacement.includes('same(after, selected)'))throw new Error('Missing snapshot identity checks');
  if(original.split(old).length!==2)throw new Error('Unexpected original snapshot layout');
  return Buffer.from(original.replace(old,replacement));
}
