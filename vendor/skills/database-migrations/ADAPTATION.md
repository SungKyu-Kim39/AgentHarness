# Ned offline adaptation

Upstream: https://github.com/affaan-m/ECC/tree/d2ef2680594f9a17526a6e1a2e18b3d242c5d17b/skills/database-migrations

Original authors: affaan-m/ECC contributors

Commit: d2ef2680594f9a17526a6e1a2e18b3d242c5d17b

License: MIT; see LICENSE. Original author attribution and license are retained. This adapted skill and notice are distributed under MIT; the application license does not replace the upstream license. Modifications by Ned contributors.

Modified for Ned on 2026-11-12: static documents only; agent skill frontmatter reduced to name/description; approval/offline boundaries embedded; online installation/download/CI examples and unsupported automatic agent/plugin operations removed where present; local dependency examples substituted; scope and output requirements adapted to user decisions. No upstream executable scripts, hooks, agents or plugins are bundled by this skill.

Specific policy: 대상 DB와 버전을 확인하고 실제 백업·복구 절차를 정한다. 예제 ORM/DB 런타임은 설치되지 않는다. 로컬에 이미 반입된 실행 파일과 의존성만 사용한다. 스키마·데이터 변경, reset, 배포는 명시적 대상·영향·백업·사용자 승인이 필요하다. 자동 복구나 다운그레이드가 가능하다고 추정하지 않는다.

Changed documents (hashes are also retained in the manifest):

- SKILL.md: upstream dad2f1964295eee14a96e06213ce3f60992bbcdc1f37a50c828bbc2e1abd79dd; bundled 9a9218241fa1825ca1ddc2908163487b199a8408416ff144ebc85373317ee84b
