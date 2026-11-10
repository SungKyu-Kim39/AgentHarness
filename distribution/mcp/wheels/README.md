# proxy-tools 0.1.0 빌드 산출물

Serena의 pywebview 의존성에는 Windows wheel이 없는 순수 Python `proxy-tools==0.1.0`이 있다. 직원 PC에서 빌드하지 않도록 빌드 PC에서 `python -m pip wheel --no-deps proxy-tools==0.1.0`으로 만든 wheel을 고정한다. wheel ZIP 타임스탬프 재생성으로 해시가 달라지지 않도록 이 작은 산출물을 소스와 함께 보존한다. 실제 배포 해시는 `mcp-runtime-lock.json`의 해당 항목과 대조한다.

원본 sdist: https://files.pythonhosted.org/packages/f2/cf/77d3e19b7fabd03895caca7857ef51e4c409e0ca6b37ee6e9f7daa50b642/proxy_tools-0.1.0.tar.gz

원본 SHA-256: `ccb3751f529c047e2d8a58440d86b205303cf0fe8146f784d1cbcd94f0a28010`.

원본 `setup.py`는 Jonathan Tushman을 저자로, MIT를 라이선스로 명시한다. sdist의 코드·README·패키지 메타데이터를 함께 보존한다. 직원 앱은 이 소스의 설치 명령이나 pywebview GUI를 실행하지 않는다.
