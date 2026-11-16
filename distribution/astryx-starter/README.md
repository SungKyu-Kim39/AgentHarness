# Astryx 오프라인 시작 프로젝트

새 프로젝트를 시작할 때 이 폴더를 원하는 작업 위치에 복사한 뒤 Ned에서 엽니다. `BUILD.cmd`를 실행하고 `index.html`을 브라우저로 열면 실제 Astryx Button을 확인할 수 있습니다. 소스는 `src/main.tsx`입니다. 설치된 Ned의 Node 모드를 사용하므로 별도 Node·npm 설치가 필요하지 않습니다. Node 22.13 이상이 이미 설치되어 있다면 `node build.mjs`로도 빌드할 수 있습니다.

React 19.2.0, Astryx Core 0.7.16, 일곱 가지 테마, StyleX와 Windows x64 esbuild 및 필요한 의존성이 들어 있습니다. 버전과 전이 의존성은 package-lock.json, 원본별 라이선스는 node_modules 안의 LICENSE·NOTICE에 있습니다. 수정 가능한 프로젝트 예제이며 Ned 편집기 자체의 UI 테마를 바꾸지는 않습니다.

설치나 다운로드 명령을 실행하지 마십시오. 다른 프로젝트의 node_modules에 덮어쓰지도 마십시오. 이 프로젝트와 다른 React·빌드 도구 버전을 쓰는 기존 프로젝트에 합치려면 의존성 충돌을 먼저 확인해야 합니다. 이 키트는 Windows x64용이며 Linux·macOS 실행 파일은 포함하지 않습니다.

기본 예제는 외부 폰트·아이콘·CDN·웹 요청을 쓰지 않습니다. 새 코드에서 외부 자원을 추가하지 않았는지도 검토하십시오. 원본 Astryx CLI, 자동 업데이트·원격 패키지 검색·온라인 샌드박스는 실행하지 않습니다. Ned Agent에서 astryx 스킬과 로컬 참조 문서를 읽을 수 있습니다.
