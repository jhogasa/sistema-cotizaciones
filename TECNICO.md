# Documentación Técnica del Sistema de Cotizaciones

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Flujo de Autenticación](#flujo-de-autenticación)
3. [Flujo de Cotizaciones](#flujo-de-cotizaciones)
4. [Flujo de Clientes (CRM)](#flujo-de-clientes-crm)
5. [Estructura de Base de Datos](#estructura-de-base-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Generación de PDF](#generación-de-pdf)
8. [Envío de Emails](#envío-de-emails)
9. [Sistema de Logging](#sistema-de-logging)

---

## 🏗️ Arquitectura General

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript                              │   │
│  │  Vite (build tool)                                 │   │
│  │  Tailwind CSS (estilos)                            │   │
│  │  React Hot Toast (notificaciones)                  │   │
│  │  Lucide React (iconos)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express                                │   │
│  │  JWT (autenticación)                             │   │
│  │  Sequelize ORM (PostgreSQL)                      │   │
│  │  PDFKit (generación de PDFs)                     │   │
│  │  Nodemailer (envío de emails)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL                                       │   │
│  │  - Usuarios                                      │   │
│  │  - Cotizaciones                                  │   │
│  │  - Clientes (CRM)                               │   │
│  │  - Contactos                                    │   │
│  │  - Interacciones                                │   │
│  │  - Documentos                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

### Proceso de Login

```
1. USUARIO INGRESA CREDENCIALES
   └─► LoginForm.tsx captura email y password

2. FRONTEND ENVÍA PETICIÓN
   └─► POST /api/auth/login
       Body: { email, password }

3. BACKEND PROCESA
   authController.js → login()
   │
   ├─► Busca usuario por email en DB
   │    └─► Usuario.findOne({ where: { email } })
   │
   ├─► Verifica contraseña
   │    └─► bcrypt.compare(password, usuario.password)
   │
   ├─► Genera token JWT
   │    └─► jwt.sign({ id, rol }, SECRET_KEY, { expiresIn: '24h' })
   │
   └─► Responde con token y datos del usuario

4. FREND ALMACENA TOKEN
   └─► localStorage.setItem('token', response.data.token)
       localStorage.setItem('usuario', JSON.stringify(usuario))

5. PETICIONES POSTERIORES INCLUYEN TOKEN
   └─► Authorization: Bearer <token>
       (Interceptador en api.ts agrega el token automáticamente)

6. MIDDLEWARE VERIFICA TOKEN
   └─► auth.js → verificarToken()
       │
       ├─► Extrae token del header
       ├─► Verifica con jwt.verify()
       ├─► Agrega usuario a req.usuario
       └─► Continúa a la siguiente función
```

### Estructura del Token JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": 1,
    "email": "admin@jgs.com",
    "rol": "admin",
    "iat": 1700000000,
    "exp": 1700086400
  }
}
```

---

## 📄 Flujo de Cotizaciones

### Crear Nueva Cotización

```
1. USUARIO HACE CLIC EN "NUEVA COTIZACIÓN"
   └─► App.tsx → setView('create')

2. SE MUESTRA CotizacionForm.tsx
   └─► Formulario vacío con datos del emisor por defecto

3. (OPCIONAL) BUSCAR CLIENTE DEL CRM
   └─► ClienteSearch.tsx
       │
       ├─► Usuario escribe NIT o nombre
       ├─► API: GET /api/clientes?search=xxx
       ├─► Muestra lista de resultados
       └─► Al seleccionar → autocompleta campos del cliente

4. USUARIO COMPLETA DATOS
   ├─► Datos del cliente (nombre, nit, email, etc.)
   ├─► Items (productos/servicios)
   │    ├─► Agregar item
   │    ├─► Editar item (descripción, cantidad, precio)
   │    └─► Eliminar item
   └─► Totales (subtotal, impuestos, total)

5. USUARIO HACE CLIC EN "GUARDAR"
   └─► handleSubmit() → onSubmit(data)

6. FRONTEND ENVÍA A API
   └─► POST /api/cotizaciones
       Body: {
         cliente_id: 1,
         cliente_nombre: "Empresa ABC",
         cliente_nit: "12345678-9",
         items: [...],
         ...
       }

7. BACKEND PROCESA
   cotizacionController.js → crear()
   │
   ├─► Genera número de cotización
   │    └─► Formato: COT-YYYY-NNNN
   │        └─► Busca último número del año y suma 1
   │
   ├─► Crea cotización con estado 'borrador'
   │    └─► Cotizacion.create({ ... })
   │
   ├─► Crea items asociados
   │    └─► Promise.all(items.map(item => Item.create(...)))
   │
   ├─► Actualiza totales calculados
   │
   └─► Registra en logs

8. BACKEND RESPONDE
   └─► { message: "Cotización creada", data: cotizacion }

9. FRONTEND ACTUALIZA LISTA
   └─► cargarCotizaciones()
       └─► GET /api/cotizaciones
```

### Estados de una Cotización

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   BORRADOR  │────►│   ENVIADA   │────►│  ACEPTADA   │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ANULADA   │     │  RECHAZADA  │     │   FACTURADA │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Generar PDF de Cotización

```
1. USUARIO HACE CLIC EN "DESCARGAR PDF"
   └─► handleDownloadPDF()

2. FRONTEND LLAMA API
   └─► GET /api/cotizaciones/:id/pdf

3. BACKEND GENERA PDF
   pdfService.js → generarPDF(cotizacion)
   │
   ├─► Crea documento PDF con PDFKit
   │    └─► pdf = new PDFDocument({ margin: 50 })
   │
   ├─► Agrega contenido
   │    ├─► Logo de la empresa
   │    ├─► Datos del emisor (JGS Soluciones)
   │    ├─► Datos del cliente
   │    ├─► Tabla de items (descripción, cantidad, precio, total)
   │    ├─► Subtotal, impuestos, total
   │    └─► Notas y condiciones
   │
   └─► Convierte a buffer

4. BACKEND ENVÍA PDF
   └─► Content-Type: application/pdf
       Content-Disposition: attachment; filename="cotizacion_2024-0001.pdf"

5. FRONTEND DESCARGAR
   └─► downloadBlob(blob, filename)
       └─► Crea enlace temporal y dispara descarga
```

### Enviar Cotización por Email

```
1. USUARIO HACE CLIC EN "ENVIAR POR EMAIL"
   └─► handleSendEmail()

2. FREND LLAMA API
   └─► POST /api/cotizaciones/:id/enviar
       Body: { email: "cliente@email.com" }

3. BACKEND PROCESA
   cotizacionController.js → enviarEmail()
   │
   ├─► Genera PDF de la cotización
   │    └─► pdfService.generarPDF(cotizacion)
   │
   ├─► Configura email con Nodemailer
   │    ├─► Destinatario: email del cliente
   │    ├─► Asunto: "Cotización COT-2024-0001"
   │    ├─► Cuerpo: Mensaje personalizado
   │    └─► Adjunto: PDF de la cotización
   │
   └─► Envía email
       └─► nodemailer.sendMail(config)

4. ACTUALIZA ESTADO
   └─► cotizacion.estado = 'enviada'
       └─► cotizacion.save()

5. FREND ACTUALIZA LISTA
   └─► cargarCotizaciones()
```

---

## 👥 Flujo de Clientes (CRM)

### Crear Nuevo Cliente

```
1. USUARIO NAVEGA A "CLIENTES"
   └─► App.tsx → setView('clientes-list')

2. SE MUESTRA ClienteList.tsx
   └─► Lista de todos los clientes
       └─► GET /api/clientes

3. USUARIO HACE CLIC EN "NUEVO CLIENTE"
   └─► App.tsx → setView('clientes-create')
       └─► ClienteForm.tsx

4. USUARIO COMPLETA DATOS
   ├─► Tipo: Empresa o Persona
   ├─► Datos básicos: nombre, nit, email, teléfono
   ├─► Dirección: dirección, ciudad, departamento
   ├─► Clasificación: estado, sector, prioridad, tamaño
   ├─► Contactos (para empresas)
   │    └─► Nombre, cargo, teléfono, email
   └─► Notas internas

5. USUARIO HACE CLIC EN "GUARDAR"
   └─► handleSubmit()

6. FRONTEND ENVÍA A API
   └─► POST /api/clientes
       Body: {
         tipo: "empresa",
         nombre: "Empresa ABC",
         nit: "12345678-9",
         contactos: [...],
         ...
       }

7. BACKEND PROCESA
   clienteController.js → crear()
   │
   ├─► Crea cliente
   │    └─► Cliente.create({ ... })
   │
   └─► Crea contactos asociados (si es empresa)
       └─► Promise.all(contactos.map(c => Contacto.create(...)))

8. CLIENTE Queda DISPONIBLE PARA COTIZACIONES
   └─► Puede ser buscado en CotizacionForm
```

### Registrar Interacción con Cliente

```
1. USUARIO SELECCIONA UN CLIENTE
   └─► ClienteDetail.tsx (pendiente de implementar)

2. HACE CLIC EN "AGREGAR INTERACCIÓN"
   └─► Modal de nueva interacción

3. COMPLETA DATOS
   ├─► Tipo: llamada, whatsapp, email, visita, reunión, nota
   ├─► Descripción: resumen de la interacción
   ├─► Fecha: cuando ocurrió
   └─► Resultado: (opcional) qué se logró

4. GUARDA INTERACCIÓN
   └─► POST /api/clientes/:id/interacciones

5. INTERACCIÓN QUEDA EN HISTORIAL
   └─► Visible en el perfil del cliente
```

---

## 🗄️ Estructura de Base de Datos

### Modelo de Usuarios

```
tabla: usuarios
├─ id (INTEGER, PK)
├─ nombre (VARCHAR)
├─ email (VARCHAR, unique)
├─ password (VARCHAR)
├─ rol (ENUM: 'admin', 'usuario')
├─ activo (BOOLEAN)
├─ ultimo_login (DATETIME)
├─ created_at (DATETIME)
└─ updated_at (DATETIME)
```

### Modelo de Cotizaciones

```
tabla: cotizaciones
├─ id (INTEGER, PK)
├─ numero_cotizacion (VARCHAR, unique)
├─ usuario_id (INTEGER, FK)
├─ cliente_id (INTEGER, FK, nullable)
├─ emisor_nombre (VARCHAR)
├─ emisor_nit (VARCHAR)
├─ emisor_direccion (TEXT)
├─ emisor_web (VARCHAR)
├─ emisor_contacto (VARCHAR)
├─ emisor_email (VARCHAR)
├─ emisor_telefono (VARCHAR)
├─ cliente_nombre (VARCHAR)
├─ cliente_nit (VARCHAR)
├─ cliente_direccion (TEXT)
├─ cliente_web (VARCHAR)
├─ cliente_contacto (VARCHAR)
├─ cliente_email (VARCHAR)
├─ cliente_telefono (VARCHAR)
├─ fecha (DATE)
├─ validez_oferta (INTEGER)
├─ divisa (VARCHAR)
├─ forma_pago (VARCHAR)
├─ subtotal (DECIMAL)
├─ impuesto_porcentaje (DECIMAL)
├─ impuesto_valor (DECIMAL)
├─ total (DECIMAL)
├─ notas (TEXT)
├─ condiciones (TEXT)
├─ estado (ENUM: 'borrador', 'enviada', 'aceptada', 'rechazada', 'anulada')
├─ created_at (DATETIME)
└─ updated_at (DATETIME)
```

### Modelo de Items (detalles de cotización)

```
tabla: items
├─ id (INTEGER, PK)
├─ cotizacion_id (INTEGER, FK)
├─ descripcion (TEXT)
├─ cantidad (DECIMAL)
├─ precio_unitario (DECIMAL)
├─ descuento_porcentaje (DECIMAL)
├─ total (DECIMAL)
└─ orden (INTEGER)
```

### Modelo de Clientes (CRM)

```
tabla: clientes
├─ id (INTEGER, PK)
├─ tipo (ENUM: 'empresa', 'persona')
├─ nombre (VARCHAR)
├─ nit (VARCHAR)
├─ telefono (VARCHAR)
├─ email (VARCHAR)
├─ direccion (TEXT)
├─ ciudad (VARCHAR)
├─ departamento (VARCHAR)
├─ pagina_web (VARCHAR)
├─ estado (ENUM: 'prospecto', 'activo', 'inactivo', 'moroso')
├─ sector (VARCHAR)
├─ prioridad (ENUM: 'alta', 'media', 'baja')
├─ tamano (ENUM: 'pequeno', 'mediano', 'grande')
├─ notas_internas (TEXT)
├─ sincronizado (BOOLEAN)
├─ ultimo_contacto (DATETIME)
├─ created_at (DATETIME)
└─ updated_at (DATETIME)
```

### Modelo de Contactos

```
tabla: contactos
├─ id (INTEGER, PK)
├─ cliente_id (INTEGER, FK)
├─ nombre (VARCHAR)
├─ cargo (VARCHAR)
├─ telefono (VARCHAR)
├─ email (VARCHAR)
├─ es_principal (BOOLEAN)
├─ activo (BOOLEAN)
├─ created_at (DATETIME)
└─ updated_at (DATETIME)
```

### Modelo de Interacciones

```
tabla: interacciones
├─ id (INTEGER, PK)
├─ cliente_id (INTEGER, FK)
├─ usuario_id (INTEGER, FK)
├─ tipo (ENUM: 'llamada', 'whatsapp', 'email', 'visita', 'reunion', 'nota')
├─ descripcion (TEXT)
├─ fecha (DATETIME)
├─ duracion_minutos (INTEGER)
├─ resultado (VARCHAR)
├─ created_at (DATETIME)
└─ updated_at (DATETIME)
```

### Modelo de Documentos

```
tabla: documentos
├─ id (INTEGER, PK)
├─ cliente_id (INTEGER, FK)
├─ usuario_id (INTEGER, FK)
├─ tipo (ENUM: 'rut', 'camara_comercio', 'contrato', 'cedula', 'certificado', 'otro')
├─ nombre (VARCHAR)
├─ nombre_archivo (VARCHAR)
├─ ruta_archivo (VARCHAR)
├─ tamano (INTEGER)
├─ mime_type (VARCHAR)
├─ created_at (DATETIME)
└─ updated_at (DATETIME)
```

---

## 🌐 API Endpoints - Documentación Detallada

### 📁 Estructura de Archivos de la API

```
backend/src/
├── routes/              # Definición de rutas
│   ├── auth.js        # Rutas de autenticación
│   ├── cotizaciones.js # Rutas de cotizaciones
│   └── clientes.js     # Rutas de clientes
│
├── controllers/        # Lógica de negocio
│   ├── authController.js
│   ├── cotizacionController.js
│   └── clienteController.js
│
├── services/          # Servicios externos
│   ├── pdfService.js
│   ├── emailService.js
│   └── loggerService.js
│
├── middleware/        # Middlewares
│   ├── auth.js        # Verificación de token
│   └── loggerMiddleware.js
│
└── models/           # Modelos de BD
    ├── index.js      # Asociaciones
    ├── Usuario.js
    ├── Cotizacion.js
    ├── Item.js
    ├── Cliente.js
    ├── Contacto.js
    ├── Interaccion.js
    └── Documento.js
```

---

### 🔐 API de Autenticación

#### Archivo: `backend/src/routes/auth.js`

| Método | Endpoint | Función | Controlador |
|--------|----------|---------|-------------|
| POST | `/api/auth/login` | Iniciar sesión | `authController.login()` |
| POST | `/api/auth/logout` | Cerrar sesión | `authController.logout()` |
| POST | `/api/auth/cambiar-password` | Cambiar contraseña | `authController.cambiarPassword()` |
| GET | `/api/auth/perfil` | Obtener perfil | `authController.obtenerPerfil()` |

#### Detalle de Endpoints de Auth

##### POST /api/auth/login
```
Archivos involucrados:
├─ backend/src/routes/auth.js (línea 12-20)
├─ backend/src/controllers/authController.js (línea 15-55)
├─ backend/src/middleware/auth.js (verificarToken)
└─ backend/src/services/loggerService.js

Flujo:
1. Frontend envía: { email, password }
2. authController.login() recibe petición
3. Busca usuario: Usuario.findOne({ where: { email }})
4. Compara contraseña: bcrypt.compare(password, hash)
5. Genera token: jwt.sign({ id, email, rol }, SECRET)
6. Registra login en logs
7. Responde: { token, usuario: { id, nombre, email, rol } }

Códigos de respuesta:
├─ 200: Login exitoso
├─ 401: Credenciales inválidas
└─ 500: Error del servidor
```

##### POST /api/auth/cambiar-password
```
Archivos involucrados:
├─ backend/src/routes/auth.js (línea 28-35)
└─ backend/src/controllers/authController.js (línea 130-175)

Flujo:
1. Frontend envía: { passwordActual, passwordNuevo }
2. Middleware auth.js verifica token y extrae req.usuario.id
3. authController.cambiarPassword() procesa
4. Verifica contraseña actual
5. Hashea nueva contraseña: bcrypt.hash(passwordNuevo, 10)
6. Actualiza usuario: Usuario.update({ password: hash }, { where: { id }})
7. Registra cambio en logs

Validaciones:
├─ Contraseña actual debe ser correcta
├─ Nueva contraseña mínimo 6 caracteres
└─ Contraseñas nuevas deben coincidir
```

---

### 📄 API de Cotizaciones

#### Archivo: `backend/src/routes/cotizaciones.js`

| Método | Endpoint | Función | Controlador |
|--------|----------|---------|-------------|
| GET | `/api/cotizaciones` | Listar cotizaciones | `cotizacionController.obtenerTodas()` |
| GET | `/api/cotizaciones/:id` | Ver cotización | `cotizacionController.obtenerPorId()` |
| POST | `/api/cotizaciones` | Crear cotización | `cotizacionController.crear()` |
| PUT | `/api/cotizaciones/:id` | Actualizar cotización | `cotizacionController.actualizar()` |
| DELETE | `/api/cotizaciones/:id` | Eliminar cotización | `cotizacionController.eliminar()` |
| GET | `/api/cotizaciones/:id/pdf` | Generar PDF | `pdfService.generarPDF()` |
| POST | `/api/cotizaciones/:id/enviar` | Enviar por email | `cotizacionController.enviarPorEmail()` |
| PUT | `/api/cotizaciones/:id/estado` | Cambiar estado | `cotizacionController.actualizarEstado()` |
| GET | `/api/cotizaciones/exportar` | Exportar Excel | `cotizacionController.exportar()` |

#### Detalle de Endpoints de Cotizaciones

##### GET /api/cotizaciones
```
Archivos involucrados:
├─ backend/src/routes/cotizaciones.js (línea 15-25)
└─ backend/src/controllers/cotizacionController.js (línea 20-55)

Query Parameters:
├─ page: Número de página (default: 1)
├─ limit: Registros por página (default: 10)
├─ search: Buscar en cliente_nombre, cliente_nit
├─ estado: Filtrar por estado
├─ fecha_desde: Fecha inicial
└─ fecha_hasta: Fecha final

Flujo:
1. Frontend envía: GET /api/cotizaciones?page=1&limit=10&search=abc
2. cotizacionController.obtenerTodas() procesa
3. Construye WHERE clause dinámico
4. Obtiene total: Cotizacion.count({ where })
5. Obtiene datos: Cotizacion.findAll({ where, limit, offset, order })
6. Responde: { data, pagination: { total, page, pages } }

Ordenamiento:
└─ Default: orden DESC por created_at
```

##### POST /api/cotizaciones
```
Archivos involucrados:
├─ backend/src/routes/cotizaciones.js (línea 27-35)
├─ backend/src/controllers/cotizacionController.js (línea 60-130)
├─ backend/src/services/pdfService.js
└─ backend/src/services/loggerService.js

Request Body:
{
  "cliente_id": 1,
  "cliente_nombre": "Empresa ABC",
  "cliente_nit": "12345678-9",
  "cliente_direccion": "Calle 123",
  "cliente_email": "contacto@empresa.com",
  "cliente_telefono": "3001234567",
  "cliente_contacto": "Juan Pérez",
  "fecha": "2024-01-15",
  "validez_oferta": 30,
  "forma_pago": "Transferencia bancaria",
  "divisa": "COP",
  "notas": "Precios válidos por 30 días",
  "items": [
    {
      "descripcion": "Servicio de hosting",
      "cantidad": 1,
      "precio_unitario": 150000,
      "descuento_porcentaje": 0,
      "total": 150000
    }
  ]
}

Flujo:
1. Genera número: COT-2024-0001
   └─ Consulta último número del año actual
2. Crea cotización: Cotizacion.create({ ... })
3. Crea items: Promise.all(items.map(Item.create))
4. Calcula totales (si no vienen del frontend)
5. Genera PDF: pdfService.generarPDF(cotizacion)
6. Registra creación en logs
7. Responde: { message, data: cotizacion }

Validaciones:
├─ cliente_nombre: obligatorio
├─ cliente_nit: obligatorio
├─ items: mínimo 1 item
└─ Cada item debe tener descripcion y total
```

##### GET /api/cotizaciones/:id
```
Archivos involucrados:
├─ backend/src/routes/cotizaciones.js (línea 37-45)
└─ backend/src/controllers/cotizacionController.js (línea 135-165)

Respuesta incluye:
{
  "id": 1,
  "numero_cotizacion": "COT-2024-0001",
  "items": [...],
  "created_at": "2024-01-15T10:00:00Z",
  "usuario": { "id": 1, "nombre": "Admin", "email": "admin@jgs.com" }
}

Incluye automáticamente:
├─ Items: Cotizacion.hasMany(Item)
└─ Usuario: belongsTo(Usuario)
```

##### GET /api/cotizaciones/:id/pdf
```
Archivos involucrados:
├─ backend/src/routes/cotizaciones.js (línea 75-85)
├─ backend/src/controllers/cotizacionController.js (línea 260-290)
└─ backend/src/services/pdfService.js (generarPDF)

Response Headers:
├─ Content-Type: application/pdf
└─ Content-Disposition: attachment; filename="cotizacion_COT-2024-0001.pdf"

Flujo:
1. Obtiene cotización: Cotizacion.findByPk(id, { include: ['items'] })
2. Genera PDF con PDFKit
3. Configura respuesta como archivo binario
4. Envía buffer del PDF

Estructura del PDF (pdfService.js):
├─ Logo de empresa (imagen PNG/JPG)
├─ Datos del emisor (JGS Soluciones)
├─ Datos del cliente
├─ Tabla de items con precios
├─ Subtotal, impuestos, total
├─ Notas y condiciones
└─ Pie de página con validez
```

##### POST /api/cotizaciones/:id/enviar
```
Archivos involucrados:
├─ backend/src/routes/cotizaciones.js (línea 87-100)
├─ backend/src/controllers/cotizacionController.js (línea 295-350)
├─ backend/src/services/pdfService.js
└─ backend/src/services/emailService.js

Request Body:
{
  "email": "cliente@email.com",  // Opcional, usa el de la cotización
  "mensaje": "Hola, adjuntamos..."  // Opcional
}

Flujo:
1. Genera PDF de la cotización
2. Configura Nodemailer con SMTP
3. Envía email con PDF adjunto
4. Actualiza estado a 'enviada'
5. Registra envío en logs
6. Responde: { message: "Cotización enviada" }

Configuración de Email (emailService.js):
├─ Host: SMTP server
├─ Port: 587 o 465
├─ Secure: true/false
├─ Auth: { user, pass }
└─ Adjunto: PDF generado
```

---

### 👥 API de Clientes (CRM)

#### Archivo: `backend/src/routes/clientes.js`

| Método | Endpoint | Función | Controlador |
|--------|----------|---------|-------------|
| GET | `/api/clientes` | Listar clientes | `clienteController.obtenerTodos()` |
| GET | `/api/clientes/:id` | Ver cliente | `clienteController.obtenerPorId()` |
| POST | `/api/clientes` | Crear cliente | `clienteController.crear()` |
| PUT | `/api/clientes/:id` | Actualizar cliente | `clienteController.actualizar()` |
| DELETE | `/api/clientes/:id` | Eliminar cliente | `clienteController.eliminar()` |
| GET | `/api/clientes/:id/contactos` | Listar contactos | `clienteController.obtenerContactos()` |
| POST | `/api/clientes/:id/contactos` | Agregar contacto | `clienteController.agregarContacto()` |
| DELETE | `/api/clientes/:id/contactos/:contactoId` | Eliminar contacto | `clienteController.eliminarContacto()` |
| GET | `/api/clientes/:id/interacciones` | Listar interacciones | `clienteController.obtenerInteracciones()` |
| POST | `/api/clientes/:id/interacciones` | Registrar interacción | `clienteController.agregarInteraccion()` |
| DELETE | `/api/clientes/:id/interacciones/:interaccionId` | Eliminar interacción | `clienteController.eliminarInteraccion()` |

#### Detalle de Endpoints de Clientes

##### GET /api/clientes
```
Archivos involucrados:
├─ backend/src/routes/clientes.js (línea 15-30)
└─ backend/src/controllers/clienteController.js (línea 20-70)

Query Parameters:
├─ page: Número de página (default: 1)
├─ limit: Registros por página (default: 10)
├─ search: Buscar en nombre, nit, email
├─ estado: Filtrar por estado (prospecto, activo, inactivo, moroso)
├─ prioridad: Filtrar por prioridad (alta, media, baja)
├─ sector: Filtrar por sector
└─ tipo: Filtrar por tipo (empresa, persona)

Flujo:
1. Frontend envía: GET /api/clientes?search=abc&estado=activo
2. clienteController.obtenerTodos() procesa
3. Construye WHERE clause con operadores Sequelize
   ├─ Op.or para búsqueda en múltiples campos
   ├─ Op.and para filtros combinados
4. Obtiene clientes con paginación
5. Responde con datos y metadatos de paginación

Ejemplo de query construida:
WHERE (
  nombre ILIKE '%abc%' OR
  nit ILIKE '%abc%' OR
  email ILIKE '%abc%'
) AND estado = 'activo'
```

##### POST /api/clientes
```
Archivos involucrados:
├─ backend/src/routes/clientes.js (línea 32-45)
└─ backend/src/controllers/clienteController.js (línea 75-150)

Request Body:
{
  "tipo": "empresa",
  "nombre": "Empresa ABC",
  "nit": "12345678-9",
  "telefono": "3001234567",
  "email": "contacto@empresa.com",
  "direccion": "Calle 123, Bogotá",
  "ciudad": "Bogotá",
  "departamento": "Cundinamarca",
  "pagina_web": "www.empresa.com",
  "estado": "prospecto",
  "sector": "Tecnología",
  "prioridad": "media",
  "tamano": "mediano",
  "contactos": [
    {
      "nombre": "Juan Pérez",
      "cargo": "Gerente",
      "telefono": "3007654321",
      "email": "juan@empresa.com",
      "es_principal": true
    }
  ]
}

Flujo:
1. Valida datos obligatorios
2. Crea cliente: Cliente.create({ ... })
3. Si tiene contactos y tipo=empresa:
   └─ Promise.all(contactos.map(Contacto.create))
4. Registra en logs
5. Responde con cliente creado

Validaciones:
├─ nombre: obligatorio
├─ nit: obligatorio
├─ email: obligatorio (formato válido)
├─ telefono: obligatorio
├─ direccion: obligatorio
└─ ciudad: obligatorio
```

##### POST /api/clientes/:id/contactos
```
Archivos involucrados:
├─ backend/src/routes/clientes.js (línea 85-95)
└─ backend/src/controllers/clienteController.js (línea 250-290)

Request Body:
{
  "nombre": "Maria García",
  "cargo": "Asistente",
  "telefono": "3012345678",
  "email": "maria@empresa.com",
  "es_principal": false
}

Flujo:
1. Verifica que el cliente existe
2. Crea contacto: Contacto.create({ ... })
3. Si es principal, desmarcamos otros contactos
4. Responde con contacto creado

Asociación en modelo (index.js):
Cliente.hasMany(Contacto, { foreignKey: 'cliente_id' })
```

##### POST /api/clientes/:id/interacciones
```
Archivos involucrados:
├─ backend/src/routes/clientes.js (línea 120-130)
└─ backend/src/controllers/clienteController.js (línea 330-380)

Request Body:
{
  "tipo": "llamada",
  "descripcion": "Llamada de seguimiento sobre cotización",
  "fecha": "2024-01-15T10:30:00Z",
  "duracion_minutos": 15,
  "resultado": "Interesado en el servicio"
}

Tipos de interacción permitidos:
├─ llamada
├─ whatsapp
├─ email
├─ visita
├─ reunion
└─ nota

Flujo:
1. Verifica que el cliente existe
2. Obtiene usuario del token
3. Crea interacción con usuario_id
4. Registra timestamp
5. Responde con interacción creada

Asociación en modelo:
Cliente.hasMany(Interaccion, { foreignKey: 'cliente_id' })
Interaccion.belongsTo(Usuario, { foreignKey: 'usuario_id' })
```

---

### 👤 API de Usuarios (Admin)

#### Archivo: `backend/src/routes/auth.js` (integrado)

| Método | Endpoint | Función | Controlador |
|--------|----------|---------|-------------|
| GET | `/api/usuarios` | Listar usuarios | `authController.obtenerUsuarios()` |
| POST | `/api/usuarios` | Crear usuario | `authController.crearUsuario()` |
| PUT | `/api/usuarios/:id` | Actualizar usuario | `authController.actualizarUsuario()` |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | `authController.eliminarUsuario()` |
| PUT | `/api/usuarios/:id/estado` | Activar/Desactivar | `authController.cambiarEstado()` |

---

### 🔧 Middleware de Autenticación

#### Archivo: `backend/src/middleware/auth.js`

```javascript
// Función: verificarToken
// Líneas: 10-35

Flujo del Middleware:
1. Extrae header: Authorization: Bearer <token>
2. Verifica formato (debe empezar con 'Bearer ')
3. Extrae token
4. Verifica token: jwt.verify(token, SECRET_KEY)
5. Agrega datos a req.usuario: { id, email, rol }
6. Continúa al siguiente middleware/route

Respuestas de error:
├─ 401: No hay token
├─ 403: Token inválido
expirado
└─ 401: Token no verificado

Uso en rutas:
router.post('/cotizaciones', verificarToken, cotizacionController.crear)
```

---

### 📊 Manejo de Errores

```javascript
// Formato de respuesta de error:
{
  "message": "Descripción del error",
  "error": "Tipo de error",
  "details": "Detalles adicionales (opcional)
}

// Códigos HTTP:
├─ 200: Éxito
├─ 201: Creado
├─ 400: Bad Request (validación)
├─ 401: No autorizado
├─ 403: Prohibido
├─ 404: No encontrado
└─ 500: Error interno
```

---

### 🔄 Ciclo de Vida de una Petición

```
┌─────────────────────────────────────────────────────────────────┐
│                    PETICIÓN HTTP                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. CORS (config en server.js)                                 │
│     └─► Verifica origen permitido                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. express.json()                                              │
│     └─► Parsebody a JSON                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. loggerMiddleware (loggerMiddleware.js)                      │
│     └─► Registra: método, URL, IP, user-agent                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Routes (routes/*.js)                                       │
│     └─► Dirige a controlador específico                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Auth Middleware (auth.js) - si la ruta lo requiere         │
│     └─► Verifica JWT token                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Controller (controllers/*.js)                               │
│     └─► Procesa lógica de negocio                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Models (models/*.js)                                        │
│     └─► Sequelize ORM interactúa con PostgreSQL                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. Services (services/*.js) - opcional                         │
│     └─► PDF, Email, Logs                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. Response                                                    │
│     └─► JSON o archivo (PDF)                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Generación de PDF

### Proceso Técnico

```
1. Backend recibe solicitud
   └─► GET /api/cotizaciones/:id/pdf

2. Obtiene datos completos
   └─► Cotizacion.findByPk(id, { include: ['items'] })

3. Crea documento con PDFKit
   pdfDocument = new PDFDocument({ size: 'A4', margin: 50 })

4. Genera contenido página por página
   │
   ├─► ENCABEZADO
   │    ├─► Logo de JGS (imagen)
   │    ├─► "COTIZACIÓN" (grande)
   │    └─► Número COT-2024-0001
   │
   ├─► DATOS DEL EMISOR
   │    └─► JGS Soluciones Tecnológicas
   │        └─► NIT, dirección, contacto, web
   │
   ├─► DATOS DEL CLIENTE
   │    └─► Cliente seleccionado
   │        └─► Nombre, NIT, dirección, contacto
   │
   ├─► TABLA DE ITEMS
   │    ├─► Encabezados: Descripción, Cantidad, Precio, Total
   │    ├─► Filas con datos de items
   │    └─► Subtotal, Impuestos, Total
   │
   ├─► NOTAS Y CONDICIONES
   │    └─► Texto configurable
   │
   └─► PIE DE PÁGINA
        └─► "Cotización válida por X días"

5. Convierte a buffer
   └─► pdfDocument.render()

6. Envía respuesta
   └─► res.setHeader('Content-Type', 'application/pdf')
       res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
       res.send(buffer)
```

### Estilo del PDF

```javascript
// Fuente
font: 'Helvetica'

// Tamaños
title: 24
headers: 12
body: 10
small: 8

// Colores
primary: '#059669' (verde esmeralda)
text: '#1f2937' (gris oscuro)
light: '#6b7280' (gris claro)
```

---

## 📧 Envío de Emails

### Configuración del Servidor de Email

```javascript
// services/emailService.js
transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})
```

### Plantilla de Email para Cotización

```
De: JGS Soluciones Tecnológicas <jgs.tecnologias@gmail.com>
Para: cliente@email.com
Asunto: Cotización COT-2024-0001 - JGS Soluciones Tecnológicas

Cuerpo del email:

Estimado/a [NOMBRE_CLIENTE],

Adjunto encontrará la cotización #[NÚMERO] generada por JGS Soluciones Tecnológicas.

Detalles de la cotización:
- Fecha: [FECHA]
- Valor total: [TOTAL]
- Validez: [VALIDEZ] días

Por favor, no dude en contactarnos si tiene alguna pregunta.

Atentamente,
JGS Soluciones Tecnológicas
```

---

## 📝 Sistema de Logging

### Archivos de Log

```
backend/logs/
├─ app-YYYY-MM-DD.log    // Logs generales
├─ error-YYYY-MM-DD.log  // Solo errores
└─ requests-YYYY-MM-DD.log // Peticiones HTTP
```

### Formato de Entrada de Log

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "Cotización creada exitosamente",
  "method": "POST",
  "url": "/api/cotizaciones",
  "userId": 1,
  "cotizacionId": 45,
  "duration": "45ms"
}
```

### Niveles de Log

```
DEBUG  - Información detallada para depuración
INFO   - Eventos normales de la aplicación
WARN   - Situaciones inesperadas pero no críticas
ERROR  - Errores que requieren atención
```

---

## 🔄 Flujo de Datos Resumido

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ FRONTEND │────►│   API   │────►│   DB    │────►│  LOGS  │
│  React   │◄────│ExpressJS│◄────│PostgreSQL│◄────│ Archivos│
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │
     │               │               │
     ▼               ▼               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Token  │     │  JWT    │     │  SQL    │
│  Local  │     │Validación│     │Queries  │
└─────────┘     └─────────┘     └─────────┘
```

---

## 📁 Estructura de Archivos

```
sistema-cotizaciones/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Configuración de BD
│   │   ├── controllers/
│   │   │   ├── authController.js   # Login, registro
│   │   │   ├── cotizacionController.js
│   │   │   └── clienteController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # Verificación JWT
│   │   │   └── loggerMiddleware.js # Logging automático
│   │   ├── models/
│   │   │   ├── index.js           # Asociaciones
│   │   │   ├── Usuario.js
│   │   │   ├── Cotizacion.js
│   │   │   ├── Cliente.js
│   │   │   ├── Contacto.js
│   │   │   ├── Interaccion.js
│   │   │   └── Documento.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── cotizaciones.js
│   │   │   └── clientes.js
│   │   ├── services/
│   │   │   ├── pdfService.js      # Generación PDF
│   │   │   ├── emailService.js     # Envío emails
│   │   │   └── loggerService.js   # Sistema de logs
│   │   ├── scripts/
│   │   │   ├── initDatabase.js
│   │   │   └── initSuperUser.js
│   │   └── server.js              # Punto de entrada
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── CotizacionForm.tsx
│   │   │   ├── CotizacionList.tsx
│   │   │   ├── CotizacionView.tsx
│   │   │   ├── ClienteList.tsx
│   │   │   ├── ClienteForm.tsx
│   │   │   ├── ClienteSearch.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── services/
│   │   │   ├── api.ts             # Axios configurado
│   │   │   └── clientesApi.ts
│   │   ├── types/
│   │   │   └── index.ts           # Interfaces TypeScript
│   │   ├── utils/
│   │   │   └── helpers.ts         # Funciones utilitarias
│   │   ├── App.tsx               # Componente principal
│   │   └── main.tsx
│   └── package.json
│
└── README.md
└── USO.md
└── INSTALACION.md
```

---

## ⚡ Puntos Clave de Rendimiento

1. **Carga de datos**: Se cargan máximo 100 registros por página
2. **Búsqueda**: El backend filtra con `LIKE` en PostgreSQL
3. **Autenticación**: Token JWT con expiración de 24 horas
4. **Base de datos**: Índices en campos frecuentemente consultados
5. **PDF**: Se genera bajo demanda, no se almacena

---

## 🔒 Seguridad

1. **Contraseñas**: Hasheadas con bcrypt (10 rounds)
2. **JWT**: Tokens firmados con SECRET_KEY
3. **Validación**: Express-validator en rutas críticas
4. **CORS**: Configurado para permitir solo el frontend
5. **SQL Injection**: Previsto por Sequelize (ORM)

---

*Documento generado para el Sistema de Cotizaciones de JGS Soluciones Tecnológicas*
*Última actualización: Febrero 2026*
