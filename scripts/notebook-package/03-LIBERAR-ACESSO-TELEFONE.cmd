@echo off
chcp 65001 >nul
cd /d "%~dp0tcc-maquete-app"
echo Execute este arquivo como administrador, depois de escolher a rede no iniciador.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tcc-maquete-app\scripts\firewall-phone.ps1" %*
pause
