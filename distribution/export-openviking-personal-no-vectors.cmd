@echo off
call "%~dp0EXPORT_PERSONAL.cmd" --without-vectors %*
exit /b %ERRORLEVEL%
