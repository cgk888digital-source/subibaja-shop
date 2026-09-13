@echo off
setlocal enabledelayedexpansion
title Despliegue Subibaja Shop a Vercel
color 0b
echo =========================================================
echo    INICIANDO DESPLIEGUE AUTOMATICO A GITHUB Y VERCEL
echo =========================================================
echo.

cd /d "%~dp0"

echo [Paso 1 de 3] Guardando cambios de archivos locales...
git add .

echo [Paso 2 de 3] Creando commit de la version actualizada...
git commit -m "fix: menu hamburguesa movil y pc, barra de promociones en header movil"

echo [Paso 3 de 3] Subiendo cambios a GitHub y Vercel (main)...
git push origin main

echo.
echo =========================================================
echo   LISTO! CAMBIOS ENVIADOS EXITOSAMENTE A VERCEL
echo   Vercel esta compilando la nueva version en vivo.
echo =========================================================
echo.
pause
