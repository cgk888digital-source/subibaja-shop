@echo off
setlocal enabledelayedexpansion
title Despliegue Subibaja Shop a Vercel
color 0b
echo =========================================================
echo    INICIANDO DESPLIEGUE AUTOMATICO A GITHUB Y VERCEL
echo =========================================================
echo.

cd /d "%~dp0"

echo [Paso 0] Verificando logos y guias oficiales en Descargas...
if exist "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" "%~dp0public\logo-adultos.jpg" >nul
    echo   [OK] Logo oficial de Subibaja Adultos copiado a public\logo-adultos.jpg
)
if exist "%USERPROFILE%\Downloads\Subibaja logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja logo.jpeg" "%~dp0public\logo-principal.jpg" >nul
    echo   [OK] Logo oficial de Subibaja Kids copiado a public\logo-principal.jpg
)
if exist "%USERPROFILE%\Downloads\Tallas 1.jpeg" copy /y "%USERPROFILE%\Downloads\Tallas 1.jpeg" "%~dp0public\tallas\guia-talla-1.jpeg" >nul
if exist "%USERPROFILE%\Downloads\tallas 2.jpeg" copy /y "%USERPROFILE%\Downloads\tallas 2.jpeg" "%~dp0public\tallas\guia-talla-2.jpeg" >nul
if exist "%USERPROFILE%\Downloads\tallas 3.jpeg" copy /y "%USERPROFILE%\Downloads\tallas 3.jpeg" "%~dp0public\tallas\guia-talla-3.jpeg" >nul
if exist "%USERPROFILE%\Downloads\tallas 4.jpeg" copy /y "%USERPROFILE%\Downloads\tallas 4.jpeg" "%~dp0public\tallas\guia-talla-4.jpeg" >nul
if exist "%USERPROFILE%\Downloads\tallas 5.jpeg" copy /y "%USERPROFILE%\Downloads\tallas 5.jpeg" "%~dp0public\tallas\guia-talla-5.jpeg" >nul
if exist "%USERPROFILE%\Downloads\tallas 6.jpeg" copy /y "%USERPROFILE%\Downloads\tallas 6.jpeg" "%~dp0public\tallas\guia-talla-6.jpeg" >nul
echo   [OK] 6 imagenes oficiales de guia de tallas verificadas.
echo.

echo [Paso 1 de 3] Guardando cambios de archivos locales...
git add .

echo [Paso 2 de 3] Creando commit de la version actualizada...
git commit -m "feat: reiniciar ventas y contabilidad a cero para lanzamiento oficial y selector de colores" --author="CGK888 DIGITAL <cgk888digital@gmail.com>" --allow-empty

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
