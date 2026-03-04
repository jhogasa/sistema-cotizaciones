# Deployment en Render.com

## 📋 Pasos para desplegar el Sistema de Cotizaciones en Render

### Requisitos previos
- Cuenta en [Render.com](https://render.com) vinculada a GitHub
- Repositorio con el código del proyecto

---

## 🚀 Paso 1: Crear PostgreSQL en Render

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com)
2. Clic en **"New +"** → **"PostgreSQL"**
3. Configura:
   ```
   Name: sistema-cotizaciones-db
   Database: railway_j1u0
   User: postgres
   ```
4. Clic en **"Create Database"**
5. **IMPORTANT**: Copia los siguientes valores de la sección "Connection Details":
   - `Host` → DB_HOST
   - `Database` → DB_NAME
   - `User` → DB_USER
   - `Password` → DB_PASSWORD

---

## ⚙️ Paso 2: Crear Backend (Web Service)

1. Dashboard → **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:
   ```
   Name: sistema-cotizaciones-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
4. Clic en **"Advanced"** → **"Add Environment Variables"**
5. Agrega las siguientes variables:

   | Variable | Valor |
   |----------|-------|
   | NODE_ENV | production |
   | PORT | 10000 |
   | DB_HOST | [COPIA DEL POSTGRESQL] |
   | DB_PORT | 5432 |
   | DB_NAME | railway_j1u0 |
   | DB_USER | postgres |
   | DB_PASSWORD | [COPIA DEL POSTGRESQL] |
   | JWT_SECRET | [Genera una clave larga y segura] |
   | JWT_EXPIRES_IN | 24h |
   | EMAIL_USER | jgs.tecnologias@gmail.com |
   | EMAIL_PASSWORD | [App Password de Gmail] |
   | FRONTEND_URL | https://tu-frontend.onrender.com |

6. Clic en **"Create Web Service"**
7. Espera a que termine el deployment (2-5 minutos)
8. **Copia la URL** del servicio (ej: `https://sistema-cotizaciones-backend.onrender.com`)

---

## 🎨 Paso 3: Crear Frontend (Web Service)

1. Dashboard → **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:
   ```
   Name: sistema-cotizaciones-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Start Command: npm run preview
   ```
4. Clic en **"Advanced"** → **"Add Environment Variables"**
5. Agrega:
   ```
   VITE_API_URL=https://tu-backend.onrender.com
   ```
   (Reemplaza con la URL real de tu backend)

6. Clic en **"Create Web Service"**
7. Espera a que termine el deployment

---

## 🔧 Configuración de Gmail (App Password)

Para que funcione el envío de correos:

1. Ve a [Google Account](https://myaccount.google.com)
2. Security → **"2-Step Verification"** → Actívalo si no está activo
3. Luego ve a **"App Passwords"**
4. Crea uno nuevo:
   - App name: "Sistema de Cotizaciones"
   - Copia la contraseña de 16 caracteres
5. Usa esa contraseña en `EMAIL_PASSWORD`

---

## ✅ Verificación

1. Accede a tu frontend: `https://sistema-cotizaciones-frontend.onrender.com`
2. Verifica que cargue la página de login
3. Inicia sesión con las credenciales por defecto
4. Crea una cotización de prueba
5. Verifica que el PDF se genere correctamente

---

## 📝 Notas importantes

- Los servicios gratuitos de Render se **duermen** después de 15 minutos de inactividad
- La primera petición después de inactividad puede tomar ~30 segundos
- Para mantenerlo siempre activo, considera actualizar a un plan de pago
- Los logs del servidor están disponibles en el Dashboard de Render

---

## 🔄 Actualizaciones

Para actualizar después de cambios en el código:

1. Haz push a GitHub: `git push origin main`
2. Render detectará los cambios automáticamente
3. El servicio se redeployará

---

## 🐛 Solución de problemas

### Error de conexión a base de datos
- Verifica que las variables de DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD sean correctas
- Asegúrate de que el PostgreSQL esté en la misma cuenta de Render

### CORS errors
- Verifica que `FRONTEND_URL` en el backend coincida con la URL del frontend
- Verifica que `VITE_API_URL` en el frontend coincida con la URL del backend

### PDF no se genera
- Revisa los logs en Render Dashboard
- Verifica que las rutas de fuentes estén configuradas correctamente
