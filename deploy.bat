@echo off
setlocal enabledelayedexpansion
title Despliegue Subibaja Shop a Vercel
color 0b
echo =========================================================
echo    INICIANDO DESPLIEGUE AUTOMATICO A GITHUB Y VERCEL
echo =========================================================
echo.

cd /d "%~dp0"

echo [Paso 0] Verificando logos oficiales en Descargas...
if exist "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" "%~dp0public\logo-adultos.jpg" >nul
    echo   [OK] Logo oficial de Subibaja Adultos copiado a public\logo-adultos.jpg
)
if exist "%USERPROFILE%\Downloads\Subibaja logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja logo.jpeg" "%~dp0public\logo-principal.jpg" >nul
    echo   [OK] Logo oficial de Subibaja Kids copiado a public\logo-principal.jpg
)
echo.

echo [Paso 1 de 3] Guardando cambios de archivos locales...
git add .

echo [Paso 2 de 3] Creando commit de la version actualizada...
git commit -m "feat: actualizar logo del header con logo-fino para maxima nitidez y contraste" --author="CGK888 DIGITAL <cgk888digital@gmail.com>" --allow-empty

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
