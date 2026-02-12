import express from 'express';
import { 
  getClientes, 
  getClientePorId, 
  crearCliente, 
  actualizarCliente, 
  eliminarCliente,
  agregarContacto,
  eliminarContacto,
  getInteracciones,
  registrarInteraccion,
  eliminarInteraccion,
  exportarClientes
} from '../controllers/clienteController.js';

const router = express.Router();

// Rutas principales de clientes
router.get('/', getClientes);
router.get('/exportar', exportarClientes);
router.get('/:id', getClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarContacto);

// Rutas de contactos
router.post('/:id/contactos', agregarContacto);
router.delete('/:id/contactos/:contactoId', eliminarContacto);

// Rutas de interacciones
router.get('/:id/interacciones', getInteracciones);
router.post('/:id/interacciones', registrarInteraccion);
router.delete('/:id/interacciones/:interaccionId', eliminarInteraccion);

export default router;
