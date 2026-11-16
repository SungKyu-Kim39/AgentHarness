@echo off
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD.ps1"
echo EXIT_CODE=%ERRORLEVEL%
pause
