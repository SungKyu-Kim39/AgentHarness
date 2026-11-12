# Ned offline adaptation

Upstream: https://github.com/Jeffallan/claude-skills/tree/078a25cc5bfd8011459be7b91d004e900c1d02d3/skills/cpp-pro

Original authors: Jeffallan/claude-skills contributors

Commit: 078a25cc5bfd8011459be7b91d004e900c1d02d3

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 먼저 실제 컴파일러·SDK·C++ 표준·ABI·예외/RTTI 정책을 조사한다. C++20/23, concepts, GCC 플래그, sanitizer를 기존 프로젝트에 강제하지 않는다. VxWorks 지원 유지 여부가 미결이면 해당 변경만 보류하고 분석은 계속한다. compile_commands.json과 SDK 헤더가 없으면 의미 분석의 정확도 제한을 밝힌다. MSVC/VxWorks에서 지원하지 않는 검증을 실행했다고 기록하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 53017f862c526df6080210a1a00e6678c2cd5382b5d1a51026bf3b0bde7f7ed2; bundled 8b8dad8673688aff30902bfb8f6f7df3c227927441f9ceeb81b1071e42dcff50
- references/build-tooling.md: upstream 337ae8b622628fafae86f89d914561ee6176b8d74073db2d5580e91ddd240f30; bundled e35a9c60f5f99fefd48c1db44c5ef68c6d1c93122ac8ad64c4b3ba0869551b71
