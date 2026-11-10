# L-Vibe offline adaptation

Upstream: https://github.com/trailofbits/skills/tree/e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff/plugins/differential-review/skills/differential-review

Original authors: trailofbits/skills contributors

Commit: e4dd0bb5b15535f7c5a0834187dffba6ac37e4ff

License: CC-BY-SA-4.0; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under CC-BY-SA-4.0; the application license does not replace the upstream license. Modifications by L-Vibe contributors.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 프로젝트 안의 변경 전후·호스트 스냅샷·사용자가 제공한 diff를 근거로 보안 회귀를 조사한다. Git 실행기가 없으면 blame/이력을 실행한 것으로 기록하지 않는다. 실제 호출자·권한·입력·자원 수명과 테스트 근거를 확인하고 분석 한계를 밝힌다. 다른 플러그인·하위 에이전트에 자동 위임하지 않는다. 보고서는 대화로 제공할 수 있고 파일은 요청에 필요할 때 프로젝트 안에 승인된 편집으로 제안한다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream f9af6a8193fc1a9f8ca3c54bb8d19095a5f20c9472ca6d014488bbde50b67da0; bundled dcd1203f29fbea1f309e4d3585809e76dff7e617ca18119db74bc125b1a5e94f
- reporting.md: upstream 0016876dc6f158e926448bff1b6f634796757c7afe09dff177cfe30250724fc4; bundled 02232ac2aafcc0ad0c666ad1bc6688e3aa4032dd48bbc35da959b81a4d1af2be
