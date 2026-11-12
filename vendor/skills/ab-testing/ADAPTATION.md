# Ned offline adaptation

Upstream: https://github.com/coreyhaines31/marketingskills/tree/9d6d7ce8d18eb155dc2f9762435f097e60cdad7c/skills/ab-testing

Original authors: coreyhaines31/marketingskills contributors

Commit: 9d6d7ce8d18eb155dc2f9762435f097e60cdad7c

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 사내 기능/성능/모델 프롬프트 비교에도 가설·무작위 배정 단위·노출·주 지표·가드레일·MDE·표본 수·중지 규칙을 명시한다. 같은 문제를 여러 번 평가하면 짝지음/클러스터를 고려한다. SRM과 누락·교차 노출을 검사하고 사후 세그먼트는 탐색으로 표시한다. 클라우드 분석·기능 플래그·온라인 계산기를 연결하지 않는다. 실험 실행/출시/기록 변경은 별도 승인 대상이며 마케팅 목표·실험 횟수를 일률적으로 강제하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 938a9a9246c6b05657f509e7ab181f1c961dc14f9dcb5d452c574d3e44a39be2; bundled ab3c2d2f057402ac28e9118ad2794c428dfbf8606148cc7d1ff121930235b3ad
- references/sample-size-guide.md: upstream 53525ddf0e904477262dc3dbc89d4bd4205f2e07d655616de91e22a310f768c4; bundled 973f89aab0991fb3aaa7e8092f3127d269a3d73d2df4d624310cd6eb1abe55b5
- references/test-templates.md: upstream 761a40b9de8d16f18fa7f60b59e77aa749607ac8014af43e0b022f47fa87c812; bundled 42b6cd49ab1dc5137bd09e4fec145dabeace3e53784d6548e2a48752d85590ca
