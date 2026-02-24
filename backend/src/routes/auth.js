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

// Endpoint temporal para crear admin (solo funciona si no existe)
router.post('/init-admin', async (req, res) => {
  try {
    const { Usuario } = await import('../models/index.js');
    const bcrypt = await import('bcryptjs');
    
    const adminExists = await Usuario.findOne({ where: { rol: 'admin' } });
    
    if (adminExists) {
      return res.status(400).json({ error: 'El admin ya existe' });
    }
    
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    const admin = await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@jgs.com',
      password: hashedPassword,
      rol: 'admin',
      activo: true
    });
    
    res.json({ message: 'Admin creado', email: admin.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes (require authentication)
router.get('/me', authMiddleware, getProfile);
router.put('/cambiar-password', authMiddleware, cambiarPassword);

// Admin routes (require authentication + admin role)
router.get('/usuarios', authMiddleware, adminMiddleware, getUsuarios);
router.post('/usuarios', authMiddleware, adminMiddleware, crearUsuario);
router.put('/usuarios/:id', authMiddleware, adminMiddleware, actualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, adminMiddleware, eliminarUsuario);

export default router;
