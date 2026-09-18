@echo off
title Copiar Logo Oficial Subibaja Adultos
color 0a
echo ========================================================
echo    COPIANDO LOGO OFICIAL DE ADULTOS A LA APP
echo ========================================================
echo.

set "ORIGEN=%USERPROFILE%\Downloads\Subibaja Adultos logo.jpeg"
set "DESTINO=%~dp0public\logo-adultos.jpg"

if exist "%ORIGEN%" (
    copy /y "%ORIGEN%" "%DESTINO%" >nul
    echo [EXITO] Archivo copiado exitosamente a:
    echo        %DESTINO%
) else (
    echo [ERROR] No se encontro el archivo en Descargas:
    echo         %ORIGEN%
)

echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
