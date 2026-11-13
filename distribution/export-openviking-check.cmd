@echo off
call "%~dp0EXPORT_PERSONAL.cmd" --diagnose-only %*
exit /b %ERRORLEVEL%
