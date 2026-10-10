@echo off
cd /d "%~dp0"
set EXPO_PUBLIC_NODE_RED_URL=http://127.0.0.1:1880
call npm.cmd run web -- --port 8082
pause
