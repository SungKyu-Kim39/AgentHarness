# Ned offline adaptation

Upstream: https://github.com/affaan-m/ECC/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b/skills/codebase-onboarding

Original authors: affaan-m/ECC contributors

Commit: d2ef2680594f9a17526a6e1a2e18b3d242c5d17b

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 호스트의 승인된 프로젝트 읽기·검색과 실제 Graphify/REA 결과만 사용한다. 텍스트 검색을 의미 분석으로 표현하지 않는다. 먼저 기존 프로젝트 지침·Conductor 트랙을 읽는다. 온보딩 설명은 대화로 제공하며 CLAUDE.md 등 추가 문서는 요청에 필요할 때만 승인된 편집으로 제안한다. 전역 설정·개인 설정·엔진 권한을 수정하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream ef88873a4b0d0fe155c0a196ffecd5c7b5e28edd00fbbdb5c1fd2ca8fd0eb6f0; bundled 957db18fffe1d866b38dabb145ec41cda0cfbf8f858290c52e6032123e4ddce5
