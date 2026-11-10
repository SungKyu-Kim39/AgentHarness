# L-Vibe offline adaptation

Upstream: https://github.com/affaan-m/ECC/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b/skills/cpp-testing

Commit: d2ef2680594f9a17526a6e1a2e18b3d242c5d17b

License: MIT; see LICENSE. Original author attribution and license are retained. Adaptations by L-Vibe contributors are MIT.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 기존 테스트 프레임워크와 컴파일러를 우선한다. GoogleTest·CMake·sanitizer는 런타임에 포함됐다는 뜻이 아니다. 반입된 로컬 패키지만 사용하고 FetchContent나 자동 패키지 복구로 다운로드하지 않는다. 실제 테스트 실행기가 없으면 테스트 코드와 실행 계획만 제안하고 미실행으로 기록한다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream a92fb5da9b7e3cd1b4dee185b3eb9d0a55352af6396bf996d2eef72d683784df; bundled e5e6778715a9ca1c5c092d7c33d2c126662d6eeb6431a1e81ebafdffb6b6b62c
