# 📖 GUÍA DE INSTALACIÓN COMPLETA
## Sistema de Cotizaciones - JGS Soluciones Tecnológicas

---

## 🎯 PASO 1: INSTALAR PREREQUISITOS

### 1.1 Instalar Node.js

**Windows:**
1. Descargar desde: https://nodejs.org/ (versión LTS recomendada)
2. Ejecutar el instalador
3. Verificar instalación:
```bash
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

**Mac:**
```bash
brew install node
node --version
npm --version
```

### 1.2 Instalar PostgreSQL

**Windows:**
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar el instalador
3. Recordar la contraseña del usuario `postgres` que configures

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 1.3 Verificar PostgreSQL
```bash
# Versión
psql --version

# Conectar (usuario postgres)
sudo -u postgres psql
```

---

## 🗄️ PASO 2: CONFIGURAR BASE DE DATOS

### 2.1 Crear base de datos y usuario

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE DATABASE cotizaciones_db;
CREATE USER cotizaciones_user WITH PASSWORD 'TuPasswordSegura123!';
GRANT ALL PRIVILEGES ON DATABASE cotizaciones_db TO cotizaciones_user;
\q
```

### 2.2 Probar conexión
```bash
psql -U cotizaciones_user -d cotizaciones_db -h localhost
# Ingresar la contraseña cuando se solicite
# Si conecta correctamente, escribir \q para salir
```

---

## 📦 PASO 3: DESCARGAR E INSTALAR EL PROYECTO

### 3.1 Navegar a la carpeta del proyecto
```bash
cd /ruta/a/sistema-cotizaciones
```

### 3.2 Instalar dependencias del BACKEND
```bash
cd backend
npm install
```

**Tiempo estimado:** 1-3 minutos

### 3.3 Instalar dependencias del FRONTEND
```bash
cd ../frontend
npm install
```

**Tiempo estimado:** 2-5 minutos

---

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

### 4.1 Configurar Backend

```bash
cd ../backend
cp .env.example .env
```

Editar el archivo `.env` con tus datos:

**Windows:** Usar Notepad o cualquier editor
**Linux/Mac:**
```bash
nano .env
# o
code .env  # Si tienes VS Code
```

**Contenido del archivo .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cotizaciones_db
DB_USER=cotizaciones_user
DB_PASSWORD=TuPasswordSegura123!
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANTE:** Reemplaza `TuPasswordSegura123!` con la contraseña que configuraste en PostgreSQL

### 4.2 Configurar Frontend

```bash
cd ../frontend
cp .env.example .env
```

**Contenido del archivo .env:**
```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 PASO 5: INICIALIZAR BASE DE DATOS

```bash
cd ../backend
npm run init-db
```

Deberías ver:
```
✅ Conexión a PostgreSQL establecida correctamente.
📋 Creando tablas en la base de datos...
✅ Modelos sincronizados con la base de datos
✅ Base de datos inicializada correctamente

Tablas creadas:
- cotizaciones
- items
```

---

## 🎬 PASO 6: INICIAR LA APLICACIÓN

### 6.1 Terminal 1 - Iniciar Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Conexión a PostgreSQL establecida correctamente.
✅ Modelos sincronizados con la base de datos

🚀 Servidor corriendo en http://localhost:3000
📊 Ambiente: development
📁 Base de datos: cotizaciones_db

✅ Sistema listo para recibir peticiones
```

### 6.2 Terminal 2 - Iniciar Frontend

**Abrir una NUEVA terminal** (dejar la anterior corriendo)

```bash
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## 🎉 PASO 7: ACCEDER A LA APLICACIÓN

Abrir tu navegador web en:

**Frontend:** http://localhost:5173

**API (opcional):** http://localhost:3000

---

## ✅ VERIFICAR FUNCIONAMIENTO

### 7.1 Probar API directamente

En tu navegador, visitar:
- http://localhost:3000 (Debe mostrar información de la API)
- http://localhost:3000/health (Debe mostrar: `{"status":"OK"}`)

### 7.2 Crear primera cotización

1. Ir a http://localhost:5173
2. Click en "Nueva Cotización"
3. Llenar los datos del cliente
4. Agregar al menos un item
5. Click en "Guardar"
6. Verificar que aparezca en la lista

### 7.3 Descargar PDF

1. En la lista de cotizaciones
2. Click en el ícono de descarga (📥)
3. El PDF debe descargarse automáticamente

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot connect to database"

**Solución:**
1. Verificar que PostgreSQL esté corriendo:
   ```bash
   # Linux
   sudo systemctl status postgresql
   
   # Si no está corriendo:
   sudo systemctl start postgresql
   ```

2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe:
   ```bash
   sudo -u postgres psql -c "\l"
   ```

### Error: "Port 3000 already in use"

**Solución:**
1. Cambiar el puerto en `backend/.env`:
   ```env
   PORT=3001
   ```
2. Actualizar `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Error: "npm install" falla

**Solución:**
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Frontend no carga

**Solución:**
1. Verificar que el backend esté corriendo
2. Abrir consola del navegador (F12) para ver errores
3. Verificar que `VITE_API_URL` esté correctamente configurado

---

## 📝 COMANDOS ÚTILES

### Backend
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Reinicializar base de datos (CUIDADO: borra todo)
npm run init-db
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

### Base de datos
```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Conectar a la base de datos específica
psql -U cotizaciones_user -d cotizaciones_db -h localhost

# Ver tablas
\dt

# Ver estructura de una tabla
\d cotizaciones

# Salir
\q
```

---

## 🎨 PERSONALIZACIÓN

### Cambiar datos de la empresa

Editar `frontend/src/components/CotizacionForm.tsx`:
- Líneas 19-25: Datos del emisor por defecto

### Cambiar colores

Editar `frontend/tailwind.config.js`:
- Sección `colors.primary`

### Modificar notas/condiciones por defecto

Editar `frontend/src/components/CotizacionForm.tsx`:
- Líneas 48-60: Notas y condiciones por defecto

---

## 🆘 SOPORTE

Si encuentras problemas:

1. Revisar esta guía completa
2. Verificar logs en las terminales
3. Revisar consola del navegador (F12)
4. Verificar que todas las dependencias estén instaladas

---

## 📌 CHECKLIST DE INSTALACIÓN

- [ ] Node.js instalado (v18+)
- [ ] PostgreSQL instalado (v14+)
- [ ] Base de datos creada
- [ ] Usuario de base de datos creado
- [ ] Backend: dependencias instaladas
- [ ] Backend: .env configurado
- [ ] Backend: base de datos inicializada
- [ ] Frontend: dependencias instaladas
- [ ] Frontend: .env configurado
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Primera cotización creada exitosamente
- [ ] PDF descargado correctamente

---

¡Listo! Tu sistema de cotizaciones está funcionando. 🎉