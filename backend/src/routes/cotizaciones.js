import express from 'express';
import {
  crearCotizacion,
  obtenerCotizaciones,
  obtenerCotizacionPorId,
  actualizarCotizacion,
  eliminarCotizacion,
  obtenerSiguienteNumero,
  enviarCotizacion
} from '../controllers/cotizacionController.js';
import { Cotizacion, Item } from '../models/index.js';
import { generarPDFCotizacion } from '../services/pdfService.js';

const router = express.Router();

// CRUD básico
router.post('/', crearCotizacion);
router.get('/', obtenerCotizaciones);
router.get('/siguiente-numero', obtenerSiguienteNumero);
router.post('/:id/enviar', enviarCotizacion);
router.get('/:id', obtenerCotizacionPorId);
router.put('/:id', actualizarCotizacion);
router.delete('/:id', eliminarCotizacion);

// Generar PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await Cotizacion.findByPk(id, {
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }]
    });

    if (!cotizacion) {
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cotizacion_${cotizacion.numero_cotizacion}_${cotizacion.cliente_nombre.replace(/\s+/g, '_')}.pdf`
    );

    // Generar PDF
    await generarPDFCotizacion(cotizacion.toJSON(), res);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error al generar el PDF',
        details: error.message
      });
    }
  }
});

export default router;