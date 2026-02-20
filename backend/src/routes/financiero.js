import express from 'express';
import {
  getDashboard,
  getMovimientos,
  crearMovimiento,
  getReporteIngresosEgresos,
  registrarPago,
  getPagosPorCotizacion,
  cambiarEstadoCotizacion
} from '../controllers/financieroController.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', getDashboard);

// Movimientos
router.get('/movimientos', getMovimientos);
router.post('/movimientos', crearMovimiento);

// Pagos de cotizaciones
router.post('/pagos', registrarPago);
router.get('/pagos/:cotizacionId', getPagosPorCotizacion);

// Estado de cotizaciones
router.put('/cotizaciones/:id/estado', cambiarEstadoCotizacion);

// Reportes
router.get('/reportes/ingresos-egresos', getReporteIngresosEgresos);

export default router;
