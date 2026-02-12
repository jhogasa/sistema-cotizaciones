import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { logger } from '../services/loggerService.js';

// Generate JWT token
const generateToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.auth('INTENTO LOGIN', email, false);

    if (!email || !password) {
      logger.warn('Login fallido - datos incompletos', email);
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Find user by email
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      logger.auth('LOGIN FALLIDO', email, false, 'Usuario no encontrado');
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    if (!usuario.activo) {
      logger.auth('LOGIN FALLIDO', email, false, 'Usuario desactivado');
      return res.status(401).json({
        error: 'Usuario desactivado',
        message: 'Su cuenta ha sido desactivada. Contacte al administrador.'
      });
    }

    // Verify password
    const passwordValido = await usuario.verificarPassword(password);

    if (!passwordValido) {
      logger.auth('LOGIN FALLIDO', email, false, 'Contraseña incorrecta');
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Update last login
    await usuario.update({ ultimo_login: new Date() });

    // Generate token
    const token = generateToken(usuario);

    logger.auth('LOGIN EXITOSO', email, true, `Rol: ${usuario.rol}`);

    res.json({
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: usuario.toJSON()
      }
    });
  } catch (error) {
    logger.error('Error en login', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al iniciar sesión'
    });
  }
};

// GET /api/auth/me
export const getProfile = async (req, res) => {
  try {
    res.json({
      data: req.usuario.toJSON()
    });
  } catch (error) {
    logger.error('Error al obtener perfil', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al obtener perfil'
    });
  }
};

// PUT /api/auth/cambiar-password
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;
    const email = req.usuario.email;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    if (passwordNuevo.length < 6) {
      return res.status(400).json({
        error: 'Validación',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    const passwordValido = await usuario.verificarPassword(passwordActual);

    if (!passwordValido) {
      logger.warn('Cambio de contraseña fallido', `${email} - contraseña actual incorrecta`);
      return res.status(400).json({
        error: 'Contraseña incorrecta',
        message: 'La contraseña actual es incorrecta'
      });
    }

    await usuario.update({ password: passwordNuevo });

    logger.success('Contraseña actualizada', email);
    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error al cambiar contraseña', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al cambiar contraseña'
    });
  }
};

// ============ ADMIN: User Management ============

// GET /api/auth/usuarios
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    logger.user('LISTADO USUARIOS', req.usuario.email, `Total: ${usuarios.length}`);

    res.json({ data: usuarios });
  } catch (error) {
    logger.error('Error al obtener usuarios', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al obtener usuarios'
    });
  }
};

// POST /api/auth/usuarios
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Check if email already exists
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      logger.warn('Creación de usuario fallida', `Email ${email} ya existe`);
      return res.status(400).json({
        error: 'Email duplicado',
        message: 'Ya existe un usuario con este email'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol: rol || 'usuario'
    });

    logger.success('Usuario creado', `${email} | Rol: ${rol || 'usuario'} | Por: ${req.usuario.email}`);
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: usuario.toJSON()
    });
  } catch (error) {
    logger.error('Error al crear usuario', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validación',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al crear usuario'
    });
  }
};

// PUT /api/auth/usuarios/:id
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      logger.warn('Actualización de usuario fallida', `ID ${id} no encontrado`);
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado'
      });
    }

    // Prevent deactivating yourself
    if (req.usuario.id === usuario.id && activo === false) {
      return res.status(400).json({
        error: 'Operación no permitida',
        message: 'No puede desactivar su propia cuenta'
      });
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (rol !== undefined) updateData.rol = rol;
    if (activo !== undefined) updateData.activo = activo;
    if (password) updateData.password = password;

    await usuario.update(updateData);

    logger.success('Usuario actualizado', `${email} | Por: ${req.usuario.email}`);
    res.json({
      message: 'Usuario actualizado exitosamente',
      data: usuario.toJSON()
    });
  } catch (error) {
    logger.error('Error al actualizar usuario', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email duplicado',
        message: 'Ya existe un usuario con este email'
      });
    }
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al actualizar usuario'
    });
  }
};

// DELETE /api/auth/usuarios/:id
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.usuario.id) {
      logger.warn('Eliminación de usuario fallida', 'No puede eliminarse a sí mismo');
      return res.status(400).json({
        error: 'Operación no permitida',
        message: 'No puede eliminar su propia cuenta'
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      logger.warn('Eliminación de usuario fallida', `ID ${id} no encontrado`);
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado'
      });
    }

    const emailEliminado = usuario.email;
    await usuario.destroy();

    logger.success('Usuario eliminado', `${emailEliminado} | Por: ${req.usuario.email}`);
    res.json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar usuario', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al eliminar usuario'
    });
  }
};
