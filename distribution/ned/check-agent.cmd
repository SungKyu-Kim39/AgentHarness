@echo off
setlocal
set "NED_INSTALL=%LOCALAPPDATA%\Programs\Ned"
for /f "tokens=2,*" %%A in ('reg.exe query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" /v InstallLocation 2^>nul') do if "%%A"=="REG_SZ" set "NED_INSTALL=%%B"
set "NED_PROBE_PY=%NED_INSTALL%\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%NED_PROBE_PY%" (echo NED_BUNDLED_PYTHON_NOT_FOUND & pause & exit /b 1)
"%NED_PROBE_PY%" -I -B "%~dp0agent-probe.py"
set "NED_PROBE_EXIT=%ERRORLEVEL%"
echo EXIT_CODE=%NED_PROBE_EXIT%
pause
exit /b %NED_PROBE_EXIT%
