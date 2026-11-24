@echo off
chcp 65001 >nul
cd /d "%~dp0tcc-maquete-app"
set "PATH=%~dp0runtime;%PATH%"
"%~dp0runtime\node.exe" scripts\test-phone.mjs --apk %*
pause
