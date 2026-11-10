# L-Vibe offline adaptation

Upstream: https://github.com/anthropics/knowledge-work-plugins/tree/e605d8ddbfb688da57dfaaceebd93f12a64ef1d3/data/skills/explore-data

Original authors: anthropics/knowledge-work-plugins contributors

Commit: e605d8ddbfb688da57dfaaceebd93f12a64ef1d3

License: Apache-2.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under Apache-2.0; the application license does not replace the upstream license. Modifications by L-Vibe contributors.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 승인된 프로젝트의 CSV·JSON·스키마와 사용자가 제공한 결과부터 조사한다. 데이터의 단위·키·중복·결측·시간대·표본 범위를 확인한다. 커넥터 연결이나 데이터웨어하우스 계정을 요구하지 않는다. Excel/Parquet 파서와 SQL/Python 실행기는 별도 전제이며 없으면 코드/질의 제안으로 한정한다. 임계값은 도메인에 맞는 휴리스틱으로 설명하고 계산하지 않은 수치는 만들지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream af7590fa616360259da712b5ede5f79b817beb854c47a465f95774354988e8a2; bundled 42c216f3d65d663609e6fb6fb8c4f5ccc48d10f0f74597ffaa6bdfea64bc4cd4
