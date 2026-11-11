@echo off
setlocal
set "LVIBE_PY=%LOCALAPPDATA%\Programs\L-Vibe\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%LVIBE_PY%" (
  echo L-Vibe bundled Python was not found. Install L-Vibe first.
  pause
  exit /b 1
)
"%LVIBE_PY%" -I -B "%~dp0export-openviking-personal.py" %*
set "LVIBE_EXIT=%ERRORLEVEL%"
echo EXIT_CODE=%LVIBE_EXIT%
pause
exit /b %LVIBE_EXIT%
