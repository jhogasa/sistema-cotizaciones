import { Cliente, Contacto, Interaccion, Documento, Cotizacion } from '../models/index.js';
import { Op } from 'sequelize';
import { logger } from '../services/loggerService.js';

// ============ CLIENTES ============

// GET /api/clientes - Listar clientes
export const getClientes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      estado, 
      sector, 
      prioridad,
      tipo 
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { nit: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { telefono: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (estado) where.estado = estado;
    if (sector) where.sector = sector;
    if (prioridad) where.prioridad = prioridad;
    if (tipo) where.tipo = tipo;

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      include: [{
        model: Contacto,
        as: 'contactos',
        attributes: ['id', 'nombre', 'cargo', 'telefono', 'email', 'es_principal']
      }],
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    logger.crm('LISTADO CLIENTES', count, '', req.usuario.email);

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
    logger.error('Error al obtener clientes', error);
    res.status(500).json({
      error: 'Error al obtener los clientes',
      details: error.message
    });
  }
};

// GET /api/clientes/:id - Obtener cliente por ID
export const getClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          model: Contacto,
          as: 'contactos',
          where: { activo: true },
          required: false
        },
        {
          model: Interaccion,
          as: 'interacciones',
          include: [{
            model: require('../models').Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          }],
          order: [['fecha', 'DESC']],
          limit: 50
        },
        {
          model: Cotizacion,
          as: 'cotizaciones',
          attributes: ['id', 'numero_cotizacion', 'fecha', 'total', 'estado'],
          order: [['fecha', 'DESC']],
          limit: 20
        }
      ]
    });

    if (!cliente) {
      logger.warn('Cliente no encontrado', `ID: ${id}`);
      return res.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    logger.crm('CONSULTA CLIENTE', cliente.nombre, cliente.nit, req.usuario.email);

    res.json({ data: cliente });

  } catch (error) {
    logger.error('Error al obtener cliente', error);
    res.status(500).json({
      error: 'Error al obtener el cliente',
      details: error.message
    });
  }
};

// POST /api/clientes - Crear cliente
export const crearCliente = async (req, res) => {
  try {
    const { contactos, ...datosCliente } = req.body;

    // Verificar NIT único
    const existente = await Cliente.findOne({ where: { nit: datosCliente.nit } });
    if (existente) {
      logger.warn('Creación fallida - NIT duplicado', `${datosCliente.nit}`);
      return res.status(400).json({
        error: 'NIT duplicado',
        message: 'Ya existe un cliente con este NIT'
      });
    }

    // Crear cliente
    const cliente = await Cliente.create({
      ...datosCliente,
      sincronizado: false
    });

    // Crear contactos si existen
    if (contactos && Array.isArray(contactos) && contactos.length > 0) {
      const contactosConCliente = contactos.map((c, index) => ({
        ...c,
        cliente_id: cliente.id,
        es_principal: index === 0 // El primero es principal
      }));
      await Contacto.bulkCreate(contactosConCliente);
    }

    // Obtener cliente con contactos
    const clienteCompleto = await Cliente.findByPk(cliente.id, {
      include: [{ model: Contacto, as: 'contactos' }]
    });

    logger.success('CLIENTE CREADO', `${cliente.nombre} | NIT: ${cliente.nit} | Por: ${req.usuario.email}`);

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      data: clienteCompleto
    });

  } catch (error) {
    logger.error('Error al crear cliente', error);
    res.status(500).json({
      error: 'Error al crear el cliente',
      details: error.message
    });
  }
};

// PUT /api/clientes/:id - Actualizar cliente
export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactos, ...datosCliente } = req.body;

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      logger.warn('Actualización fallida - no encontrado', `ID: ${id}`);
      return res.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    // Verificar NIT único (si cambió)
    if (datosCliente.nit && datosCliente.nit !== cliente.nit) {
      const existente = await Cliente.findOne({ where: { nit: datosCliente.nit } });
      if (existente) {
        logger.warn('Actualización fallida - NIT duplicado', `${datosCliente.nit}`);
        return res.status(400).json({
          error: 'NIT duplicado',
          message: 'Ya existe un cliente con este NIT'
        });
      }
    }

    await cliente.update(datosCliente);

    // Actualizar contactos si vienen
    if (contactos && Array.isArray(contactos)) {
      // Eliminar contactos existentes
      await Contacto.destroy({ where: { cliente_id: id } });
      // Crear nuevos
      if (contactos.length > 0) {
        const contactosConCliente = contactos.map((c, index) => ({
          ...c,
          cliente_id: id,
          es_principal: index === 0
        }));
        await Contacto.bulkCreate(contactosConCliente);
      }
    }

    const clienteActualizado = await Cliente.findByPk(id, {
      include: [{ model: Contacto, as: 'contactos' }]
    });

    logger.success('CLIENTE ACTUALIZADO', `${cliente.nombre} | Por: ${req.usuario.email}`);

    res.json({
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado
    });

  } catch (error) {
    logger.error('Error al actualizar cliente', error);
    res.status(500).json({
      error: 'Error al actualizar el cliente',
      details: error.message
    });
  }
};

// DELETE /api/clientes/:id - Eliminar cliente
export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      logger.warn('Eliminación fallida - no encontrado', `ID: ${id}`);
      return res.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    const nombreEliminado = cliente.nombre;
    await cliente.destroy();

    logger.success('CLIENTE ELIMINADO', `${nombreEliminado} | Por: ${req.usuario.email}`);

    res.json({
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar cliente', error);
    res.status(500).json({
      error: 'Error al eliminar el cliente',
      details: error.message
    });
  }
};

// ============ CONTACTOS ============

// POST /api/clientes/:id/contactos - Agregar contacto
export const agregarContacto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, telefono, email, es_principal } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si es principal, quitar principal a otros
    if (es_principal) {
      await Contacto.update({ es_principal: false }, { where: { cliente_id: id } });
    }

    const contacto = await Contacto.create({
      cliente_id: id,
      nombre,
      cargo: cargo || '',
      telefono: telefono || '',
      email: email || '',
      es_principal: es_principal || false
    });

    logger.crm('CONTACTO AGREGADO', cliente.nombre, contacto.nombre, req.usuario.email);

    res.status(201).json({
      message: 'Contacto agregado exitosamente',
      data: contacto
    });

  } catch (error) {
    logger.error('Error al agregar contacto', error);
    res.status(500).json({
      error: 'Error al agregar contacto',
      details: error.message
    });
  }
};

// DELETE /api/clientes/:id/contactos/:contactoId - Eliminar contacto
export const eliminarContacto = async (req, res) => {
  try {
    const { id, contactoId } = req.params;

    const contacto = await Contacto.findOne({
      where: { id: contactoId, cliente_id: id }
    });

    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    await contacto.destroy();

    logger.crm('CONTACTO ELIMINADO', id, contacto.nombre, req.usuario.email);

    res.json({
      message: 'Contacto eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar contacto', error);
    res.status(500).json({
      error: 'Error al eliminar contacto',
      details: error.message
    });
  }
};

// ============ INTERACCIONES ============

// GET /api/clientes/:id/interacciones - Ver interacciones
export const getInteracciones = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, tipo } = req.query;
    const offset = (page - 1) * limit;

    const where = { cliente_id: id };
    if (tipo) where.tipo = tipo;

    const { count, rows } = await Interaccion.findAndCountAll({
      where,
      include: [{
        model: require('../models').Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email']
      }],
      order: [['fecha', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

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
    logger.error('Error al obtener interacciones', error);
    res.status(500).json({
      error: 'Error al obtener interacciones',
      details: error.message
    });
  }
};

// POST /api/clientes/:id/interacciones - Registrar interacción
export const registrarInteraccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, fecha, duracion_minutos, resultado, cotizacion_id } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const interaccion = await Interaccion.create({
      cliente_id: id,
      tipo,
      descripcion,
      fecha: fecha || new Date(),
      duracion_minutos: duracion_minutos || 0,
      resultado: resultado || '',
      cotizacion_id: cotizacion_id || null,
      usuario_id: req.usuario.id
    });

    // Actualizar último contacto del cliente
    await cliente.update({ ultimo_contacto: new Date() });

    const interaccionCompleta = await Interaccion.findByPk(interaccion.id, {
      include: [{
        model: require('../models').Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email']
      }]
    });

    logger.crm('INTERACCIÓN REGISTRADA', cliente.nombre, `${tipo}: ${descripcion.substring(0, 50)}...`, req.usuario.email);

    res.status(201).json({
      message: 'Interacción registrada exitosamente',
      data: interaccionCompleta
    });

  } catch (error) {
    logger.error('Error al registrar interacción', error);
    res.status(500).json({
      error: 'Error al registrar interacción',
      details: error.message
    });
  }
};

// DELETE /api/clientes/:id/interacciones/:interaccionId - Eliminar interacción
export const eliminarInteraccion = async (req, res) => {
  try {
    const { id, interaccionId } = req.params;

    const interaccion = await Interaccion.findOne({
      where: { id: interaccionId, cliente_id: id }
    });

    if (!interaccion) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }

    await interaccion.destroy();

    logger.crm('INTERACCIÓN ELIMINADA', id, interaccion.tipo, req.usuario.email);

    res.json({
      message: 'Interacción eliminada exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar interacción', error);
    res.status(500).json({
      error: 'Error al eliminar interacción',
      details: error.message
    });
  }
};

// ============ EXPORT ============

// GET /api/clientes/exportar - Exportar clientes
export const exportarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [{ model: Contacto, as: 'contactos' }],
      order: [['nombre', 'ASC']]
    });

    logger.crm('EXPORTACIÓN CLIENTES', clientes.length, '', req.usuario.email);

    res.json({ data: clientes });

  } catch (error) {
    logger.error('Error al exportar clientes', error);
    res.status(500).json({
      error: 'Error al exportar clientes',
      details: error.message
    });
  }
};
