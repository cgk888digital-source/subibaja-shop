@echo off
title Servidor Local Subibaja Shop (localhost:3000)
color 0a
echo =========================================================
echo    INICIANDO SERVIDOR LOCAL EN LOCALHOST:3000
echo =========================================================
echo.

cd /d "%~dp0"

echo Abriendo navegador en http://localhost:3000/adultos ...
start http://localhost:3000/adultos

echo Arrancando Next.js...
npm run dev
