@echo off
REM =====================================================
REM Script para crear estructura del proyecto
REM sistema-cotizaciones
REM =====================================================

echo Creando estructura del proyecto...
echo.

REM BACKEND
echo [*] Creando carpetas del BACKEND...
mkdir backend\src\config
mkdir backend\src\models
mkdir backend\src\controllers
mkdir backend\src\routes
mkdir backend\src\services
mkdir backend\src\scripts

REM FRONTEND
echo [*] Creando carpetas del FRONTEND...
mkdir frontend\src\components
mkdir frontend\src\services
mkdir frontend\src\types
mkdir frontend\src\utils
mkdir frontend\public

REM ARCHIVOS BACKEND
echo [*] Creando archivos del BACKEND...
type nul > backend\package.json
type nul > backend\.env.example
type nul > backend\src\server.js
type nul > backend\src\config\database.js
type nul > backend\src\models\index.js
type nul > backend\src\models\Cotizacion.js
type nul > backend\src\models\Item.js
type nul > backend\src\controllers\cotizacionController.js
type nul > backend\src\routes\cotizaciones.js
type nul > backend\src\services\pdfService.js
type nul > backend\src\scripts\initDatabase.js

REM ARCHIVOS FRONTEND
echo [*] Creando archivos del FRONTEND...
type nul > frontend\package.json
type nul > frontend\.env.example
type nul > frontend\index.html
type nul > frontend\vite.config.ts
type nul > frontend\tsconfig.json
type nul > frontend\tsconfig.node.json
type nul > frontend\tailwind.config.js
type nul > frontend\postcss.config.js
type nul > frontend\src\main.tsx
type nul > frontend\src\App.tsx
type nul > frontend\src\index.css
type nul > frontend\src\components\CotizacionForm.tsx
type nul > frontend\src\components\CotizacionList.tsx
type nul > frontend\src\components\CotizacionView.tsx
type nul > frontend\src\services\api.ts
type nul > frontend\src\types\index.ts
type nul > frontend\src\utils\helpers.ts

REM ARCHIVOS RAÍZ
echo [*] Creando archivos de configuración...
type nul > README.md
type nul > INSTALACION.md
type nul > USO.md
type nul > .gitignore

echo.
echo ✓ Estructura del proyecto creada exitosamente!
echo.
pause