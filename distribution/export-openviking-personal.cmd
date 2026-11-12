@echo off
setlocal
set "NED_PY=%LOCALAPPDATA%\Programs\Ned\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%NED_PY%" set "NED_PY=%LOCALAPPDATA%\Programs\L-Vibe\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%NED_PY%" (
  echo Ned bundled Python was not found. Install Ned first.
  pause
  exit /b 1
)
"%NED_PY%" -I -B "%~dp0export-openviking-personal.py" %*
set "NED_EXIT=%ERRORLEVEL%"
echo EXIT_CODE=%NED_EXIT%
pause
exit /b %NED_EXIT%
