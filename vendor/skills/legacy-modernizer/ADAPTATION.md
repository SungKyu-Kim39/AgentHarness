# L-Vibe offline adaptation

Upstream: https://github.com/Jeffallan/claude-skills/tree/078a25cc5bfd8011459be7b91d004e900c1d02d3/skills/legacy-modernizer

Commit: 078a25cc5bfd8011459be7b91d004e900c1d02d3

License: MIT; see LICENSE. Original author attribution and license are retained. Adaptations by L-Vibe contributors are MIT.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 기존 동작의 특성화 테스트·의존성·플랫폼 제약부터 확인한다. 웹 트래픽 전환·마이크로서비스·80% 커버리지·상용 모니터링을 일률적으로 요구하지 않는다. 임베디드/VxWorks→Windows 포팅은 스레드·스케줄링·엔디언·정렬·소켓·시간·파일 경로·ABI와 롤백을 검토한다. 독점 SDK는 자동 반입하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 3214e018c4aeedb5a4710f24979fef8f959a799ebb8888288e80dbe6bd2f7a1f; bundled b4a8d5045b06d2e3d299ccdd49de631e68701aa6e6847a73e87f7254edfcb127
- references/legacy-testing.md: upstream da01c4b6240ad43b1994bae819e1de0cf9c9a44db8522f5f674c9cb27d7bcfd0; bundled 603620a10622b2c32f3bd7ec8eff60f91dd561d1e2ae6c783b537d2e7092562a
