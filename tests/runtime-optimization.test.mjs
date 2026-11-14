import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('pure SDK packing preserves exact module bytes, Python imports, metadata and path-sensitive/native packages',()=>{
 const result=execFileSync('python3',['-I','-B','-c',String.raw`
import importlib.util, json, pathlib, py_compile, subprocess, sys, tempfile, zipfile
spec=importlib.util.spec_from_file_location('optimizer','scripts/optimize-runtime.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
with tempfile.TemporaryDirectory(prefix='ned-pack-') as directory:
 root=pathlib.Path(directory)
 for name in ['volcenginesdkfixture','volcenginesdknative','volcenginesdkassets','volcenginesdkpath']:
  (root/name).mkdir();(root/name/'__init__.py').write_text('answer=42\n')
 (root/'volcenginesdkfixture/nested.py').write_text('value="preserved"\n')
 (root/'volcenginesdknative/module.pyd').write_bytes(b'MZ-not-loaded')
 (root/'volcenginesdkassets/data.json').write_text('{}')
 (root/'volcenginesdkpath/__init__.py').write_text('where=__file__\n')
 (root/'fixture.dist-info').mkdir();(root/'fixture.dist-info/METADATA').write_text('Name: fixture\n')
 py_compile.compile(str(root/'volcenginesdkfixture/nested.py'),doraise=True)
 caches=module.remove_source_caches(root);assert caches['files']==1 and caches['canonicalSourcePreserved']
 report=module.pack_sdks(root)
 assert report['files']==2 and report['everySourceByteVerified']
 assert not (root/'volcenginesdkfixture').exists()
 for name in ['volcenginesdknative','volcenginesdkassets','volcenginesdkpath','fixture.dist-info']:assert (root/name).exists()
 code='import site;site.addsitedir('+repr(str(root))+');from volcenginesdkfixture import answer;from volcenginesdkfixture.nested import value;assert answer==42 and value=="preserved";print("ZIP_IMPORT_OK")'
 assert subprocess.check_output([sys.executable,'-I','-S','-c',code],text=True).strip()=='ZIP_IMPORT_OK'
 with zipfile.ZipFile(root/'ned-sdk-code.zip') as packed:assert packed.read('volcenginesdkfixture/nested.py')==b'value="preserved"\n'
 print('LOSSLESS_SDK_ZIP_OK')
`],{encoding:'utf8'});
 assert.match(result,/LOSSLESS_SDK_ZIP_OK/);
});
