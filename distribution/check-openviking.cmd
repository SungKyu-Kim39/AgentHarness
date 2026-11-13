@echo off
setlocal
set "NED_INSTALL=%LOCALAPPDATA%\Programs\Ned"
for /f "tokens=2,*" %%A in ('reg.exe query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned" /v InstallLocation 2^>nul') do if "%%A"=="REG_SZ" set "NED_INSTALL=%%B"
"%NED_INSTALL%\resources\runtime\windows-x64\openviking\python\python.exe" -I -B "%~dp0openviking-import-check.py"
set "NED_CHECK_RESULT=%ERRORLEVEL%"
echo EXIT_CODE=%NED_CHECK_RESULT%
pause
exit /b %NED_CHECK_RESULT%
