# L-Vibe offline adaptation

Upstream: https://github.com/wshobson/agents/tree/9c61ab243def98f72da12abd41cfcf5bcd91af9d/plugins/developer-essentials/skills/error-handling-patterns

Original authors: wshobson/agents contributors

Commit: 9c61ab243def98f72da12abd41cfcf5bcd91af9d

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by L-Vibe contributors.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 기존 예외/Result/오류 코드 정책과 ABI를 존중한다. 로그의 키·토큰·개인정보를 제거한다. 재시도에는 횟수·기한·멱등성·취소를 둔다. 파일 수정·명령의 승인이나 중지 상태가 불명확하면 자동 재시도하지 않는다. 외부 결제/네트워크 예제는 패턴 설명이며 연결할 서비스가 아니다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 5fb7f4d995fc05386a8c04b045f96fd3cb652cbd31fd52d78966f86323b373b8; bundled 0213f345282a3818ae5586a2408cb0b9256df0f6b7b7716e8fd7b4a20b1418b1
