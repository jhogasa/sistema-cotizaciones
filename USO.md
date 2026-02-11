# 🎯 GUÍA DE USO RÁPIDO
## Sistema de Cotizaciones

---

## 🚀 INICIO RÁPIDO

### Opción 1: Scripts automatizados

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```
start.bat
```

### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Luego abrir: http://localhost:5173

---

## 📝 CREAR TU PRIMERA COTIZACIÓN

### 1. Click en "Nueva Cotización"

### 2. Datos del Cliente (ejemplo)

```


### 3. Información de la Cotización

```
Fecha: (Automática - hoy)
Validez: 5 días
Forma de Pago: Transferencia
```

### 4. Agregar Items (ejemplos)

**Item 1:**
```
Descripción: Kit De Videoportero 7", 1024 × 600 Ip 2mp, Incluye Dhi-vto + vth + Sw poe 4 canales
Cantidad: 2
Precio Unitario: 970000
Descuento: 0%
```

**Item 2:**
```
Descripción: Control De Acceso Uso Exterior Con Lector De Huella Dalhua Asi1202m
Cantidad: 1
Precio Unitario: 577114
Descuento: 0%
```

**Item 3:**
```
Descripción: Enrolador Dahua Dhi-asm101a Lector De Huellas usb
Cantidad: 1
Precio Unitario: 300385
Descuento: 0%
```

**Item 4:**
```
Descripción: Electroiman Puerta 350 L + Control Remoto + Fuente 12v
Cantidad: 1
Precio Unitario: 285600
Descuento: 0%
```

**Item 5:**
```
Descripción: Servicio técnico: instalación, configuración y puesta en marcha
Cantidad: 1
Precio Unitario: 850000
Descuento: 0%
```

### 5. Notas (ya vienen por defecto, puedes editarlas)

```
• Los equipos incluidos en la presente cotización corresponden a los descritos en el detalle de ítems.
• La mano de obra incluye instalación, configuración, pruebas de funcionamiento, enrolamiento inicial y capacitación básica al personal designado por el cliente.
• Se realizará entrega del sistema funcionando y validado en sitio.
• La configuración se realizará con los parámetros acordados con el cliente.
```

### 6. Condiciones (ya vienen por defecto, puedes editarlas)

```
• Los valores incluyen únicamente los equipos descritos y la mano de obra relacionada con la instalación y configuración.
• No incluye obras civiles, resanes, pintura, perforaciones especiales, canaletas, tubería, cableado adicional no contemplado, ni adecuaciones eléctricas externas.
• Si durante la instalación se requiere material adicional (cable UTP, cable eléctrico, canaleta, conectores, tubería o accesorios), estos serán cotizados y autorizados por el cliente antes de su instalación.
• La garantía de equipos aplica según política del fabricante.
• La garantía de mano de obra es de 30 días por instalación (no cubre manipulación por terceros, daños eléctricos, humedad o mal uso).
• Forma de pago: Se requiere anticipo del 100% del valor de los equipos y materiales para iniciar el servicio.
• Para iniciar el servicio se requiere aprobación de la cotización y disponibilidad del área de trabajo.
```

### 7. Click en "Guardar"

**Resultado:** 
- El número de cotización se asigna automáticamente (00001, 00002, etc.)
- La cotización aparece en la lista principal
- Total calculado automáticamente: $3.953.099 COP

---

## 🔍 FUNCIONALIDADES PRINCIPALES

### Ver Cotización
1. En la lista, click en el ícono 👁️ (ojo)
2. Se muestra la vista previa completa
3. Opción de descargar PDF desde ahí

### Editar Cotización
1. En la lista, click en el ícono ✏️ (lápiz)
2. Modificar los datos necesarios
3. Click en "Guardar"
4. Los cambios se reflejan inmediatamente

### Eliminar Cotización
1. En la lista, click en el ícono 🗑️ (papelera)
2. Confirmar la eliminación
3. La cotización se elimina permanentemente

### Descargar PDF
1. En la lista, click en el ícono 📥 (descarga)
2. El PDF se descarga automáticamente
3. Formato: `cotizacion_00001_NOMBRE_CLIENTE.pdf`

### Enviar por Email
1. En la lista, busca una cotización en estado **Borrador**
2. Click en el ícono ✉️ (email)
3. Confirma el envío
4. El email se envía automáticamente al cliente con:
   - PDF adjunto de la cotización
   - Plantilla HTML profesional
5. El estado cambia automáticamente a **Enviada**

**Requisitos previos:**
- Configurar credenciales de email en `.env`:
  ```
  EMAIL_USER=jgs.tecnologias@gmail.com
  EMAIL_PASSWORD=tu-password-de-app
  ```
- Para Gmail, usar [App Password](https://myaccount.google.com/apppasswords)

### Buscar Cotizaciones
1. Usar la barra de búsqueda superior
2. Buscar por:
   - Número de cotización
   - Nombre del cliente
   - NIT del cliente
3. Los resultados se filtran en tiempo real

---

## 💡 CONSEJOS Y TIPS

### Consecutivo Automático
- El número de cotización se genera automáticamente
- Formato: 00001, 00002, 00003, etc.
- No puedes editarlo, es único y secuencial

### Cálculos Automáticos
- El total de cada item se calcula automáticamente
- El subtotal y total general se actualizan en tiempo real
- Al editar cantidad, precio o descuento, el total se recalcula

### Descuentos
- Se aplican en porcentaje (0-100%)
- El descuento reduce el precio unitario
- Total = Cantidad × Precio Unitario × (1 - Descuento/100)

### Datos de la Empresa
- Los datos del emisor (tu empresa) vienen prellenados
- Puedes modificarlos en el formulario si es necesario
- Para cambiar los valores por defecto, editar:
  `frontend/src/components/CotizacionForm.tsx` (líneas 19-25)

### Formato del PDF
- Diseño profesional idéntico al ejemplo proporcionado
- Todos los datos incluidos
- Optimizado para impresión
- Descarga directa al hacer click

---

## 🎨 PERSONALIZACIÓN

### Cambiar Logo/Colores de la Empresa

**Backend (PDF):**
Editar: `backend/src/services/pdfService.js`
- Línea 10-12: Colores del PDF

**Frontend (Interfaz):**
Editar: `frontend/tailwind.config.js`
- Sección `colors.primary`: Cambiar colores principales

### Modificar Notas/Condiciones por Defecto

Editar: `frontend/src/components/CotizacionForm.tsx`
- Líneas 48-60: Cambiar texto por defecto

### Agregar Campos Personalizados

1. Modificar modelo: `backend/src/models/Cotizacion.js`
2. Agregar campo al formulario: `frontend/src/components/CotizacionForm.tsx`
3. Actualizar PDF: `backend/src/services/pdfService.js`

---

## 📊 FLUJO DE TRABAJO RECOMENDADO

1. **Recibir solicitud de cotización del cliente**
2. **Crear nueva cotización** en el sistema
3. **Completar datos del cliente** y detalles
4. **Agregar items** de productos/servicios
5. **Revisar totales** calculados automáticamente
6. **Guardar cotización** (recibe número automático)
7. **Enviar por email** directamente desde el sistema (opción ✉️)
   - El PDF se genera y envía automáticamente
   - El estado cambia a "Enviada"
8. **Actualizar estado** manualmente si es necesario (borrador → enviada → aceptada)
9. **Consultar histórico** cuando se requiera

---

## 🔐 RESPALDO Y MANTENIMIENTO

### Respaldar Base de Datos

```bash
# Crear respaldo
pg_dump -U cotizaciones_user -d cotizaciones_db > backup_$(date +%Y%m%d).sql

# Restaurar respaldo
psql -U cotizaciones_user -d cotizaciones_db < backup_20260210.sql
```

### Limpiar Cotizaciones Antiguas

Directamente en PostgreSQL:
```sql
-- Ver cotizaciones de más de 1 año
SELECT * FROM cotizaciones WHERE created_at < NOW() - INTERVAL '1 year';

-- Eliminar (CUIDADO)
DELETE FROM cotizaciones WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## 📞 SOPORTE

Para problemas técnicos:
1. Revisar logs del backend (consola donde corre)
2. Revisar logs del frontend (consola del navegador F12)
3. Consultar la guía de instalación (INSTALACION.md)
4. Verificar que PostgreSQL esté corriendo

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de crear una cotización, verificar:

- [ ] Número de cotización asignado correctamente
- [ ] Datos del cliente guardados
- [ ] Items listados con totales correctos
- [ ] Subtotal y total calculados bien
- [ ] Cotización visible en la lista
- [ ] PDF se descarga correctamente
- [ ] PDF contiene toda la información
- [ ] Formato del PDF es profesional
- [ ] Se puede editar la cotización
- [ ] Se puede eliminar la cotización

**Para envío por email:**
- [ ] Credenciales de email configuradas en `.env`
- [ ] El botón de email aparece para cotizaciones en borrador
- [ ] El email se envía correctamente
- [ ] El estado cambia a "Enviada" después del envío
- [ ] El cliente recibe el PDF adjunto

---

¡Listo! Ya puedes gestionar tus cotizaciones de manera profesional. 🎉