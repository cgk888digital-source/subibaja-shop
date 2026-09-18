@echo off
title Copiar Logos Oficiales Subibaja
color 0a
echo ========================================================
echo    COPIANDO LOGOS OFICIALES A LA APP SUBIBAJA
echo ========================================================
echo.

if exist "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg" "%~dp0public\logo-adultos.jpg" >nul
    echo [EXITO] Logo Adultos copiado a public\logo-adultos.jpg
)

if exist "%USERPROFILE%\Downloads\Subibaja logo.jpeg" (
    copy /y "%USERPROFILE%\Downloads\Subibaja logo.jpeg" "%~dp0public\logo-principal.jpg" >nul
    echo [EXITO] Logo Subibaja (Kids) copiado a public\logo-principal.jpg
)

echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
