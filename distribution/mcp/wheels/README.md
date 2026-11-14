# proxy-tools 0.1.0 wheel 보관

Serena의 pywebview 의존성인 `proxy-tools==0.1.0`은 순수 Python 패키지이지만 Windows wheel이 없습니다. 직원 PC에서 빌드하지 않도록 빌드 PC에서 `python -m pip wheel --no-deps proxy-tools==0.1.0`으로 만든 파일을 고정해 사용합니다.

wheel을 다시 만들면 ZIP 타임스탬프 때문에 해시가 달라질 수 있어 이 산출물과 소스를 함께 보관합니다. 실제 배포 파일은 `mcp-runtime-lock.json`의 해시와 대조합니다.

원본 sdist: https://files.pythonhosted.org/packages/f2/cf/77d3e19b7fabd03895caca7857ef51e4c409e0ca6b37ee6e9f7daa50b642/proxy_tools-0.1.0.tar.gz

원본 SHA-256: `ccb3751f529c047e2d8a58440d86b205303cf0fe8146f784d1cbcd94f0a28010`

원본 `setup.py`는 저자를 Jonathan Tushman, 라이선스를 MIT로 명시합니다. sdist의 코드·README·메타데이터를 보존하며 직원 앱에서 소스 설치 명령이나 pywebview GUI를 실행하지 않습니다.
