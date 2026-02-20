import { Proveedor, CuentaPorPagar, PagoProveedor } from '../models/index.js';
import { Op } from 'sequelize';
import { logger } from '../services/loggerService.js';

// GET /api/proveedores - Listar proveedores
export const getProveedores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tipo, estado, categoria } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { nit_cedula: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (categoria) where.categoria = categoria;

    const { count, rows } = await Proveedor.findAndCountAll({
      where,
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    logger.info('Listado de proveedores', `Total: ${count} | Por: ${req.usuario.email}`);

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error('Error al obtener proveedores', error);
    res.status(500).json({
      error: 'Error al obtener los proveedores',
      details: error.message
    });
  }
};

// GET /api/proveedores/:id - Obtener proveedor por ID
export const getProveedorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await Proveedor.findByPk(id, {
      include: [
        {
          model: CuentaPorPagar,
          as: 'cuentas_por_pagar',
          order: [['fecha_factura', 'DESC']],
          limit: 20
        },
        {
          model: PagoProveedor,
          as: 'pagos',
          order: [['fecha_pago', 'DESC']],
          limit: 20
        }
      ]
    });

    if (!proveedor) {
      logger.warn('Proveedor no encontrado', `ID: ${id}`);
      return res.status(404).json({
        error: 'Proveedor no encontrado'
      });
    }

    logger.info('Consulta proveedor', `${proveedor.nombre} | Por: ${req.usuario.email}`);

    res.json({ data: proveedor });

  } catch (error) {
    logger.error('Error al obtener proveedor', error);
    res.status(500).json({
      error: 'Error al obtener el proveedor',
      details: error.message
    });
  }
};

// POST /api/proveedores - Crear proveedor
export const crearProveedor = async (req, res) => {
  try {
    const datosProveedor = req.body;

    // Verificar NIT/Cédula único
    const existente = await Proveedor.findOne({ where: { nit_cedula: datosProveedor.nit_cedula } });
    if (existente) {
      logger.warn('Creación fallida - NIT/Cédula duplicado', `${datosProveedor.nit_cedula}`);
      return res.status(400).json({
        error: 'NIT/Cédula duplicado',
        message: 'Ya existe un proveedor con este NIT/Cédula'
      });
    }

    const proveedor = await Proveedor.create({
      ...datosProveedor,
      usuario_id: req.usuario.id
    });

    logger.success('Proveedor creado', `${proveedor.nombre} | NIT: ${proveedor.nit_cedula} | Por: ${req.usuario.email}`);

    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      data: proveedor
    });

  } catch (error) {
    logger.error('Error al crear proveedor', error);
    res.status(500).json({
      error: 'Error al crear el proveedor',
      details: error.message
    });
  }
};

// PUT /api/proveedores/:id - Actualizar proveedor
export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const datosProveedor = req.body;

    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      logger.warn('Actualización fallida - no encontrado', `ID: ${id}`);
      return res.status(404).json({
        error: 'Proveedor no encontrado'
      });
    }

    // Verificar NIT/Cédula único (si cambió)
    if (datosProveedor.nit_cedula && datosProveedor.nit_cedula !== proveedor.nit_cedula) {
      const existente = await Proveedor.findOne({ where: { nit_cedula: datosProveedor.nit_cedula } });
      if (existente) {
        logger.warn('Actualización fallida - NIT/Cédula duplicado', `${datosProveedor.nit_cedula}`);
        return res.status(400).json({
          error: 'NIT/Cédula duplicado',
          message: 'Ya existe un proveedor con este NIT/Cédula'
        });
      }
    }

    await proveedor.update(datosProveedor);

    logger.success('Proveedor actualizado', `${proveedor.nombre} | Por: ${req.usuario.email}`);

    res.json({
      message: 'Proveedor actualizado exitosamente',
      data: proveedor
    });

  } catch (error) {
    logger.error('Error al actualizar proveedor', error);
    res.status(500).json({
      error: 'Error al actualizar el proveedor',
      details: error.message
    });
  }
};

// DELETE /api/proveedores/:id - Eliminar proveedor
export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      logger.warn('Eliminación fallida - no encontrado', `ID: ${id}`);
      return res.status(404).json({
        error: 'Proveedor no encontrado'
      });
    }

    const nombreEliminado = proveedor.nombre;
    await proveedor.destroy();

    logger.success('Proveedor eliminado', `${nombreEliminado} | Por: ${req.usuario.email}`);

    res.json({
      message: 'Proveedor eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar proveedor', error);
    res.status(500).json({
      error: 'Error al eliminar el proveedor',
      details: error.message
    });
  }
};
