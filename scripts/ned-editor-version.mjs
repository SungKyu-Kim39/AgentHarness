import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {isGhidraVersion,isValidRevision,pinnedEditorRevision} from './release-policy.mjs';
/** Component artifacts and visible About text must match the requested product version. */
export async function editorVersion(root, {forRelease=false}={}) {
 const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
 const requested=process.env.NED_BUILD_REVISION || '';
 if(!isGhidraVersion(version)||(requested&&!isValidRevision(requested)))throw Error('Unreviewed editor version');
 const revision=forRelease?pinnedEditorRevision(version,requested):requested;
 const artifactVersion=version+(revision?'-'+revision:'');
 return {version,revision,artifactVersion,binary:`Ned-editor-${artifactVersion}.exe`,archive:`zed-ned-editor-source-v1.28.1-${artifactVersion}.tar.gz`,metadata:`build-${artifactVersion}.json`,about:`Ned ${version}`+(revision?' · rebuild '+revision.slice(7):'')};
}
