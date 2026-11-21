> 이 문서는 당시 L-Vibe의 배포·검토 기록입니다. 버전·경로·해시는 당시 값을 유지합니다. 최신 구성은 [Ned 0.3.7 검증 기록](validation-0.3.7.md)을 참고하세요.

# Windows 오프라인 설치 후보 검증 — 2026-11-10 UTC

대상은 L-Vibe 0.2.0 검증 후보입니다. 런타임 코드 체크포인트는 `137db3d`이며 OpenCode Desktop/CLI는 v2.2.6, upstream 커밋 `dc2ffcf8bf26f9e669b6aa22b95f50e12be15e06`으로 고정했습니다. 아래 결과는 Windows 실환경 검증을 대체하지 않습니다.

## 환경과 명령

- 실행 환경: Debian 13, Linux 6.18.57 x86_64. 빌드 도구: Node 24.22.1, Bun 1.4.4, Python 3.12.14.
- 목표 런타임: Windows x64, Electron 44.9.1, CPython 3.12.16, OpenViking 0.5.4, Graphify 0.9.105, REA 6.8.0.
- 모델 endpoint: 테스트 프로세스의 localhost OpenAI 호환 합성 서버. 실제 사내 주소·키로 요청하지 않았습니다.
- `npm run verify`: 타입 검사·33개 테스트·고정 원본/overlay 검증 통과. 기존 1.19.5 원형의 반복 감지/재출력 테스트도 이 수에 포함되며, 해당 기능의 새 Desktop 이관 성공을 뜻하지 않습니다.
- 실제 Desktop 패키지에서 `bun run typecheck`: 2개 프로젝트, 2,549개 파일, 타입 오류 없음.
- `node scripts/desktop.mjs build`: 공식 Desktop 기반 번들 컴파일 통과.
- `node scripts/desktop.mjs package`: per-user NSIS 설치 EXE 생성 통과. uninstaller를 설치 시 생성하므로 빌드 PC에서 Windows stub을 실행하지 않습니다.

## 실제 실행한 연동

- v2 엔진의 localhost 임의 포트·인증·호스트 종료 후 프로세스/포트 종료.
- OpenCode providers 형식의 APIKey 별칭, model 별칭과 서버 modelID 분리, capabilities·cost 보존.
- 실제 v2 세션에서 모델 B → A 전환 후 요청 modelID 변경. 이 검증을 강화한 focused native suite 4개도 별도 통과했습니다.
- v2 모델 → MCP → 호스트 승인 → 파일 변경 및 재읽기. 승인 대기 중 중지 후 늦은 승인이 도착해도 파일을 변경하지 않음.
- 실제 OpenViking 서비스 시작·승인된 텍스트 색인·검색·다른 프로젝트 URI 거절·종료. 임베딩과 문서 설명 요청은 설정한 테스트 endpoint만 사용했습니다.
- 실제 Graphify AST 그래프 추출과 morluto/rea Python bytecode 정적 분석. 대상 코드를 실행하지 않았습니다.

## 설치본 무결성

- `L-Vibe-0.2.0-win-x64.exe`: **646,905,986 bytes**.
- SHA-256: `70659a85c790a2dc639528959ed5a6a2f34d159ba351f2a508458e4c10154e04`.
- `7za t` 결과: NSIS-3 Unicode / Deflate / Solid, **Everything is Ok**, 72,942개 파일, 해제 크기 1,950,351,103 bytes.
- 설치 EXE manifest의 실행 권한은 `asInvoker`, 실제 앱 PE machine은 AMD64로 확인했습니다. 설치 실행으로 일반 사용자 동작을 확인한 결과는 아닙니다.
- 설치 입력의 OpenViking/Python/Graphify 파일 63,060개와 REA 파일 9,019개를 각각 manifest SHA-256과 전수 대조했습니다.
- 앱 전용 Windows CLI SHA-256: `d55839bfc180fd573341265c750eaee72c3ebb2e57f3e2b3eca9cf3449b93507`. 공식 npm 아카이브에서 검증한 원본과 일치합니다. 사용하지 않는 구형 엔진은 설치 입력에서 제외했습니다.
- Python 의존성은 344개 Windows wheel로 고정했습니다. Linux pip의 Windows marker 누락을 별도로 보완했습니다.
- REA가 사용할 Electron RunAsNode fuse는 앱 바이너리에서 enabled로 확인했습니다.
- 실제 키·모델 가중치·개인 설정·개발 캐시는 설치 입력에 포함하지 않습니다. 검토 목록에 없는 과거 스킬 사본은 소스 묶음에서도 제거했습니다.

## 남은 실환경 검증

Windows 10/11 일반 사용자 설치·첫 실행·업데이트·제거·ACL·DPAPI·자식 프로세스 종료·DNS/TCP 관찰 및 실제 사내 Qwen 서버 검증은 아직 수행하지 않았습니다. Wine 런타임 검사는 kernel32.dll 로더 오류로 완료하지 못했습니다.

Serena/clangd 의미 분석, 승인된 명령 실행, 새 Desktop의 반복 감지·도구 없는 답변 재출력, 호스트 스냅샷의 세션 비교 UI는 후속 구현입니다. `distribution/readiness.json`의 releaseReady는 false로 유지합니다. 이 설치 후보를 1.0 완료본 또는 폐쇄망 실환경 인증 완료본으로 취급하지 않습니다.
