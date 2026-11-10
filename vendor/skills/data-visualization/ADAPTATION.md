# L-Vibe offline adaptation

Upstream: https://github.com/anthropics/knowledge-work-plugins/tree/e605d8ddbfb688da57dfaaceebd93f12a64ef1d3/data/skills/data-visualization

Original authors: anthropics/knowledge-work-plugins contributors

Commit: e605d8ddbfb688da57dfaaceebd93f12a64ef1d3

License: Apache-2.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under Apache-2.0; the application license does not replace the upstream license. Modifications by L-Vibe contributors.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 실제 로컬 결과에 맞는 차트·축·단위·표본·신뢰 구간을 선택한다. matplotlib·seaborn·pandas·plotly·브라우저가 설치됐다고 가정하지 않는다. 실행기가 없으면 코드와 시각화 명세만 제안한다. HTML은 로컬 JS·글꼴·이미지만 사용하며 CDN·외부 지도·원격 렌더링을 사용하지 않는다. 산출물 저장은 승인된 프로젝트 편집/실행 대상이다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 5811e8b3547cda6bc8af118aaf0d7589e8861cdc9facce6372dc78aea99ab87d; bundled a85ed1a8e099c3302823ec8a93e87ce99cff01b97f31866e0b58884944d60b0c
