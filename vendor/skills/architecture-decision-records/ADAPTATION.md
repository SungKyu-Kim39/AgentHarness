# Ned offline adaptation

Upstream: https://github.com/wshobson/agents/tree/9c61ab243def98f72da12abd41cfcf5bcd91af9d/plugins/documentation-generation/skills/architecture-decision-records

Original authors: wshobson/agents contributors

Commit: 9c61ab243def98f72da12abd41cfcf5bcd91af9d

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 실제 범위·호환성·데이터 보존에 영향을 주는 결정만 짧게 기록한다. 기존 Conductor spec/plan·ADR을 재사용한다. 팀 리뷰·알림·티켓 생성은 사용자가 요구하거나 기존 팀 정책이 있을 때만 다루며 메시지를 자동 전송하지 않는다. ADR 파일 생성·상태 변경은 승인된 프로젝트 편집이다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 79059f17da8b20cdf27327f6de0ea005c73c2c442f48f70688abca4c77cb6f8f; bundled 3a5eb5515131a56ddd6be969ae1338960e24f0e65729d09276ae53f4cb051235
