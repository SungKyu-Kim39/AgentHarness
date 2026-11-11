# L-Vibe 0.2.3 — ASCII package paths

0.2.2 TGZ를 일부 Windows 압축 도구로 해제했을 때 한글 파일명이 깨지는 문제를 수정한다. `GETTING_STARTED.txt`, `VALIDATION_REPORT.md`, `READINESS.json`을 사용하며 제품이 배포하는 파일·폴더 이름은 printable ASCII로 제한한다. 한국어 문서 내용과 UI 문구는 유지한다.

`package-paths.mjs`가 배포 디렉터리·Git 소스 트리·실제 tar 헤더를 검사한다. EXE를 추출한 파일·폴더와 ASAR 내부 경로도 검사한다. 누락된 ASCII 검사 기록이나 이전 버전 audit로 새 TGZ를 생성할 수 없다. 비 ASCII 경로가 발견되면 생성/게시 단계가 실패한다.

이 문서는 빌드와 실제 EXE/TGZ 검사를 마친 뒤 OS·명령·해시·파일 수를 갱신한다. Windows 일반 사용자 실행과 실제 사내 모델 수용은 별도이며 `releaseReady`는 false다. 0.2.2 기준 검증은 [이전 기록](validation-0.2.2.md)에 보존한다.
