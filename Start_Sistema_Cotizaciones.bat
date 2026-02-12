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
    echo [ERROR] Node.js no esta instalado.
    pause
    exit /b 1
)
echo [OK] Node.js detectado.

echo.
echo ================================================
echo    INICIANDO SERVICIOS...
echo ================================================
echo.

REM Ejecutar backend
start "Backend - Sistema de Cotizaciones" cmd /k "cd /d %SCRIPT_DIR%backend && title Backend - JGS && npm run dev"

timeout /t 3 /nobreak >nul

REM Ejecutar frontend
start "Frontend - Sistema de Cotizaciones" cmd /k "cd /d %SCRIPT_DIR%frontend && title Frontend - JGS && npm run dev"

echo.
echo ================================================
echo    SERVICIOS INICIADOS
echo ================================================
echo.
echo [OK] Backend: http://localhost:3000
echo [OK] Frontend: http://localhost:5173
echo.
echo Credenciales:
echo   Usuario: admin@jgs.com
echo   Password: admin123
echo.
echo Si hay errores, revisalos en las ventanas de comandos.
echo.
pause
