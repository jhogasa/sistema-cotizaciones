import express from 'express';
import {
  getProveedores,
  getProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../controllers/proveedorController.js';

const router = express.Router();

// Rutas de proveedores
router.get('/', getProveedores);
router.get('/:id', getProveedorPorId);
router.post('/', crearProveedor);
router.put('/:id', actualizarProveedor);
router.delete('/:id', eliminarProveedor);

export default router;
