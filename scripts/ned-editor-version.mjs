import {readFile} from 'node:fs/promises';
import path from 'node:path';
/** Component artifacts and visible About text must match the requested product version. */
export async function editorVersion(root) {
 const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
 const revision=process.env.NED_BUILD_REVISION || '';
 if(!/^0\.3\.(8|9|10|11)$/.test(version)||revision&&!/^rebuild[1-9][0-9]*$/.test(revision))throw Error('Unreviewed editor version');
 const artifactVersion=version+(revision?'-'+revision:'');
 return {version,revision,artifactVersion,binary:`Ned-editor-${artifactVersion}.exe`,archive:`zed-ned-editor-source-v1.28.1-${artifactVersion}.tar.gz`,metadata:`build-${artifactVersion}.json`,about:`Ned ${version}`+(revision?' · rebuild '+revision.slice(7):'')};
}
