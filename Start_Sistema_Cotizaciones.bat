@echo off
chcp 65001 >nul
title Sistema de Cotizaciones - JGS
color 0A

REM Obtener la ubicación actual del script
set "SCRIPT_DIR=%~dp0"

echo ================================================
echo    SISTEMA DE COTIZACIONES - JGS SOLUCIONES
echo ================================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado. Por favor instálalo primero.
    echo Descarga: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js detectado.

echo.
echo ================================================
echo    INICIALIZANDO SISTEMA...
echo ================================================
echo.

REM Verificar e inicializar base de datos y super usuario
cd /d %SCRIPT_DIR%backend
call npm run init

echo.
echo ================================================
echo    INICIANDO SERVICIOS...
echo ================================================
echo.

REM Ejecutar backend y frontend en paralelo y mantener ventanas abiertas
start "Backend - Sistema de Cotizaciones" cmd /k "cd /d %SCRIPT_DIR%backend && title Backend - JGS && npm run dev"

timeout /t 2 /nobreak >nul

start "Frontend - Sistema de Cotizaciones" cmd /k "cd /d %SCRIPT_DIR%frontend && title Frontend - JGS && npm run dev"

echo.
echo ================================================
echo    SERVICIOS INICIADOS CORRECTAMENTE
echo ================================================
echo.
echo [OK] Backend:    http://localhost:3000/api
echo [OK] Frontend:   http://localhost:5173
echo.
echo Credenciales:
echo   Usuario: admin@jgs.com
echo   Password: admin123
echo.
echo Las ventanas de comandos se mantendrán abiertas.
echo.
echo Presiona cualquier tecla para cerrar este mensaje...
pause >nul
