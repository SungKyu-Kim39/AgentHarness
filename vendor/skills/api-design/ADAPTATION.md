# L-Vibe offline adaptation

Upstream: https://github.com/affaan-m/ECC/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b/skills/api-design

Commit: d2ef2680594f9a17526a6e1a2e18b3d242c5d17b

License: MIT; see LICENSE. Original author attribution and license are retained. Adaptations by L-Vibe contributors are MIT.

Modified for L-Vibe on 2026-11-10: static documents only; Desktop frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 실제 사내 API 계약과 서버 제약을 먼저 읽는다. 예제는 로컬 코드 설계 참고이며 외부 API 호출·배포·인증 설정 권한을 부여하지 않는다. 호환성·입력 검증·인증/인가·오류 응답·재시도/멱등성을 확인하고 키와 개인정보를 예제·로그에서 제거한다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream 250e464413a13c0eb93cc73447b423df1f9aa8e4f80e5e68c41f895b2c33e352; bundled 2493203a6f5de0cd5ba3ff6cd362e21f9d24c011163c4643b0218ce8003c4009
