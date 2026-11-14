## agent-desktop 1.2.0

Vercel Labs contributors, Apache-2.0. Pinned commit: `2b0a7334fc111730454b726e6800aa41cdafc093`. Native binaries are unmodified. Windows VCRUNTIME140.dll is copied from the already pinned CPython standalone distribution, with LICENSE.CPython-Windows.txt; its Microsoft terms remain separate from Apache-2.0. The matching source archive and original license are installed under `resources/runtime/windows-x64/agent-desktop/`. Ned exposes a guarded subset of MCP tools and adapted static desktop/Windows guidance. See `agent-desktop-lock.json` and each skill's `ADAPTATION.md`. No upstream shell hooks or online npm bootstrap are installed.

# Ned distribution notices

Ned host source uses the root MIT license. Zed v1.28.1 is primarily GPL-3.0-or-later with marked Apache-2.0 components. Include its matching source and GPL/Apache/third-party notices in the offline distribution. Generated Ned wordmark assets replace the active LIG icon. The following earlier component notices remain applicable to the shared runtimes; they do not relicense the whole bundle as MIT. See [license policy](docs/license-policy.md).

# L-Vibe third-party licensing

The root MIT license covers L-Vibe-authored code. Bundled software, skills,
libraries, browser/runtime binaries, trademarks and logos retain their own terms.
The complete distribution is not relicensed under MIT.

For the pinned Windows x64 0.2.3/0.2.4/0.2.5/0.2.6 candidates, see
[the license policy review](docs/license-policy.md). It identifies the actual
packaged notices, corresponding-source archives and unresolved redistribution
checks. OpenViking is AGPL-3.0; Serena is GPL-3.0-or-later; MinGit is GPL-2.0;
some libraries are LGPL; the adapted differential-review skill is CC-BY-SA-4.0.
Google Chrome and Microsoft runtime files have separate terms.

The 0.2.5 offline tokenizer data preserves the tiktoken MIT notice and the
original GPT-2 Modified MIT notice. See tokenizer-runtime-lock.json and the
tokenizers directory for the fixed data hashes and package-mirror provenance.

Preserve the license and attribution documents in the TGZ and installed
resources, including per-package dist-info notices, REA third-party notices,
and skill LICENSE/ADAPTATION files. Source inclusion and hash verification alone
are not a certification of complete license compliance.

The old `vendor/THIRD_PARTY_NOTICES.md` describes the historical 0.1 prototype;
use the current policy, pinned locks and packaged originals for Desktop.

0.2.6의 앱 런처는 고정 OpenViking OVPack helper의 소스를 해시로 확인하고 가상 사용자 컨테이너 부모 생성만 어댑터로 보완한다. SDK의 소유자·대상·충돌·archive 검사는 유지하며 원본 SDK 파일은 변경하지 않는다. 어댑터 소스는 L-Vibe 소스 archive, 원본 SDK의 AGPL 대응 소스는 기존 배포 묶음에 포함한다. [이관 검증](docs/validation-0.2.6.md)을 참고한다.

Ned 0.3.3 includes jsonc-parser 3.3.1 (Microsoft, MIT) for comment-preserving editor preference updates. Its license is installed in ned/licenses/jsonc-parser-MIT.txt. The bundled Zed Windows icon resource is replaced with the Ned icon; executable code and vendor version metadata remain unchanged. The original vendor archive/source are pinned; the modification script and Ned icon are in the Ned corresponding source archive. The modified resource image is unsigned, and Zed retains its component license.


## Ned 0.3.7 reviewed static skill additions

The 30 additions are selective offline host adapters, not executable plugin installations. ECC, Matt Pocock, gstack, blader/humanizer, epoko77-ai/im-not-ai and coreyhaines31/marketingskills retain their MIT notices. Unslop retains CC-BY-4.0 attribution to Damir Sokolovsky (@heydamir). Selected GoogleChrome Modern Web Guidance documents retain CC-BY-4.0 attribution and the separate Apache-2.0 code notice. OpenAI Game Studio declares MIT in its fixed plugin manifest; that declaration, author attribution and standard MIT terms accompany its adapters. See each packaged LICENSE/ADAPTATION.md and reviewed-skills-lock.json for exact sources, revisions and hashes.

Generated pure-Python SDK modules are losslessly ZIP-packed; copyright/license metadata remains intact. Non-executable corresponding-source archives moved out of installed runtime directories accompany the same offline TGZ under source/. The installer records original paths, hashes and the new runtime manifests in ned/runtime-optimization.json. Recipients of a standalone EXE must receive the corresponding offline source handover as well.
