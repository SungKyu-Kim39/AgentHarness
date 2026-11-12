# Ned

Ned는 사내 Qwen 모델에 **Zed 편집기, 전용 OpenCode 엔진, Aegis·Conductor·OpenViking과 오프라인 도구**를 연결하는 Windows x64 바이브 코딩 작업 환경이다. 개별 도구의 설치·설정을 직원에게 맡기지 않고 한 프로그램으로 제공하는 것을 목적으로 한다.

[소개와 활용](docs/ned-introduction.md) · [설치 안내](docs/offline-setup.md) · [모델 설정](docs/model-controls.md) · [구성과 승인 경계](docs/architecture.md) · [라이선스](docs/license-policy.md) · [개발 인계](HANDOFF.md)

## 현재 상태

0.3.0은 Zed 기반으로 전환하는 검증 후보이다. 새 실행기·ACP·저장하지 않은 편집 내용 보호·기존 데이터 보존 이관을 구현하였으며, 실제 OpenCode 엔진을 사용하는 Linux 연동 검사에서 확인하였다. Windows 설치·편집기 화면·실제 MSBuild 실행·사내 모델과 외부망 차단 수용은 별도 확인 대상이다. [검증 상태](docs/validation-0.3.0.md)를 따른다.

검은 배경에 흰색 굵은 Ned 글자의 새 아이콘을 사용한다. 번들 Zed는 구성 요소의 원래 이름을 유지한다. [Ned 설치 EXE·반입 TGZ 다운로드](downloads/README.md)에서 새 후보와 이전 L-Vibe 0.2.7 기록을 구분한다.

## 사용하는 흐름

1. 반입용 TGZ를 압축 해제하고 포함된 Ned 설치 EXE를 실행한다.
2. 최초 설정 JSON에 사내 LLM과 단일 임베딩 모델을 입력한다.
3. Ned를 실행하여 프로젝트 폴더를 선택한다.
4. Zed에서 코드를 직접 편집·저장하고, **Ctrl+Shift+A**로 Ned AI 대화를 연다.

AI 수정은 별도 승인과 충돌 확인을 거친다. 저장하지 않은 편집 내용이 있으면 먼저 Ctrl+S로 저장한다. VS2017/2019가 있으면 AI가 설치된 MSBuild와 프로젝트 구성을 조사한 뒤 승인을 받아 빌드할 수 있다. SDK·모델 가중치와 개발 도구를 직원 PC에서 자동 설치하지 않는다.

여러 LLM과 모델별 한도·thinking 변형을 중앙 JSON으로 설정한다. 모델 서버 대기열을 고려하여 응답 대기에 기본 시간 제한을 두지 않는다. OpenViking은 앱과 함께 시작·종료하며, 기본 스킬 34개를 자동 등록한다. 개인 대화는 자동 업로드하지 않는다.

## 개발과 검증

`npm run build`는 Ned 실행기와 ACP 어댑터를 빌드한다. 고정 OpenCode 소스·Bun 의존성과 Windows 오프라인 런타임이 먼저 필요하다. [빌드·인계 절차](HANDOFF.md)를 따른다. 완전한 Windows 수용 전에는 1.0 완료 또는 폐쇄망 검증 완료로 표시하지 않는다.
