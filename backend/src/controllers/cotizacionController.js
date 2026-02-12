import { Cotizacion, Item } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { enviarCotizacionEmail } from '../services/emailService.js';
import { generarPDFCotizacionBuffer } from '../services/pdfService.js';
import { logger } from '../services/loggerService.js';

// Generar número de cotización consecutivo
const generarNumeroCotizacion = async () => {
  const ultimaCotizacion = await Cotizacion.findOne({
    order: [['numero_cotizacion', 'DESC']],
    attributes: ['numero_cotizacion']
  });

  if (!ultimaCotizacion) {
    return '00001';
  }

  const ultimoNumero = parseInt(ultimaCotizacion.numero_cotizacion);
  const nuevoNumero = ultimoNumero + 1;
  return nuevoNumero.toString().padStart(5, '0');
};

// Calcular totales de la cotización
const calcularTotales = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const total = item.cantidad * item.precio_unitario * (1 - item.descuento_porcentaje / 100);
    return sum + total;
  }, 0);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    impuesto_valor: 0,
    total: parseFloat(subtotal.toFixed(2))
  };
};

// Crear cotización
export const crearCotizacion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { items, ...datosEmisor } = req.body;
    const usuarioEmail = req.usuario.email;

    logger.info('Intentando crear cotización', usuarioEmail);

    if (!items || items.length === 0) {
      logger.warn('Creación fallida - sin items', usuarioEmail);
      return res.status(400).json({
        error: 'Debe incluir al menos un item en la cotización'
      });
    }

    // Generar número de cotización
    const numeroCotizacion = await generarNumeroCotizacion();

    // Calcular totales
    const totales = calcularTotales(items);

    // Crear cotización
    const cotizacion = await Cotizacion.create({
      numero_cotizacion: numeroCotizacion,
      ...datosEmisor,
      ...totales,
      usuario_id: req.usuario.id
    }, { transaction });

    // Crear items
    const itemsConTotal = items.map((item, index) => {
      const total = item.cantidad * item.precio_unitario * (1 - (item.descuento_porcentaje || 0) / 100);
      return {
        ...item,
        cotizacion_id: cotizacion.id,
        total: parseFloat(total.toFixed(2)),
        orden: index
      };
    });

    await Item.bulkCreate(itemsConTotal, { transaction });

    await transaction.commit();

    // Obtener cotización completa con items
    const cotizacionCompleta = await Cotizacion.findByPk(cotizacion.id, {
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }]
    });

    logger.success('Cotización creada', `#${numeroCotizacion} | Cliente: ${datosEmisor.cliente_nombre} | Total: $${totales.total.toLocaleString()} | Por: ${usuarioEmail}`);
    
    res.status(201).json({
      message: 'Cotización creada exitosamente',
      data: cotizacionCompleta
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error al crear cotización', error);
    res.status(500).json({
      error: 'Error al crear la cotización',
      details: error.message
    });
  }
};

// Obtener todas las cotizaciones
export const obtenerCotizaciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, search } = req.query;
    const offset = (page - 1) * limit;
    const usuarioEmail = req.usuario.email;

    const where = {};
    
    if (estado) {
      where.estado = estado;
    }

    if (search) {
      where[Op.or] = [
        { numero_cotizacion: { [Op.iLike]: `%${search}%` } },
        { cliente_nombre: { [Op.iLike]: `%${search}%` } },
        { cliente_nit: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Cotizacion.findAndCountAll({
      where,
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }],
      order: [['numero_cotizacion', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    logger.cotizacion('LISTADO', 'todos', count, usuarioEmail);

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
    logger.error('Error al obtener cotizaciones', error);
    res.status(500).json({
      error: 'Error al obtener las cotizaciones',
      details: error.message
    });
  }
};

// Obtener una cotización por ID
export const obtenerCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioEmail = req.usuario.email;

    const cotizacion = await Cotizacion.findByPk(id, {
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }]
    });

    if (!cotizacion) {
      logger.warn('Cotización no encontrada', `ID: ${id} | Por: ${usuarioEmail}`);
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    logger.cotizacion('CONSULTA', cotizacion.numero_cotizacion, cotizacion.cliente_nombre, usuarioEmail);

    res.json({
      data: cotizacion
    });

  } catch (error) {
    logger.error('Error al obtener cotización', error);
    res.status(500).json({
      error: 'Error al obtener la cotización',
      details: error.message
    });
  }
};

// Actualizar cotización
export const actualizarCotizacion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { items, ...datosCotizacion } = req.body;
    const usuarioEmail = req.usuario.email;

    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      logger.warn('Actualización fallida - no encontrada', `ID: ${id} | Por: ${usuarioEmail}`);
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    const numeroAnterior = cotizacion.numero_cotizacion;

    // Actualizar cotización
    if (items && items.length > 0) {
      const totales = calcularTotales(items);
      await cotizacion.update({
        ...datosCotizacion,
        ...totales
      }, { transaction });

      // Eliminar items antiguos
      await Item.destroy({
        where: { cotizacion_id: id },
        transaction
      });

      // Crear nuevos items
      const itemsConTotal = items.map((item, index) => {
        const total = item.cantidad * item.precio_unitario * (1 - (item.descuento_porcentaje || 0) / 100);
        return {
          ...item,
          cotizacion_id: cotizacion.id,
          total: parseFloat(total.toFixed(2)),
          orden: index
        };
      });

      await Item.bulkCreate(itemsConTotal, { transaction });
    } else {
      await cotizacion.update(datosCotizacion, { transaction });
    }

    await transaction.commit();

    // Obtener cotización actualizada
    const cotizacionActualizada = await Cotizacion.findByPk(id, {
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }]
    });

    logger.success('Cotización actualizada', `#${numeroAnterior} | Cliente: ${cotizacion.cliente_nombre} | Total: $${cotizacion.total.toLocaleString()} | Por: ${usuarioEmail}`);

    res.json({
      message: 'Cotización actualizada exitosamente',
      data: cotizacionActualizada
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error al actualizar cotización', error);
    res.status(500).json({
      error: 'Error al actualizar la cotización',
      details: error.message
    });
  }
};

// Eliminar cotización
export const eliminarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioEmail = req.usuario.email;

    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      logger.warn('Eliminación fallida - no encontrada', `ID: ${id} | Por: ${usuarioEmail}`);
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    const numeroEliminado = cotizacion.numero_cotizacion;
    const clienteEliminado = cotizacion.cliente_nombre;
    
    await cotizacion.destroy();

    logger.success('Cotización eliminada', `#${numeroEliminado} | Cliente: ${clienteEliminado} | Por: ${usuarioEmail}`);

    res.json({
      message: 'Cotización eliminada exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar cotización', error);
    res.status(500).json({
      error: 'Error al eliminar la cotización',
      details: error.message
    });
  }
};

// Obtener siguiente número de cotización
export const obtenerSiguienteNumero = async (req, res) => {
  try {
    const numeroSiguiente = await generarNumeroCotizacion();
    logger.cotizacion('CONSULTA SIGUIENTE NÚMERO', numeroSiguiente, '', req.usuario.email);
    res.json({
      numero: numeroSiguiente
    });
  } catch (error) {
    logger.error('Error al obtener siguiente número', error);
    res.status(500).json({
      error: 'Error al obtener el siguiente número',
      details: error.message
    });
  }
};

// Enviar cotización por email
export const enviarCotizacion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const usuarioEmail = req.usuario.email;

    // Obtener cotización con sus items
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }]
    });

    if (!cotizacion) {
      logger.warn('Envío fallido - no encontrada', `ID: ${id} | Por: ${usuarioEmail}`);
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    // Verificar que no esté aceptada, rechazada o anulada
    if (cotizacion.estado === 'aceptada' || cotizacion.estado === 'rechazada' || cotizacion.estado === 'anulada') {
      logger.warn('Envío fallido - estado inválido', `#${cotizacion.numero_cotizacion} | Estado: ${cotizacion.estado} | Por: ${usuarioEmail}`);
      return res.status(400).json({
        error: `No se puede enviar una cotización en estado '${cotizacion.estado}'`
      });
    }

    // Generar PDF y obtener buffer
    const pdfBuffer = await generarPDFCotizacionBuffer(cotizacion.toJSON());

    // Enviar email
    await enviarCotizacionEmail(cotizacion.toJSON(), pdfBuffer);

    // Actualizar estado a 'enviada' solo si estaba en borrador
    const nuevoEstado = cotizacion.estado === 'borrador' ? 'enviada' : cotizacion.estado;
    await cotizacion.update({ estado: nuevoEstado }, { transaction });

    await transaction.commit();

    logger.email('ENVIADA', cotizacion.cliente_email, cotizacion.numero_cotizacion, usuarioEmail);

    res.json({
      message: cotizacion.estado === 'borrador' ? 'Cotización enviada exitosamente por email' : 'Cotización reenviada exitosamente por email',
      data: {
        cotizacion_id: cotizacion.id,
        numero_cotizacion: cotizacion.numero_cotizacion,
        destinatario: cotizacion.cliente_email,
        estado: nuevoEstado
      }
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error al enviar cotización', error);
    res.status(500).json({
      error: 'Error al enviar la cotización por email',
      details: error.message
    });
  }
};
