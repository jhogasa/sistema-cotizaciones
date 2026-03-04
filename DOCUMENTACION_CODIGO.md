# Documentación Completa del Sistema de Cotizaciones - JGS Soluciones Tecnológicas

## Tabla de Contenidos
1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Backend - Análisis Completo](#backend---análisis-completo)
4. [Frontend - Análisis Completo](#frontend---análisis-completo)
5. [Modelos de Datos](#modelos-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Flujo de la Aplicación](#flujo-de-la-aplicación)
8. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
9. [Scripts y Utilidades](#scripts-y-utilidades)

---

## Visión General del Proyecto

### Descripción
Sistema de gestión de cotizaciones para empresas, desarrollado por JGS Soluciones Tecnológicas. Permite crear, gestionar y enviar cotizaciones a clientes, con integración de módulo financiero.

### Tecnologías
- **Backend**: Node.js, Express, Sequelize, PostgreSQL
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Autenticación**: JWT (JSON Web Tokens)
- **PDF**: PDFKit para generación de documentos
- **Email**: Nodemailer para envío de cotizaciones

---

## Estructura del Proyecto

```
sistema-cotizaciones/
├── backend/                    # Servidor API REST
│   ├── src/
│   │   ├── config/            # Configuración de BD
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middleware/        # Middlewares (auth, logger)
│   │   ├── models/            # Modelos de Sequelize
│   │   ├── routes/            # Rutas de la API
│   │   ├── services/          # Servicios (email, PDF, logger)
│   │   └── server.js          # Punto de entrada del servidor
│   └── package.json
│
├── frontend/                   # Interfaz de usuario
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── services/         # Servicios API
│   │   ├── types/            # Tipos TypeScript
│   │   └── App.tsx           # Componente principal
│   └── package.json
│
└── Start_Sistema_Cotizaciones.bat  # Script de inicio
```

---

## BACKEND - ANÁLISIS COMPLETO

### 1. package.json (Backend)

#### Dependencias principales:
| Paquete | Función |
|---------|---------|
| `express` | Framework web para crear el servidor API |
| `sequelize` | ORM para interacturar con PostgreSQL |
| `pg` | Driver de PostgreSQL para Node.js |
| `jsonwebtoken` | Generación y verificación de tokens JWT |
| `bcryptjs` | Encriptación de contraseñas |
| `cors` | Habilita solicitudes cross-origin |
| `dotenv` | Carga variables de entorno desde .env |
| `nodemailer` | Envío de emails (cotizaciones) |
| `pdfkit` | Generación de documentos PDF |
| `moment` | Manipulación de fechas |
| `number-to-words` | Conversión de números a letras |

#### Scripts disponibles:
```bash
npm run dev        # Inicia en modo desarrollo con nodemon
npm start          # Inicia el servidor en producción
npm run init-db    # Inicializa la base de datos
npm run init-superuser  # Crea el superusuario
npm run init       # Inicialización completa del sistema
```

---

### 2. server.js (Punto de entrada)

```javascript
import express from 'express';        // Framework Express
import cors from 'cors';               // Middleware CORS
import dotenv from 'dotenv';          // Variables de entorno
import { testConnection } from './config/database.js';  // Conexión BD
import { syncDatabase, Usuario } from './models/index.js';  // Modelos
import cotizacionesRoutes from './routes/cotizaciones.js';
import clientesRoutes from './routes/clientes.js';
import authRoutes from './routes/auth.js';
import proveedoresRoutes from './routes/proveedores.js';
import financieroRoutes from './routes/financiero.js';
import { authMiddleware } from './middleware/auth.js';
import { logRequests, logErrors } from './middleware/loggerMiddleware.js';
import { logger } from './services/loggerService.js';
import bcrypt from 'bcryptjs';
```

**¿Qué hace cada parte?**

1. **Importaciones**: Se traen todos los módulos necesarios
2. **Express app**: Se crea la aplicación Express
3. **Middleware base**:
   - `cors()`: Permite que el frontend se comunique con el backend
   - `express.json()`: Parsea JSON en las peticiones
   - `express.urlencoded()`: Parsea datos de formularios
   - `logRequests`: Registra cada petición HTTP

4. **Rutas públicas**: `/` y `/health` son accesibles sin autenticación
5. **Rutas protegidas**: Requieren token JWT válido
6. **Manejo de errores**: Captura errores 404 y 500

**Flujo de inicio del servidor:**
```javascript
const iniciarServidor = async () => {
    // 1. Conecta a la base de datos
    const conectado = await testConnection();
    
    // 2. Sincroniza los modelos con la BD
    await syncDatabase(false);
    
    // 3. Crea usuario admin si no existe
    const adminExists = await Usuario.findOne({ where: { rol: 'admin' } });
    if (!adminExists) { /* crear admin */ }
    
    // 4. Inicia el servidor en el puerto configurado
    app.listen(PORT, () => { /* servidor corriendo */ });
};
```

---

### 3. database.js (Configuración de Base de Datos)

```javascript
import { Sequelize } from 'sequelize';  // ORM Sequelize
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,      // Nombre de la BD
    process.env.DB_USER,      // Usuario de la BD
    process.env.DB_PASSWORD,   // Contraseña
    {
        host: process.env.DB_HOST,      // Servidor de BD
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',           // Tipo de BD
        logging: console.log,          // Muestra SQL en consola
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false }  // Conexión segura
        },
        pool: {
            max: 5,      // Máximo 5 conexiones
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,    // Agrega createdAt/updatedAt
            underscored: true,  // Usa snake_case en BD
            freezeTableName: true  // No pluraliza nombres de tablas
        }
    }
);

// Función para probar la conexión
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente.');
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error);
        return false;
    }
};

export default sequelize;
```

---

### 4. Modelos de Datos

#### Modelo de Usuario
```javascript
// Representa los usuarios del sistema
{
    id: Number,           // ID único
    nombre: String,       // Nombre completo
    email: String,        // Correo único
    password: String,     // Contraseña encriptada
    rol: String,          // 'admin', 'vendedor', 'contador'
    activo: Boolean,      // Si está activo o no
    createdAt: Date,     // Fecha de creación
    updatedAt: Date      // Fecha de actualización
}
```

#### Modelo de Cliente
```javascript
// Empresas o personas a las que se les hace cotizaciones
{
    id: Number,
    nombre: String,           // Nombre del cliente/empresa
    tipo: String,             // 'empresa' o 'persona'
    identificacion: String,   // NIT o Cédula
    telefono: String,
    email: String,
    direccion: String,
    ciudad: String,
    departamento: String,
    contacto: String,         // Nombre del contacto
    telefono_contacto: String,
    activo: Boolean,
    createdAt: Date,
    updatedAt: Date
}
```

#### Modelo de Cotización
```javascript
// Una cotización comercial
{
    id: Number,
    numero: String,           // Número único de cotización (COT-001)
    cliente_id: Number,      // FK a Cliente
    cliente_nombre: String,  // Nombre guardado en el momento
    cliente_email: String,
    cliente_direccion: String,
    fecha: Date,             // Fecha de la cotización
    validez: Number,         // Días de validez (30 por defecto)
    estado: String,          // 'borrador', 'enviada', 'aprobada', 'rechazada'
    subtotal: Number,
    descuento: Number,
    descuento_porcentaje: Number,
    iva: Number,
    total: Number,
    notas: String,           // Notas adicionales
    condiciones: String,
    usuario_id: Number,      // FK a Usuario (quién la creó)
    createdAt: Date,
    updatedAt: Date
}
```

#### Modelo de Item
```javascript
// Items/productos de una cotización
{
    id: Number,
    cotizacion_id: Number,   // FK a Cotización
    descripcion: String,     // Descripción del producto
    cantidad: Number,
    unidad: String,          // 'und', 'kg', 'hr', etc.
    precio_unitario: Number,
    descuento_porcentaje: Number,
    descuento_valor: Number,
    total: Number,
    orden: Number,           // Orden en la lista
    createdAt: Date,
    updatedAt: Date
}
```

#### Modelo de Movimiento (Financiero)
```javascript
// Movimientos de dinero (ingresos/egresos)
{
    id: Number,
    tipo: String,           // 'ingreso' o 'egreso'
    categoria: String,      // Categoría del movimiento
    descripcion: String,
    monto: Number,
    fecha: Date,
    metodo_pago: String,   // 'efectivo', 'transferencia', 'cheque'
    referencia: String,     // Número de referencia
    cliente_id: Number,    // FK opcional a Cliente
    proveedor_id: Number,   // FK opcional a Proveedor
    cotizacion_id: Number, // FK opcional a Cotización
    activo: Boolean,
    createdAt: Date,
    updatedAt: Date
}
```

---

### 5. Controladores (Lógica de Negocio)

#### authController.js
```javascript
// Maneja la autenticación de usuarios

// POST /api/auth/login
// 1. Busca el usuario por email
// 2. Compara la contraseña con bcrypt
// 3. Genera un token JWT
// 4. Retorna el token y datos del usuario

// GET /api/auth/me
// 1. Obtiene el token del header
// 2. Verifica el token con JWT_SECRET
// 3. Busca el usuario en la BD
// 4. Retorna los datos del usuario

// PUT /api/auth/cambiar-password
// 1. Verifica la contraseña actual
// 2. Encripta la nueva contraseña
// 3. Actualiza en la BD

// GET /api/auth/usuarios (solo admin)
// 1. Lista todos los usuarios

// POST /api/auth/usuarios (solo admin)
// 1. Crea un nuevo usuario
// 2. Encripta la contraseña
```

#### clienteController.js
```javascript
// Maneja las operaciones CRUD de clientes

// GET /api/clientes
// 1. Obtiene lista de clientes
// 2. Soporta paginación (page, limit)
// 3. Soporta búsqueda (search)

// POST /api/clientes
// 1. Valida los datos
// 2. Crea el cliente en BD

// PUT /api/clientes/:id
// 1. Busca el cliente
// 2. Actualiza los campos

// DELETE /api/clientes/:id
// 1. Busca el cliente
// 2. Lo marca como inactivo (soft delete)
```

#### cotizacionController.js
```javascript
// Maneja todo lo relacionado con cotizaciones

// GET /api/cotizaciones
// 1. Lista cotizaciones con filtros
// 2. Estados: borrador, enviada, aprobada, rechazada

// POST /api/cotizaciones
// 1. Genera el número de cotización
// 2. Crea la cotización
// 3. Crea los items asociados

// PUT /api/cotizaciones/:id
// 1. Actualiza la cotización
// 2. Actualiza o crea items

// GET /api/cotizaciones/:id/pdf
// 1. Genera el PDF con PDFKit
// 2. Retorna el archivo PDF

// POST /api/cotizaciones/:id/enviar
// 1. Genera el PDF
// 2. Envía por email al cliente

// PUT /api/cotizaciones/:id/estado
// 1. Cambia el estado de la cotización
```

#### proveedorController.js
```javascript
// CRUD de proveedores (similar a clientes)
// GET, POST, PUT, DELETE de proveedores
```

#### financieroController.js
```javascript
// Módulo financiero del sistema

// GET /api/financiero/resumen
// Retorna balance, ingresos, egresos

// GET /api/financiero/movimientos
// Lista todos los movimientos

// POST /api/financiero/movimientos
// Crea un nuevo movimiento

// GET /api/financiero/dashboard
// Retorna datos para el dashboard financiero

// GET /api/financiero/cuentas-por-cobrar
// Lista facturas pendientes de pago

// POST /api/financiero/pagos
// Registra un pago de cliente
```

---

### 6. Middlewares

#### auth.js (Autenticación)
```javascript
// Protege rutas privadas
export const authMiddleware = (req, res, next) => {
    // 1. Obtiene el token del header: "Authorization: Bearer <token>"
    // 2. Verifica que exista el token
    // 3. Decodifica el token con JWT_SECRET
    // 4. Busca el usuario en la BD
    // 5. Agrega el usuario a req.user
    // 6. Llama a next() para continuar
};
```

#### loggerMiddleware.js (Logging)
```javascript
// Registra todas las peticiones
export const logRequests = (req, res, next) => {
    // 1. Registra timestamp
    // 2. Registra método y path
    // 3. Ejecuta la petición
    // 4. Registra el código de respuesta
};

export const logErrors = (err, req, res, next) => {
    // Registra errores en el sistema de logging
};
```

---

### 7. Servicios

#### emailService.js
```javascript
// Envío de emails con Nodemailer
// Configurado con Gmail (jgs.tecnologias@gmail.com)
// Usa App Password para autenticación

// Enviar cotización por email:
// 1. Genera el PDF
// 2. Configura el transporte SMTP
// 3. Envía el email con el PDF adjunto
```

#### pdfService.js
```javascript
// Generación de PDFs con PDFKit

// generarPDF(cotizacion, items, empresa)
// 1. Crea un nuevo documento PDF
// 2. Agrega el logo de la empresa
// 3. Agrega datos del cliente
// 4. Lista los items en una tabla
// 5. Calcula subtotal, descuento, IVA, total
// 6. Convierte el total a letras
// 7. Retorna el buffer del PDF
```

#### loggerService.js
```javascript
// Sistema de logging personalizado

// Métodos:
// logger.divider()  - Línea separadora
// logger.system()    - Mensajes del sistema
// logger.api()       - Peticiones API
// logger.success()   - Éxitos
// logger.warn()      - Advertencias
// logger.error()     - Errores
// logger.info()      - Información

// Guarda logs en archivos:
// - logs/sistema-YYYY-MM-DD.log
// - logs/api-YYYY-MM-DD.log
// - logs/error-YYYY-MM-DD.log
```

---

### 8. Rutas de la API

```
/api/auth
├── POST   /login              - Iniciar sesión
├── GET    /me                 - Datos del usuario actual
├── PUT    /cambiar-password   - Cambiar contraseña
├── GET    /usuarios          - Listar usuarios (admin)
├── POST   /usuarios          - Crear usuario (admin)
├── PUT    /usuarios/:id      - Actualizar usuario (admin)
└── DELETE /usuarios/:id      - Eliminar usuario (admin)

/api/clientes
├── GET    /           - Listar clientes
├── GET    /:id        - Ver cliente
├── POST   /           - Crear cliente
├── PUT    /:id        - Actualizar cliente
└── DELETE /:id        - Eliminar cliente

/api/cotizaciones
├── GET    /                    - Listar cotizaciones
├── GET    /siguiente-numero    - Próximo número
├── GET    /:id                 - Ver cotización
├── POST   /                    - Crear cotización
├── PUT    /:id                - Actualizar cotización
├── DELETE /:id                - Eliminar cotización
├── GET    /:id/pdf            - Descargar PDF
├── POST   /:id/enviar          - Enviar por email
└── PUT    /:id/estado         - Cambiar estado

/api/proveedores
├── GET    /           - Listar proveedores
├── POST   /           - Crear proveedor
├── PUT    /:id        - Actualizar proveedor
└── DELETE /:id        - Eliminar proveedor

/api/financiero
├── GET    /resumen            - Resumen financiero
├── GET    /movimientos        - Lista de movimientos
├── POST   /movimientos        - Crear movimiento
├── GET    /dashboard          - Datos del dashboard
├── GET    /cuentas-por-cobrar - Facturas pendientes
└── POST   /pagos              - Registrar pago
```

---

## FRONTEND - ANÁLISIS COMPLETO

### 1. package.json (Frontend)

#### Dependencias principales:
| Paquete | Función |
|---------|---------|
| `react` | Biblioteca para construir la UI |
| `react-dom` | Renderizado de React en el DOM |
| `react-router-dom` | Navegación entre páginas |
| `axios` | Cliente HTTP para llamadas API |
| `react-hot-toast` | Notificaciones emergentes |
| `lucide-react` | Iconos para la interfaz |
| `date-fns` | Manipulación de fechas |
| `clsx` | Utilidad para clases condicionales |
| `tailwindcss` | Estilos CSS |

#### Scripts:
```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Compila para producción
npm run preview  # Previsualiza la build
```

---

### 2. Estructura de Componentes

#### App.tsx (Componente Principal)
```typescript
// Maneja la navegación y rutas
<Routes>
    <Route path="/" element={<LoginForm />} />
    <Route path="/login" element={<LoginForm />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/clientes" element={<ClienteList />} />
    <Route path="/clientes/nuevo" element={<ClienteForm />} />
    <Route path="/cotizaciones" element={<CotizacionList />} />
    <Route path="/cotizaciones/nueva" element={<CotizacionForm />} />
    <Route path="/cotizaciones/:id" element={<CotizacionView />} />
    <Route path="/financiero" element={<DashboardFinanciero />} />
    <Route path="/usuarios" element={<UserManagement />} />
</Routes>
```

---

### 3. Servicios API (api.ts)

```typescript
// Configuración de Axios
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor de requests - agrega token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de responses - maneja 401 (token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.dispatchEvent(new Event('auth-logout'));
        }
        return Promise.reject(error);
    }
);
```

---

### 4. Flujo de Autenticación

```typescript
// LoginForm.tsx
// 1. Usuario ingresa email y password
// 2. Llama a authApi.login(credentials)
// 3. Backend verifica credenciales
// 4. Backend retorna token JWT
// 5. Frontend guarda token en localStorage
// 6. Redirige al dashboard
// 7. Cada request incluye el token en el header
```

---

### 5. Componentes Principales

#### LoginForm.tsx
- Formulario de inicio de sesión
- Valida email y password
- Llama al endpoint de login
- Guarda token y redirige

#### ClienteList.tsx
- Lista todos los clientes
- Tabla con paginación
- Botones de editar/eliminar
- Barra de búsqueda

#### ClienteForm.tsx
- Formulario para crear/editar clientes
- Validación de campos
- Envía datos al API

#### CotizacionList.tsx
- Lista cotizaciones con filtros
- Estados: borrador, enviada, aprobada, rechazada
- Acciones: ver, editar, eliminar, PDF, enviar

#### CotizacionForm.tsx
- Formulario completo de cotización
- Selector de cliente
- Lista dinámica de items
- Cálculos automáticos de totales
- Guardado automático

#### CotizacionView.tsx
- Ver detalles de una cotización
- Ver items
- Opciones: PDF, enviar, cambiar estado

#### DashboardFinanciero.tsx
- Resumen de ingresos/egresos
- Gráficos de financieras
- Cuentas por cobrar
- Últimos movimientos

#### UserManagement.tsx
- CRUD de usuarios (solo admin)
- Lista usuarios
- Crear/editar/eliminar
- Cambiar rol

---

### 6. Tipos TypeScript (types/index.ts)

```typescript
// Definiciones de tipos principales

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: 'admin' | 'vendedor' | 'contador';
    activo: boolean;
}

interface Cliente {
    id: number;
    nombre: string;
    tipo: 'empresa' | 'persona';
    identificacion: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    departamento: string;
    activo: boolean;
}

interface Cotizacion {
    id: number;
    numero: string;
    cliente_id: number;
    cliente_nombre: string;
    fecha: Date;
    validez: number;
    estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada';
    subtotal: number;
    descuento: number;
    iva: number;
    total: number;
    items: Item[];
}

interface Item {
    id?: number;
    cotizacion_id?: number;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precio_unitario: number;
    descuento_porcentaje: number;
    total: number;
}
```

---

### 7. Archivo de Estilos (index.css)

```css
/* TailwindCSS - Framework de estilos */

/* Configuración base */
/* - Reset de estilos */
/* - Variables personalizadas */
/* - Fuentes del sistema */

/* Componentes */
/* - Botones, formularios, tablas */
/* - Utilidades de Tailwind */
```

---

## CONFIGURACIÓN Y VARIABLES DE ENTORNO

### backend/.env
```env
# Base de datos
DB_HOST=dpg-d6egg6lm5p6s73fn9of0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=railway_j1u0
DB_USER=postgresdba
DB_PASSWORD=tu_password

# Servidor
PORT=3000
NODE_ENV=development

# Email
EMAIL_USER=jgs.tecnologias@gmail.com
EMAIL_PASSWORD=tu_app_password

# Autenticación
JWT_SECRET=tu_secret_key
JWT_EXPIRES_IN=24h
```

### frontend/.env
```env
VITE_API_URL=http://localhost:3000
```

---

## FLUJO DE LA APLICACIÓN

### 1. Inicio de sesión
```
Usuario → LoginForm → API /auth/login → JWT Token → Redirigir a Dashboard
```

### 2. Crear Cotización
```
Dashboard → Nueva Cotización → Seleccionar Cliente → Agregar Items → 
Calcular Totales → Guardar → Generar PDF → Enviar por Email
```

### 3. Proceso Financiero
```
Cotización Aprobada → Registrar Ingreso → Dashboard Financiero → 
Ver Resumen → Gestionar Cuentas por Cobrar
```

---

## SCRIPTS DEL SISTEMA

### initDatabase.js
- Crea las tablas en la base de datos
- Ejecuta migraciones si es necesario

### initSuperUser.js
- Crea el usuario administrador por defecto
- Email: admin@jgs.com
- Password: admin123

### initSystem.js
- Inicialización completa
- Crea tablas
- Crea usuario admin
- Mensajes de confirmación

---

## CONCLUSIÓN

Este sistema de cotizaciones está diseñado con una arquitectura moderna y escalable:

1. **Separación de responsabilidades**: Backend maneja la lógica, Frontend la interfaz
2. **Seguridad**: JWT para autenticación, contraseñas encriptadas
3. **Flexibilidad**: Base de datos relacional con Sequelize ORM
4. **Productividad**: Generación automática de PDFs, envío de emails
5. **Mantenibilidad**: Código bien estructurado y documentado

El sistema puede desplegarse tanto localmente como en la nube (Render), manteniendo la misma funcionalidad en ambos entornos.
