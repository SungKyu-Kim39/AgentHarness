# Ned offline adaptation

Upstream: https://github.com/anthropics/knowledge-work-plugins/tree/e605d8ddbfb688da57dfaaceebd93f12a64ef1d3/data/skills/statistical-analysis

Original authors: anthropics/knowledge-work-plugins contributors

Commit: e605d8ddbfb688da57dfaaceebd93f12a64ef1d3

License: Apache-2.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under Apache-2.0; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 분석 단위·무작위 배정·독립성·누락·표본 수와 가정을 먼저 확인한다. A/B에서는 SRM·사전 지정한 주 지표/MDE·검정력·효과 크기·신뢰 구간·다중 비교·중지 규칙을 확인한다. 반복 관측과 클러스터를 독립 표본으로 세지 않는다. p값은 귀무가설이 참일 확률이나 결과가 우연일 확률이 아니다. 유의하지 않다는 결과를 동등성 증명으로 표현하지 않는다. 실제 로컬 계산 근거 없이 p값·구간을 생성하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 91a15cfc144efffcd622b09827362a73993a3ff30e3a78114801832477c9f8a0; bundled 64f09a4485f188a1bd61ee924ced6886fecb4e80cc1596e0bf8267dcdc575723
