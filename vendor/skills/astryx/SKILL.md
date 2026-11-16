---
name: astryx
description: "React 19 UI 제작·컴포넌트 선택·폼·대시보드·접근성·브랜드 테마 및 @astryxdesign 프로젝트를 위한 오프라인 디자인 시스템"
---

# Astryx — Ned offline adaptation

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

1. 프로젝트의 React 버전·빌드 도구·기존 UI 라이브러리를 먼저 확인합니다. Astryx는 React 19 이상입니다. 모든 UI 작업에 의존성 교체를 강제하지 않습니다.
2. REFERENCES.md에서 필요한 컴포넌트·레이아웃·토큰·테마를 고른 뒤 read_skill로 해당 문서를 읽습니다. props와 import 경로를 추측하지 않습니다.
3. 새 프로젝트는 반입 묶음의 astryx/Ned-Astryx-0.7.16-windows-x64.zip을 빈 폴더에 압축 해제해 시작할 수 있습니다. 설치 폴더 resources/ned/astryx에도 같은 압축 파일이 있습니다. BUILD.cmd가 Ned의 Node 모드와 동봉 Windows esbuild로 빌드합니다. 외부 패키지 설치가 필요하지 않습니다. 기존 프로젝트에 덮어쓰지 않습니다.
4. Core reset CSS → component CSS → theme CSS 순서와 Theme provider를 유지합니다. 의미 있는 레이블·키보드·포커스·오류 상태·대비·반응형 동작을 확인합니다. 원격 폰트·아이콘을 추가하지 않습니다.
5. 요구사항에 맞는 실제 컴포넌트를 사용하고 승인된 파일 도구로 수정합니다. 빌드·브라우저 확인 결과와 미확인 사항을 구별해 보고합니다. 기본 Zed Agent에는 이 스킬을 주입하지 않습니다.

라이브러리와 시작 프로젝트를 제공하는 것이며 원본 Astryx CLI·온라인 샌드박스·임의 프로젝트 변환 기능을 설치한 것으로 표현하지 않습니다.
