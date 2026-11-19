@echo off
cd /d "%~dp0"
node integration\node-red\build-physical-flow.cjs
if errorlevel 1 goto fim
python integration\node-red\install-local-physical.py
if errorlevel 1 goto fim
node backend\link-physical.mjs
:fim
pause
