import {execFileSync} from 'node:child_process';
import path from 'node:path';

export function nedSigning(env = process.env) {
  const tool = env.NED_SIGNTOOL;
  const thumbprint = env.NED_SIGN_THUMBPRINT;
  const timestamp = env.NED_SIGN_TIMESTAMP_URL;
  if (!tool && !thumbprint && !timestamp) return undefined;
  if (process.platform !== 'win32' || !tool || !path.isAbsolute(tool) || /["'\r\n$%!]/.test(tool) ||
      !/^[a-f0-9]{40}$/i.test(thumbprint ?? '') || !/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?\/[a-z0-9/_-]*$/i.test(timestamp ?? ''))
    throw Error('Set the Windows SignTool path, certificate thumbprint and approved HTTPS timestamp URL.');
  const options = ['sign','/fd','SHA256','/sha1',thumbprint,'/tr',timestamp,'/td','SHA256'];
  const verify = file => execFileSync(tool, ['verify','/pa','/all',file], {stdio:'inherit'});
  return {
    nsis: ['-DNED_SIGNTOOL=' + tool, '-DNED_SIGN_ARGS=' + options.join(' ')],
    verify,
    sign(file) { execFileSync(tool, [...options,file], {stdio:'inherit'}); verify(file); },
  };
}
