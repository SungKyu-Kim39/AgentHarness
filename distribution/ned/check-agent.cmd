@echo off
setlocal
set "NED_PROBE_PY=%LOCALAPPDATA%\Programs\Ned\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%NED_PROBE_PY%" (echo NED_BUNDLED_PYTHON_NOT_FOUND & pause & exit /b 1)
"%NED_PROBE_PY%" -I -B "%~dp0agent-probe.py"
set "NED_PROBE_EXIT=%ERRORLEVEL%"
echo EXIT_CODE=%NED_PROBE_EXIT%
pause
exit /b %NED_PROBE_EXIT%
