# L-Vibe offline adaptation

Upstream: https://github.com/Jeffallan/claude-skills/tree/078a25cc5bfd8011459be7b91d004e900c1d02d3/skills/cpp-pro

Original authors: Jeffallan/claude-skills contributors

Commit: 078a25cc5bfd8011459be7b91d004e900c1d02d3

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by L-Vibe contributors.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 먼저 실제 컴파일러·SDK·C++ 표준·ABI·예외/RTTI 정책을 조사한다. C++20/23, concepts, GCC 플래그, sanitizer를 기존 프로젝트에 강제하지 않는다. VxWorks 지원 유지 여부가 미결이면 해당 변경만 보류하고 분석은 계속한다. compile_commands.json과 SDK 헤더가 없으면 의미 분석의 정확도 제한을 밝힌다. MSVC/VxWorks에서 지원하지 않는 검증을 실행했다고 기록하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 53017f862c526df6080210a1a00e6678c2cd5382b5d1a51026bf3b0bde7f7ed2; bundled a769488c5a0e0d6d40cc3e4185e9ba9e4385520f829bf4417aaf1c9a6199f8c6
- references/build-tooling.md: upstream 337ae8b622628fafae86f89d914561ee6176b8d74073db2d5580e91ddd240f30; bundled dbab0e785275d5c592379e5c8483f45a2db98920e8ea0d87231c076a563e568e
