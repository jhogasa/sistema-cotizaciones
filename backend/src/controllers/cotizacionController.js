import { Cotizacion, Item } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

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
    impuesto_valor: 0, // Puede calcularse según porcentaje
    total: parseFloat(subtotal.toFixed(2))
  };
};

// Crear cotización
export const crearCotizacion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { items, ...datosEmisor } = req.body;

    if (!items || items.length === 0) {
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
      ...totales
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

    res.status(201).json({
      message: 'Cotización creada exitosamente',
      data: cotizacionCompleta
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear cotización:', error);
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
      order: [['created_at', 'DESC']],
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
    console.error('Error al obtener cotizaciones:', error);
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

    const cotizacion = await Cotizacion.findByPk(id, {
      include: [{
        model: Item,
        as: 'items',
        order: [['orden', 'ASC']]
      }]
    });

    if (!cotizacion) {
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    res.json({
      data: cotizacion
    });

  } catch (error) {
    console.error('Error al obtener cotización:', error);
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

    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

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

    res.json({
      message: 'Cotización actualizada exitosamente',
      data: cotizacionActualizada
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar cotización:', error);
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

    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      return res.status(404).json({
        error: 'Cotización no encontrada'
      });
    }

    await cotizacion.destroy();

    res.json({
      message: 'Cotización eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar cotización:', error);
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
    res.json({
      numero: numeroSiguiente
    });
  } catch (error) {
    console.error('Error al obtener siguiente número:', error);
    res.status(500).json({
      error: 'Error al obtener el siguiente número',
      details: error.message
    });
  }
};