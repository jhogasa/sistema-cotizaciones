@echo off
chcp 65001 >nul
title Sistema de Cotizaciones - JGS
color 0A

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

REM Verificar si PostgreSQL está corriendo
netstat -ano | findstr :5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] PostgreSQL no parece estar ejecutándose.
    echo Asegúrate de que la base de datos esté activa.
    echo.
)

echo [INFO] Iniciando servicios...
echo.

REM Ejecutar backend y frontend en paralelo
start "Backend - Cotizaciones" cmd /c "cd %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

start "Frontend - Cotizaciones" cmd /c "cd %~dp0frontend && npm run dev"

echo.
echo ================================================
echo    SERVICIOS INICIADOS
echo ================================================
echo.
echo [OK] Backend: http://localhost:3000
echo [OK] Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para salir...
pause >nul
