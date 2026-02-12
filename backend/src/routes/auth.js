import { Router } from 'express';
import {
  login,
  getProfile,
  cambiarPassword,
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, getProfile);
router.put('/cambiar-password', authMiddleware, cambiarPassword);

// Admin routes (require authentication + admin role)
router.get('/usuarios', authMiddleware, adminMiddleware, getUsuarios);
router.post('/usuarios', authMiddleware, adminMiddleware, crearUsuario);
router.put('/usuarios/:id', authMiddleware, adminMiddleware, actualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, adminMiddleware, eliminarUsuario);

export default router;
