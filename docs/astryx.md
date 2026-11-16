# Astryx로 UI 만들기

Astryx는 Meta에서 공개한 React 디자인 시스템입니다. 버튼·입력 폼·대화상자·표와 같은 컴포넌트, 레이아웃 규칙, 접근성 가이드와 브랜드 테마를 제공합니다. 데스크톱 프로그램을 조작하는 agent-desktop과 역할이 다릅니다.

Ned 0.3.8 rebuild1은 Astryx 0.7.16의 로컬 참조 문서 281개와 전용 스킬을 제공합니다. Ned Agent에 “React로 사내 업무 대시보드를 만들어 줘” 또는 “Astryx로 이 폼을 개선해 줘”라고 요청하면 관련 스킬을 검토하도록 합니다. 기존 프로젝트가 React 18이나 다른 프레임워크를 사용하면 자동으로 프레임워크를 바꾸지 않고 호환성을 먼저 확인합니다.

새 UI 프로젝트를 시작하려면 반입용 TGZ 안의 `astryx/Ned-Astryx-0.7.16-windows-x64.zip`을 빈 폴더에 압축 해제합니다. 같은 파일은 설치 폴더의 `resources/ned/astryx`에도 있습니다. 압축 해제한 `Ned-Astryx` 폴더를 Ned에서 열고 `BUILD.cmd`를 실행한 다음 `index.html`을 브라우저로 엽니다. 실제 Astryx 버튼 예제가 나타납니다. 수정할 소스는 `src/main.tsx`입니다.

이 시작 프로젝트에는 React 19.2.0, Astryx Core 0.7.16, neutral·butter·chocolate·matcha·stone·gothic·y2k 테마, StyleX와 Windows x64 esbuild 및 필요한 의존성이 들어 있습니다. 빌드는 설치된 Ned의 Node 모드를 사용합니다. 이미 Node 22.13 이상이 설치되어 있다면 `node build.mjs`로 빌드해도 됩니다. 직원 PC에서 npm을 설치하거나 외부 패키지를 받지 않습니다. 압축 파일은 약 25MB이며, 프로젝트에 풀면 그보다 많은 공간을 사용합니다.

기존 프로젝트의 node_modules에 이 키트를 덮어쓰지 마십시오. 기존 의존성·번들러와 충돌할 수 있습니다. 이 예제의 결과물은 브라우저에서 로컬 파일로 확인하는 정적 페이지이며 서버·API·인증 기능까지 제공하지는 않습니다. 온라인 샌드박스, 원본 Astryx CLI의 설치·업데이트·원격 검색 기능도 실행하지 않습니다. 기본 예제는 외부 폰트·CDN·API에 접속하지 않으며, 새 코드의 외부 의존성도 따로 확인해야 합니다.

Ned 스킬은 필요한 문서만 읽도록 구성했습니다. `read_skill`의 `id`를 `astryx`, 문서를 `REFERENCES.md`로 지정하면 컴포넌트별 경로를 찾을 수 있습니다. 원본은 MIT 라이선스이며 Meta와 각 의존성의 저작권·LICENSE·NOTICE를 유지합니다. 버전·전이 의존성은 package-lock.json, 실제 파일 해시는 NED-KIT-MANIFEST.json에 기록되어 있습니다. 기본 Zed Agent에는 이 스킬을 자동으로 주입하지 않습니다.
