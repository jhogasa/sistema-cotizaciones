import PDFDocument from 'pdfkit';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores corporativos
const colorPrimario = '#005341';
const colorSecundario = '#112211';
const colorTexto = '#1e293b';

// Función helper para renderizar el contenido del PDF
const renderPDFContent = (doc, cotizacion) => {
  let y = 50;

  // --- LOGO ---
  const logoPath = path.join(__dirname, '../../public/logo-jgs.jpg');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 10, 10, { width: 150 }); 
    } catch (error) {
      console.log('No se pudo cargar el logo:', error.message);
    }
  }

  y = 100; 

  // Columna Izquierda: Enviada por
  doc.fontSize(10).fillColor(colorSecundario).text('Enviada por:', 50, y);
  doc.fontSize(12).fillColor(colorPrimario).font('Helvetica-Bold').text(cotizacion.emisor_nombre || '', 50, doc.y + 2);
  doc.fontSize(9).fillColor(colorTexto).font('Helvetica')
     .text(cotizacion.emisor_nit || '')
     .text(cotizacion.emisor_direccion || '')
     .fillColor(colorPrimario).text(cotizacion.emisor_web || '')
     .fillColor(colorTexto).text(cotizacion.emisor_contacto || '')
     .text(cotizacion.emisor_email || '')
     .text(cotizacion.emisor_telefono || '');

  const finalYEmisor = doc.y;

  // Columna Derecha: Solicitada por
  doc.fontSize(10).fillColor(colorSecundario).text('Solicitada por:', 320, y);
  doc.fontSize(12).fillColor(colorPrimario).font('Helvetica-Bold').text(cotizacion.cliente_nombre || '', 320, doc.y + 2, { width: 230 });
  doc.fontSize(9).fillColor(colorTexto).font('Helvetica')
     .text(cotizacion.cliente_nit || '', 320)
     .text(cotizacion.cliente_direccion || '', 320, doc.y, { width: 230 })
     .text(cotizacion.cliente_email || '', 320)
     .text(cotizacion.cliente_telefono || '', 320);

  const finalYCliente = doc.y;

  // --- LÍNEA DIVISORIA DINÁMICA ---
  y = Math.max(finalYEmisor, finalYCliente) + 20;
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, y).lineTo(562, y).stroke();

  // --- DATOS COTIZACIÓN ---
  y += 20;
  doc.fontSize(10).fillColor(colorSecundario).font('Helvetica-Bold').text('Datos cotización', 50, y);

  y += 20;
  const datosY = y;
  doc.fontSize(9).fillColor(colorTexto).font('Helvetica').text(`Nº cotización: ${cotizacion.numero_cotizacion}`, 50, y);
  doc.text(`Divisa: ${cotizacion.divisa}`, 50, doc.y + 5);
  doc.text(`Fecha: ${moment(cotizacion.fecha).format('YYYY-MM-DD')}`, 50, doc.y + 5);

  doc.text(`Validez oferta: ${cotizacion.validez_oferta} días`, 320, datosY);
  doc.text(`Forma de pago: ${cotizacion.forma_pago}`, 320, doc.y + 5);

  // --- TABLA DE ITEMS ---
  y = doc.y + 30;
  doc.rect(50, y, 512, 25).fill(colorPrimario);
  doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold');
  doc.text('Items', 55, y + 8);
  doc.text('Cant.', 340, y + 8, { width: 40, align: 'center' });
  doc.text('Precio u', 380, y + 8, { width: 60, align: 'right' });
  doc.text('Desc.', 445, y + 8, { width: 40, align: 'center' });
  doc.text('Total', 490, y + 8, { width: 67, align: 'right' });

  y += 30;

  doc.font('Helvetica').fillColor(colorTexto);
  cotizacion.items.forEach((item, index) => {
    const itemHeight = Math.max(25, doc.heightOfString(item.descripcion, { width: 275 }) + 10);

    if (y + itemHeight > 700) { doc.addPage(); y = 50; }

    if (index % 2 === 0) {
      doc.rect(50, y, 512, itemHeight).fill('#f8fafc');
    }

    doc.fillColor(colorTexto).fontSize(8)
       .text(item.descripcion, 55, y + 7, { width: 275 });
    doc.text(item.cantidad.toString(), 340, y + 7, { width: 40, align: 'center' });
    doc.text(`$${parseFloat(item.precio_unitario).toLocaleString('es-CO')}`, 380, y + 7, { width: 60, align: 'right' });
    doc.text(`${item.descuento_porcentaje}%`, 445, y + 7, { width: 40, align: 'center' });
    doc.text(`$${parseFloat(item.total).toLocaleString('es-CO')}`, 490, y + 7, { width: 67, align: 'right' });

    y += itemHeight;
  });

  // --- TOTALES ---
  y += 15;
  doc.fontSize(9).fillColor(colorTexto).font('Helvetica-Bold').text('Totales', 50, y);
  y += 20;
  
  const printTotal = (label, value, isBold = false, isGreen = false) => {
    doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(isGreen ? colorPrimario : colorTexto)
       .text(label, 390, y)
       .text(`$${parseFloat(value).toLocaleString('es-CO')}`, 490, y, { width: 67, align: 'right' });
    y += 15;
  };

  printTotal('Subtotal', cotizacion.subtotal);
  printTotal(`Impuesto ${cotizacion.impuesto_porcentaje}%`, cotizacion.impuesto_valor);
  printTotal('Total', cotizacion.total, true, true);

  // --- NOTAS Y CONDICIONES ---
  const renderSeccion = (titulo, contenido) => {
    if (!contenido) return;
    y += 20;
    if (y + 50 > 750) { doc.addPage(); y = 50; }
    
    doc.fontSize(10).fillColor(colorSecundario).font('Helvetica-Bold').text(titulo, 50, y);
    y += 15;
    doc.fontSize(8).fillColor(colorTexto).font('Helvetica').text(contenido, 50, y, { width: 512, align: 'justify' });
    y = doc.y;
  };

  renderSeccion('Notas', cotizacion.notas);
  renderSeccion('Condiciones', cotizacion.condiciones);
};

// Generar PDF y enviar directamente al stream (respuesta HTTP)
export const generarPDFCotizacion = (cotizacion, res) => {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  doc.pipe(res);
  renderPDFContent(doc, cotizacion);
  doc.end();
};

// Generar PDF como buffer para email
export const generarPDFCotizacionBuffer = async (cotizacion) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      renderPDFContent(doc, cotizacion);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
