@echo off
"%LOCALAPPDATA%\Programs\L-Vibe\resources\runtime\windows-x64\openviking\python\python.exe" -I -B "%~dp0openviking-import-check.py"
set "L_VIBE_CHECK_RESULT=%ERRORLEVEL%"
echo EXIT_CODE=%L_VIBE_CHECK_RESULT%
pause
exit /b %L_VIBE_CHECK_RESULT%
