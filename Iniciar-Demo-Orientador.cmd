@echo off
cd /d "%~dp0"
set APP_VARIANT=evaluation
call npm.cmd run web -- --port 8083
pause
