import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

// Middleware to verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso no autorizado',
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Acceso no autorizado',
        message: 'Usuario no encontrado'
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        error: 'Acceso no autorizado',
        message: 'Usuario desactivado'
      });
    }

    // Attach user to request
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sesión expirada',
        message: 'Su sesión ha expirado, por favor inicie sesión nuevamente'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autenticación inválido'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno',
      message: 'Error al verificar autenticación'
    });
  }
};

// Middleware to check admin role
export const adminMiddleware = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador'
    });
  }
};

export default authMiddleware;
