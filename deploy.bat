@echo off
setlocal enabledelayedexpansion
title Despliegue Subibaja Shop a Vercel
color 0b
echo =========================================================
echo    INICIANDO DESPLIEGUE AUTOMATICO A GITHUB Y VERCEL
echo =========================================================
echo.

cd /d "%~dp0"

echo [Paso 0] Verificando logo oficial de Adultos en Descargas...
if exist "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" "%~dp0public\logo-adultos.jpg" >nul
    echo   [OK] Logo oficial de Subibaja Adultos copiado a public\logo-adultos.jpg
) else (
    echo   [INFO] No se encontro nuevo archivo en Descargas, usando existente.
)
echo.

echo [Paso 1 de 3] Guardando cambios de archivos locales...
git add .

echo [Paso 2 de 3] Creando commit de la version actualizada...
git commit -m "feat: implementar logo oficial identico de Subibaja Adultos"

echo [Paso 3 de 4] Sincronizando con cambios remotos...
git pull --rebase origin main

echo [Paso 4 de 4] Subiendo cambios a GitHub y Vercel (main)...
git push origin main

echo.
echo =========================================================
echo   LISTO! CAMBIOS ENVIADOS EXITOSAMENTE A VERCEL
echo   Vercel esta compilando la nueva version en vivo.
echo =========================================================
echo.
pause
