# 💼 Sistema de Cotizaciones

![Versión](https://img.shields.io/badge/versión-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.2-cyan)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)

Sistema de gestión de cotizaciones profesionales desarrollado por **JGS Soluciones Tecnológicas**. Permite crear, editar, eliminar y enviar cotizaciones a clientes de manera eficiente, con generación automática de PDFs y gestión de usuarios.

---

## 📋 Tabla de Contenidos

- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Instalación](#-instalación)
- [🎮 Uso](#-uso)
- [🔐 Autenticación](#-autenticación)
- [📄 API Endpoints](#-api-endpoints)
- [⚙️ Configuración](#-configuración)
- [🎨 Personalización](#-personalización)
- [📞 Soporte](#-soporte)
- [📄 Licencia](#-licencia)

---

## ✨ Características

### Gestión de Cotizaciones
- ✅ **Crear cotizaciones** con información completa del cliente
- ✅ **Editar cotizaciones** existentes de manera intuitiva
- ✅ **Eliminar cotizaciones** con confirmación de seguridad
- ✅ **Buscar cotizaciones** por número, nombre o NIT del cliente
- ✅ **Vista previa** de cotizaciones antes de enviar

### Generación de PDFs
- 📄 **PDFs profesionales** con diseño corporativo
- 📊 **Cálculos automáticos** de subtotales, descuentos y totales
- 💰 **Conversión a letras** del total (ej: "Tres millones novecientos...")
- 📥 **Descarga directa** desde la interfaz
- 📧 **Envío por email** directamente desde el sistema

### Sistema de Usuarios
- 👥 **Gestión de usuarios** (solo administradores)
- 🔐 **Autenticación segura** con JWT
- 🔑 **Cambio de contraseña** desde la interfaz
- 👤 **Roles de usuario**: Admin y Usuario estándar

### Funcionalidades Adicionales
- 📧 **Envío de emails** con PDFs adjuntos
- 📊 **Múltiples items** por cotización
- 💵 **Descuentos** en porcentaje por item
- 📝 **Notas y condiciones** personalizables
- 📈 **Historial de cotizaciones**

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| **React 18** | Biblioteca de interfaces de usuario |
| **TypeScript** | Tipado estático para mayor seguridad |
| **Vite** | Herramienta de construcción rápida |
| **Tailwind CSS** | Framework de estilos utility-first |
| **React Router** | Navegación entre páginas |
| **Axios** | Cliente HTTP para API |
| **Lucide React** | Iconos modernos |
| **React Hot Toast** | Notificaciones |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| **Node.js** | Entorno de ejecución JavaScript |
| **Express** | Framework web minimalista |
| **PostgreSQL** | Base de datos relacional |
| **Sequelize** | ORM para PostgreSQL |
| **JWT** | Autenticación basada en tokens |
| **Bcryptjs** | Cifrado de contraseñas |
| **PDFKit** | Generación de PDFs |
| **Nodemailer** | Envío de emails |
| **Moment** | Manejo de fechas |

---

## 📁 Estructura del Proyecto

```
sistema-cotizaciones/
├── 📂 backend/                 # Servidor API
│   ├── 📂 src/
│   │   ├── 📂 config/         # Configuración de base de datos
│   │   ├── 📂 controllers/    # Controladores de rutas
│   │   ├── 📂 middleware/    # Middleware de autenticación
│   │   ├── 📂 models/        # Modelos de Sequelize
│   │   ├── 📂 routes/        # Definición de rutas API
│   │   ├── 📂 scripts/       # Scripts de inicialización
│   │   ├── 📂 services/      # Servicios (PDF, Email)
│   │   └── 📂 server.js      # Punto de entrada
│   ├── 📂 public/            # Archivos públicos
│   ├── 📄 .env               # Variables de entorno
│   └── 📄 package.json
├── 📂 frontend/              # Aplicación web
│   ├── 📂 src/
│   │   ├── 📂 components/    # Componentes React
│   │   ├── 📂 services/      # Servicios API
│   │   ├── 📂 types/         # Tipos TypeScript
│   │   ├── 📂 utils/         # Utilidades
│   │   ├── 📄 App.tsx        # Componente principal
│   │   └── 📄 main.tsx       # Punto de entrada
│   ├── 📂 public/            # Archivos estáticos
│   ├── 📄 .env               # Variables de entorno
│   └── 📄 package.json
├── 📄 README.md              # Documentación principal
├── 📄 INSTALACION.md         # Guía de instalación
├── 📄 USO.md                 # Guía de uso
└── 📄 package.json           # Scripts compartidos
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js** versión 18 o superior
- **PostgreSQL** versión 14 o superior
- **npm** o **yarn**

### Pasos de Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configurar variables de entorno**

   Backend (`backend/.env`):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cotizaciones_db
   DB_USER=cotizaciones_user
   DB_PASSWORD=tu_password_segura
   PORT=3000
   NODE_ENV=development
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_password_app
   JWT_SECRET=tu_secreto_jwt
   ```

   Frontend (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

5. **Crear la base de datos**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE cotizaciones_db;
   CREATE USER cotizaciones_user WITH PASSWORD 'tu_password_segura';
   GRANT ALL PRIVILEGES ON DATABASE cotizaciones_db TO cotizaciones_user;
   \q
   ```

6. **Inicializar la base de datos**
   ```bash
   cd backend
   npm run init-db
   ```

7. **Iniciar el servidor de desarrollo**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

8. **Acceder a la aplicación**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000

---

## 🎮 Uso

### Inicio de Sesión

Accede a la aplicación con las credenciales por defecto:

| Campo | Valor |
|-------|-------|
| **Usuario** | admin@jgs.com |
| **Contraseña** | admin123 |

> ⚠️ **Importante:** Cambia la contraseña después del primer inicio de sesión.

### Crear una Cotización

1. Click en **"Nueva Cotización"**
2. Completar datos del cliente:
   - Nombre del cliente
   - NIT/CC
   - Dirección
   - Teléfono
   - Email
3. Agregar items con:
   - Descripción
   - Cantidad
   - Precio unitario
   - Descuento (opcional)
4. Revisar notas y condiciones
5. Click en **"Guardar"**

### Acciones Disponibles

| Ícono | Acción | Descripción |
|-------|--------|-------------|
| 👁️ | Ver | Vista previa de la cotización |
| ✏️ | Editar | Modificar cotización existente |
| 🗑️ | Eliminar | Eliminar cotización |
| 📥 | PDF | Descargar PDF |
| ✉️ | Email | Enviar por email al cliente |

### Estados de Cotización

| Estado | Descripción |
|--------|-------------|
| 📝 **Borrador** | Cotización guardada, lista para enviar |
| ✉️ **Enviada** | PDF enviado al cliente |
| ✅ **Aceptada** | Cliente aceptó la cotización |

---

## 🔐 Autenticación

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total: gestión de usuarios, todas las cotizaciones |
| **Usuario** | Crear, editar, ver y eliminar solo sus propias cotizaciones |

### Gestión de Usuarios (Solo Admin)

1. Click en el ícono 👥 de la barra superior
2. Acciones disponibles:
   - Ver lista de usuarios
   - Crear nuevos usuarios
   - Editar usuarios existentes
   - Activar/desactivar usuarios
   - Eliminar usuarios

### Seguridad

- ✅ Contraseñas cifradas con bcrypt
- ✅ Tokens JWT con expiración de 24 horas
- ✅ Renovación automática de token
- ✅ Rutas protegidas por middleware de autenticación

---

## 📄 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar nuevo usuario |
| GET | `/api/auth/me` | Obtener usuario actual |
| PUT | `/api/auth/password` | Cambiar contraseña |

### Cotizaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cotizaciones` | Listar todas las cotizaciones |
| GET | `/api/cotizaciones/:id` | Obtener una cotización |
| POST | `/api/cotizaciones` | Crear cotización |
| PUT | `/api/cotizaciones/:id` | Actualizar cotización |
| DELETE | `/api/cotizaciones/:id` | Eliminar cotización |
| GET | `/api/cotizaciones/:id/pdf` | Descargar PDF |
| POST | `/api/cotizaciones/:id/send-email` | Enviar por email |

### Usuarios (Solo Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

---

## ⚙️ Configuración

### Variables de Entorno del Backend

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | localhost |
| `DB_PORT` | Puerto de PostgreSQL | 5432 |
| `DB_NAME` | Nombre de la base de datos | cotizaciones_db |
| `DB_USER` | Usuario de PostgreSQL | cotizaciones_user |
| `DB_PASSWORD` | Contraseña de PostgreSQL | - |
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Ambiente | development |
| `JWT_SECRET` | Secreto para JWT | - |
| `EMAIL_USER` | Email para envíos | - |
| `EMAIL_PASSWORD` | Password de app | - |

### Variables de Entorno del Frontend

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL de la API | http://localhost:3000 |

---

## 🎨 Personalización

### Datos de la Empresa

Edita el archivo `frontend/src/components/CotizacionForm.tsx`:

```typescript
const datosEmpresa = {
  nombre: "JGS Soluciones Tecnológicas",
  nit: "900.123.456-7",
  direccion: "Calle Principal #123",
  telefono: "+57 300 123 4567",
  email: "contacto@jgs.com",
  website: "www.jgs.com"
};
```

### Colores del Sistema

Edita `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',  // Color principal
        600: '#0284c7',
        700: '#0369a1',
      }
    }
  }
}
```

### Logo de la Empresa

Reemplaza los archivos:
- Frontend: `frontend/public/logo-jgs.jpg`
- Backend: `backend/public/logo-jgs.jpg`

### Plantilla de PDF

Edita `backend/src/services/pdfService.js` para personalizar:
- Colores
- Fuentes
- Diseño
- Encabezados y pies de página

---

## 📞 Soporte

Si necesitas ayuda o tienes problemas:

1. 📖 Revisa la [Guía de Instalación](INSTALACION.md)
2. 📖 Revisa la [Guía de Uso](USO.md)
3. 🔍 Verifica los logs del backend y frontend
4. 💬 Verifica que PostgreSQL esté corriendo
5. 📧 Contacta al equipo de desarrollo

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

---

## 🙏 Agradecimientos

Desarrollado por **JGS Soluciones Tecnológicas**

¿Dudas o sugerencias? Abre un issue en el repositorio o contacta directamente.

---

⭐ **¡Si este proyecto te fue útil, no olvides darle una estrella!**
