import { Pago, Movimiento, Proveedor, CuentaPorPagar, PagoProveedor, Cliente, Cotizacion } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { logger } from '../services/loggerService.js';

// GET /api/financiero/dashboard - Dashboard financiero
export const getDashboard = async (req, res) => {
  try {
    const { mes, anio, periodo } = req.query;
    const fechaActual = new Date();
    
    let fechaInicio, fechaFin;
    
    // Si no se especifica período, mostrar TODOS los datos
    if (!periodo || periodo === 'todos') {
      fechaInicio = null;
      fechaFin = null;
    } else if (periodo === 'mes') {
      const mesActual = mes || (fechaActual.getMonth() + 1);
      const anioActual = anio || fechaActual.getFullYear();
      fechaInicio = new Date(anioActual, mesActual - 1, 1);
      fechaFin = new Date(anioActual, mesActual, 0);
    } else if (periodo === 'año') {
      const anioActual = anio || fechaActual.getFullYear();
      fechaInicio = new Date(anioActual, 0, 1);
      fechaFin = new Date(anioActual, 11, 31);
    } else if (periodo === 'dia') {
      fechaInicio = new Date(fechaActual.toDateString());
      fechaFin = new Date(fechaActual.toDateString());
    }

    // Build where conditions
    const whereIngresos = { tipo: 'ingreso' };
    const whereEgresos = { tipo: 'egreso' };
    
    if (fechaInicio && fechaFin) {
      whereIngresos.fecha = { [Op.between]: [fechaInicio, fechaFin] };
      whereEgresos.fecha = { [Op.between]: [fechaInicio, fechaFin] };
    }

    // Total ingresos
    const totalIngresos = await Movimiento.sum('monto', {
      where: whereIngresos
    }) || 0;

    // Total egresos
    const totalEgresos = await Movimiento.sum('monto', {
      where: whereEgresos
    }) || 0;

    // Balance
    const balance = totalIngresos - totalEgresos;
    const margen = totalIngresos > 0 ? ((balance / totalIngresos) * 100).toFixed(2) : 0;

    // Cuentas por cobrar
    const cuentasPorCobrar = await Cotizacion.findAll({
      attributes: [
        'id',
        'numero_cotizacion',
        'cliente_nombre',
        'total',
        [sequelize.literal('total - COALESCE((SELECT SUM(monto) FROM pagos WHERE pagos.cotizacion_id = "Cotizacion".id), 0)'), 'saldo_pendiente']
      ],
      where: sequelize.literal('total > COALESCE((SELECT SUM(monto) FROM pagos WHERE pagos.cotizacion_id = "Cotizacion".id), 0)'),
      order: [['fecha', 'DESC']],
      limit: 10
    });

    const totalPorCobrar = cuentasPorCobrar.reduce((sum, c) => sum + parseFloat(c.dataValues.saldo_pendiente || 0), 0);

    // Cuentas por pagar
    const cuentasPorPagar = await CuentaPorPagar.findAll({
      where: {
        estado: {
          [Op.in]: ['pendiente', 'parcial', 'vencido']
        }
      },
      include: [{
        model: Proveedor,
        as: 'proveedor',
        attributes: ['nombre']
      }],
      order: [['fecha_vencimiento', 'ASC']],
      limit: 10
    });

    const totalPorPagar = cuentasPorPagar.reduce((sum, c) => sum + parseFloat(c.saldo_pendiente || 0), 0);

    // Cuentas vencidas
    const cuentasVencidas = cuentasPorPagar.filter(c => c.estado === 'vencido');
    const totalVencido = cuentasVencidas.reduce((sum, c) => sum + parseFloat(c.saldo_pendiente || 0), 0);

    // Últimos movimientos
    const ultimosMovimientos = await Movimiento.findAll({
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['nombre']
        },
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'DESC'], ['created_at', 'DESC']],
      limit: 10
    });

    logger.info('Dashboard financiero consultado', `${periodo || 'todos'} | Por: ${req.usuario.email}`);

    res.json({
      data: {
        resumen: {
          ingresos: parseFloat(totalIngresos).toFixed(2),
          egresos: parseFloat(totalEgresos).toFixed(2),
          balance: parseFloat(balance).toFixed(2),
          margen: parseFloat(margen)
        },
        cuentas_por_cobrar: {
          total: parseFloat(totalPorCobrar).toFixed(2),
          cantidad: cuentasPorCobrar.length,
          lista: cuentasPorCobrar
        },
        cuentas_por_pagar: {
          total: parseFloat(totalPorPagar).toFixed(2),
          cantidad: cuentasPorPagar.length,
          vencidas: {
            cantidad: cuentasVencidas.length,
            total: parseFloat(totalVencido).toFixed(2)
          },
          lista: cuentasPorPagar
        },
        ultimos_movimientos: ultimosMovimientos
      }
    });

  } catch (error) {
    logger.error('Error al obtener dashboard financiero', error);
    res.status(500).json({
      error: 'Error al obtener el dashboard financiero',
      details: error.message
    });
  }
};

// GET /api/financiero/movimientos - Listar movimientos
export const getMovimientos = async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo, categoria, fecha_inicio, fecha_fin, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;
    if (fecha_inicio && fecha_fin) {
      where.fecha = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }

    // Si hay búsqueda, filtrar por cliente o proveedor
    let include = [
      {
        model: Cliente,
        as: 'cliente',
        attributes: ['nombre']
      },
      {
        model: Proveedor,
        as: 'proveedor',
        attributes: ['nombre']
      }
    ];

    // Agregar filtro de búsqueda por cliente o proveedor
    if (search) {
      include = [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['nombre'],
          where: {
            nombre: { [Op.iLike]: `%${search}%` }
          },
          required: false
        },
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre'],
          where: {
            nombre: { [Op.iLike]: `%${search}%` }
          },
          required: false
        }
      ];
      
      // También buscar en proveedor_nombre (para proveedores no registrados)
      where[Op.or] = [
        { proveedor_nombre: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Movimiento.findAndCountAll({
      where,
      include,
      order: [['fecha', 'DESC'], ['created_at', 'DESC']],
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
    logger.error('Error al obtener movimientos', error);
    res.status(500).json({
      error: 'Error al obtener los movimientos',
      details: error.message
    });
  }
};

// POST /api/financiero/movimientos - Crear movimiento manual
export const crearMovimiento = async (req, res) => {
  try {
    const datosMovimiento = req.body;

    const movimiento = await Movimiento.create({
      ...datosMovimiento,
      usuario_id: req.usuario.id
    });

    logger.success('Movimiento creado', `${movimiento.tipo} | ${movimiento.monto} | Por: ${req.usuario.email}`);

    res.status(201).json({
      message: 'Movimiento registrado exitosamente',
      data: movimiento
    });

  } catch (error) {
    logger.error('Error al crear movimiento', error);
    res.status(500).json({
      error: 'Error al crear el movimiento',
      details: error.message
    });
  }
};

// POST /api/financiero/pagos - Registrar pago de cotización
export const registrarPago = async (req, res) => {
  try {
    const { cotizacion_id, tipo_pago, monto, fecha_pago, metodo_pago, numero_referencia, banco, notas } = req.body;

    // Verificar que la cotización exista
    const cotizacion = await Cotizacion.findByPk(cotizacion_id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    // Verificar que la cotización esté aceptada
    if (cotizacion.estado !== 'aceptada') {
      return res.status(400).json({ 
        error: 'Solo se pueden registrar pagos de cotizaciones aceptadas' 
      });
    }

    // Calcular lo ya pagado
    const pagosAnteriores = await Pago.sum('monto', { 
      where: { cotizacion_id } 
    }) || 0;

    const nuevoTotalPagado = parseFloat(pagosAnteriores) + parseFloat(monto);
    
    // Verificar que no exceda el total
    if (nuevoTotalPagado > parseFloat(cotizacion.total)) {
      return res.status(400).json({
        error: 'El monto del pago excede el total de la cotización',
        details: {
          total_cotizacion: cotizacion.total,
          ya_pagado: pagosAnteriores,
          monto_nuevo: monto,
          exceso: nuevoTotalPagado - parseFloat(cotizacion.total)
        }
      });
    }

    // Crear el pago
    const pago = await Pago.create({
      cotizacion_id,
      cliente_id: cotizacion.cliente_id,
      tipo_pago,
      monto: parseFloat(monto),
      fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
      metodo_pago: metodo_pago || 'transferencia',
      numero_referencia: numero_referencia || '',
      banco: banco || '',
      notas: notas || '',
      usuario_id: req.usuario.id
    });

    // Crear automáticamente un movimiento financiero de ingreso
    await Movimiento.create({
      tipo: 'ingreso',
      categoria: tipo_pago === 'anticipo' ? 'anticipo' : 'pago_cotizacion',
      monto: parseFloat(monto),
      fecha: fecha_pago || new Date().toISOString().split('T')[0],
      descripcion: `${tipo_pago === 'anticipo' ? 'Anticipo' : 'Pago'} - Cotización ${cotizacion.numero_cotizacion} - ${cotizacion.cliente_nombre}`,
      cliente_id: cotizacion.cliente_id,
      cotizacion_id: cotizacion.id,
      pago_id: pago.id,
      metodo_pago: metodo_pago || 'transferencia',
      numero_referencia: numero_referencia || '',
      usuario_id: req.usuario.id
    });

    logger.success('Pago registrado', `Cotización #${cotizacion.numero_cotizacion} | ${monto} | Por: ${req.usuario.email}`);

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      data: {
        pago,
        cotizacion: cotizacion.numero_cotizacion,
        cliente: cotizacion.cliente_nombre,
        total_cotizacion: cotizacion.total,
        total_pagado: nuevoTotalPagado,
        saldo_pendiente: parseFloat(cotizacion.total) - nuevoTotalPagado
      }
    });

  } catch (error) {
    logger.error('Error al registrar pago', error);
    res.status(500).json({
      error: 'Error al registrar el pago',
      details: error.message
    });
  }
};

// GET /api/financiero/pagos/:cotizacionId - Obtener pagos de una cotización
export const getPagosPorCotizacion = async (req, res) => {
  try {
    const { cotizacionId } = req.params;

    const cotizacion = await Cotizacion.findByPk(cotizacionId, {
      attributes: ['id', 'numero_cotizacion', 'cliente_nombre', 'total', 'estado']
    });

    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const pagos = await Pago.findAll({
      where: { cotizacion_id: cotizacionId },
      order: [['fecha_pago', 'DESC']],
      include: [{
        model: require('../models/index.js').Usuario,
        as: 'usuario',
        attributes: ['nombre', 'email']
      }]
    });

    const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

    res.json({
      cotizacion,
      pagos,
      resumen: {
        total_cotizacion: cotizacion.total,
        total_pagado: totalPagado,
        saldo_pendiente: parseFloat(cotizacion.total) - totalPagado,
        esta_pagada: totalPagado >= parseFloat(cotizacion.total)
      }
    });

  } catch (error) {
    logger.error('Error al obtener pagos', error);
    res.status(500).json({
      error: 'Error al obtener los pagos',
      details: error.message
    });
  }
};

// PUT /api/financiero/cotizaciones/:id/estado - Cambiar estado de cotización
export const cambiarEstadoCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    // Estados válidos
    const estadosValidos = ['borrador', 'enviada', 'aceptada', 'rechazada', 'anulada'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        detalles: `Estados válidos: ${estadosValidos.join(', ')}`
      });
    }

    const cotizacion = await Cotizacion.findByPk(id);
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    // Validaciones de transición de estado
    if (estado === 'aceptada' && !['borrador', 'enviada'].includes(cotizacion.estado)) {
      return res.status(400).json({
        error: 'No se puede aceptar una cotización que ya fue aceptada, rechazada o anulada'
      });
    }

    if (estado === 'rechazada' && !['borrador', 'enviada'].includes(cotizacion.estado)) {
      return res.status(400).json({
        error: 'No se puede rechazar una cotización que ya fue aceptada, rechazada o anulada'
      });
    }

    await cotizacion.update({ estado });

    logger.success('Estado de cotización actualizado', `#${cotizacion.numero_cotizacion} → ${estado} | Por: ${req.usuario.email}`);

    res.json({
      message: `Cotización marcada como '${estado}'`,
      data: {
        id: cotizacion.id,
        numero_cotizacion: cotizacion.numero_cotizacion,
        estado_anterior: cotizacion.estado,
        estado: estado
      }
    });

  } catch (error) {
    logger.error('Error al cambiar estado', error);
    res.status(500).json({
      error: 'Error al cambiar el estado de la cotización',
      details: error.message
    });
  }
};

// GET /api/financiero/reportes/ingresos-egresos - Reporte de ingresos vs egresos
export const getReporteIngresosEgresos = async (req, res) => {
  try {
    const { anio = new Date().getFullYear() } = req.query;

    const movimientos = await Movimiento.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM fecha')), 'mes'],
        'tipo',
        [sequelize.fn('SUM', sequelize.col('monto')), 'total']
      ],
      where: sequelize.where(
        sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM fecha')),
        anio
      ),
      group: ['mes', 'tipo'],
      order: [[sequelize.literal('mes'), 'ASC']]
    });

    // Organizar datos por mes
    const reporte = [];
    for (let mes = 1; mes <= 12; mes++) {
      const ingresos = movimientos.find(m => m.dataValues.mes == mes && m.tipo === 'ingreso');
      const egresos = movimientos.find(m => m.dataValues.mes == mes && m.tipo === 'egreso');
      
      reporte.push({
        mes,
        ingresos: parseFloat(ingresos?.dataValues.total || 0),
        egresos: parseFloat(egresos?.dataValues.total || 0),
        balance: parseFloat(ingresos?.dataValues.total || 0) - parseFloat(egresos?.dataValues.total || 0)
      });
    }

    res.json({ data: reporte });

  } catch (error) {
    logger.error('Error al obtener reporte', error);
    res.status(500).json({
      error: 'Error al obtener el reporte',
      details: error.message
    });
  }
};
