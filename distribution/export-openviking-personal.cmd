@echo off
setlocal
set "NED_INSTALL=%LOCALAPPDATA%\Programs\Ned"
for /f "tokens=2,*" %%A in ('reg.exe query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" /v InstallLocation 2^>nul') do if "%%A"=="REG_SZ" set "NED_INSTALL=%%B"
set "NED_PY=%NED_INSTALL%\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%NED_PY%" set "NED_PY=%LOCALAPPDATA%\Programs\L-Vibe\resources\runtime\windows-x64\openviking\python\python.exe"
if not exist "%NED_PY%" (
  echo Ned bundled Python was not found. Install Ned first.
  pause
  exit /b 1
)
"%NED_PY%" -I -S -B "%~dp0export-openviking-personal.py" %*
set "NED_EXIT=%ERRORLEVEL%"
echo EXIT_CODE=%NED_EXIT%
pause
exit /b %NED_EXIT%
