@echo off
cd /d "%~dp0"
node scripts/test-phone.mjs %*
pause
