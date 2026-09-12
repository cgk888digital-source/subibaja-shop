@echo off
setlocal enabledelayedexpansion
title Despliegue Subibaja Shop a Vercel
color 0b
echo =========================================================
echo    INICIANDO DESPLIEGUE AUTOMATICO A GITHUB Y VERCEL
echo =========================================================
echo.

cd /d "%~dp0"

echo [Paso 1 de 4] Guardando cambios de archivos locales...
git add .

echo [Paso 2 de 4] Creando commit de la version actualizada...
git commit -m "feat: carruseles dinamicos, catalogo de puntos, editor gift cards y feed de instagram"

echo [Paso 3 de 4] Pasando cambios a la rama principal (main)...
git push origin fix/orden-categorias-cache
git checkout main
git pull origin main
git merge fix/orden-categorias-cache -m "merge: unir mejoras a produccion"

echo [Paso 4 de 4] Subiendo cambios a GitHub (activando Vercel)...
git push origin main

echo.
echo =========================================================
echo   LISTO! CAMBIOS ENVIADOS EXITOSAMENTE A VERCEL
echo   Revisa tu panel de Vercel para ver el build en vivo.
echo =========================================================
echo.
pause
