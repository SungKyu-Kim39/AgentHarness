# Ned offline adaptation

Upstream: https://github.com/anthropics/knowledge-work-plugins/tree/e605d8ddbfb688da57dfaaceebd93f12a64ef1d3/data/skills/validate-data

Original authors: anthropics/knowledge-work-plugins contributors

Commit: e605d8ddbfb688da57dfaaceebd93f12a64ef1d3

License: Apache-2.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under Apache-2.0; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 사용자가 제공한 로컬 분석·질의·실제 결과의 재현성과 결론을 검토한다. 원본 데이터와 실행기가 없으면 검토 범위와 재계산 미실행을 밝힌다. 집계 단위·조인 증폭·분모·기간·시간대·선택 편향·불확실성을 점검한다. 자료를 외부 서비스나 다른 저장소에 자동 전송하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 1e424822043480375b80aef9416227b1c8083af749ca536568716265f79ca54b; bundled b91b81561869becde2f1c55e889ebc6cced145c3a368000c652be79b3b968f2d
