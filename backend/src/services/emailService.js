import nodemailer from 'nodemailer';

// Configuración del transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'jgs.tecnologias@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generar contenido HTML del email
const generarEmailHTML = (cotizacion) => {
  const itemsHTML = cotizacion.items?.map(item => `
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;">${item.descripcion || item.nombre}</td>
      <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
      <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">$${parseFloat(item.precio_unitario).toLocaleString('es-CO')}</td>
      <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">$${parseFloat(item.total).toLocaleString('es-CO')}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { 
          background-color: #005341; 
          color: white; 
          padding: 20px 30px; 
          text-align: center;
        }
        .header-title { 
          font-size: 24px; 
          font-weight: bold; 
        }
        .content { padding: 30px; }
        .company-info { 
          background-color: #f8fafc; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 20px;
        }
        .company-info h3 { color: #005341; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { 
          background-color: #005341; 
          color: white; 
          padding: 12px; 
          text-align: left;
        }
        td { padding: 12px; border: 1px solid #ddd; }
        .total { 
          font-size: 20px; 
          font-weight: bold; 
          text-align: right; 
          padding: 15px; 
          background-color: #f8fafc; 
          border-radius: 8px;
          color: #005341;
        }
        .footer { 
          background-color: #005341; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
        }
        .section-title { 
          color: #005341; 
          border-bottom: 2px solid #005341; 
          padding-bottom: 10px; 
          margin-top: 25px;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="header-title">COTIZACIÓN #${cotizacion.numero_cotizacion}</div>
      </div>
      
      <div class="content">
        <p>Estimado/a <strong>${cotizacion.cliente_nombre}</strong>,</p>
        <p>Reciba un cordial saludo de <strong>JGS SOLUCIONES TECNOLOGICAS</strong>.</p>
        <p>Nos permitimos enviarle la cotización solicitada con los siguientes detalles:</p>
        
        <!-- Información de la empresa -->
        <div class="company-info">
          <h3>JGS SOLUCIONES TECNOLOGICAS</h3>
          <p style="margin: 5px 0;"><strong>NIT:</strong> ${cotizacion.emisor_nit}</p>
          <p style="margin: 5px 0;"><strong>Dirección:</strong> ${cotizacion.emisor_direccion}</p>
          <p style="margin: 5px 0;"><strong>Contacto:</strong> ${cotizacion.emisor_contacto}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${cotizacion.emisor_email}</p>
          <p style="margin: 5px 0;"><strong>Tel:</strong> ${cotizacion.emisor_telefono}</p>
          <p style="margin: 5px 0;"><strong>Web:</strong> ${cotizacion.emisor_web}</p>
        </div>
        
        <!-- Datos del cliente -->
        <h3 class="section-title">Datos del Cliente</h3>
        <p><strong>Nombre:</strong> ${cotizacion.cliente_nombre}</p>
        <p><strong>NIT:</strong> ${cotizacion.cliente_nit}</p>
        <p><strong>Dirección:</strong> ${cotizacion.cliente_direccion}</p>
        <p><strong>Email:</strong> ${cotizacion.cliente_email}</p>
        <p><strong>Contacto:</strong> ${cotizacion.cliente_contacto}</p>
        <p><strong>Teléfono:</strong> ${cotizacion.cliente_telefono}</p>
        
        <!-- Detalles de la cotización -->
        <h3 class="section-title">Detalles de la Cotización</h3>
        <p><strong>Fecha:</strong> ${new Date(cotizacion.fecha).toLocaleDateString('es-CO')}</p>
        <p><strong>Validez de la oferta:</strong> ${cotizacion.validez_oferta} días</p>
        <p><strong>Forma de pago:</strong> ${cotizacion.forma_pago}</p>
        <p><strong>Divisa:</strong> ${cotizacion.divisa}</p>
        
        <!-- Tabla de items -->
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio Unitario</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <!-- Total -->
        <p class="total">TOTAL: $${parseFloat(cotizacion.total).toLocaleString('es-CO')} ${cotizacion.divisa}</p>
        
        ${cotizacion.notas ? `
          <h3 class="section-title">Notas</h3>
          <p>${cotizacion.notas}</p>
        ` : ''}
        
        ${cotizacion.condiciones ? `
          <h3 class="section-title">Condiciones</h3>
          <p>${cotizacion.condiciones}</p>
        ` : ''}
        
        <p>Por favor, no dude en contactarnos si tiene alguna pregunta o necesita más información.</p>
        
        <p>Atentamente,<br>
        <strong>JGS SOLUCIONES TECNOLOGICAS</strong></p>
      </div>
      
      <div class="footer">
        <p>Este correo y cualquier archivo adjunto son confidenciales.</p>
        <p>© ${new Date().getFullYear()} JGS SOLUCIONES TECNOLOGICAS - Todos los derechos reservados</p>
      </div>
    </body>
    </html>
  `;
};

// Enviar cotización por email
export const enviarCotizacionEmail = async (cotizacion, pdfBuffer) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"COTIZACION JGS Soluciones Tecnológicas" <${process.env.EMAIL_USER || 'jgs.tecnologias@gmail.com'}>`,
    to: cotizacion.cliente_email,
    subject: `Cotización #${cotizacion.numero_cotizacion} - JGS Soluciones Tecnológicas`,
    html: generarEmailHTML(cotizacion),
    attachments: [
      {
        filename: `cotizacion_${cotizacion.numero_cotizacion}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  
  return {
    success: true,
    messageId: info.messageId,
    recipient: cotizacion.cliente_email
  };
};

export default { enviarCotizacionEmail };
