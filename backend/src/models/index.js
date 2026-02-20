import sequelize from '../config/database.js';
import Cotizacion from './Cotizacion.js';
import Item from './Item.js';
import Usuario from './Usuario.js';
import Cliente from './Cliente.js';
import Contacto from './Contacto.js';
import Interaccion from './Interaccion.js';
import Documento from './Documento.js';
import Pago from './Pago.js';
import Movimiento from './Movimiento.js';
import Proveedor from './Proveedor.js';
import CuentaPorPagar from './CuentaPorPagar.js';
import PagoProveedor from './PagoProveedor.js';

// ============ ASOCIACIONES ============

// Cliente - Contactos (1:N)
Cliente.hasMany(Contacto, { 
  foreignKey: 'cliente_id', 
  as: 'contactos',
  onDelete: 'CASCADE' 
});
Contacto.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// Cliente - Interacciones (1:N)
Cliente.hasMany(Interaccion, { 
  foreignKey: 'cliente_id', 
  as: 'interacciones',
  onDelete: 'CASCADE' 
});
Interaccion.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// Cliente - Documentos (1:N)
Cliente.hasMany(Documento, { 
  foreignKey: 'cliente_id', 
  as: 'documentos',
  onDelete: 'CASCADE' 
});
Documento.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// Cliente - Cotizaciones (1:N)
Cliente.hasMany(Cotizacion, { 
  foreignKey: 'cliente_id', 
  as: 'cotizaciones',
  onDelete: 'SET NULL' 
});
Cotizacion.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// ============ MÓDULO FINANCIERO ============

// Cotizacion - Pagos (1:N)
Cotizacion.hasMany(Pago, {
  foreignKey: 'cotizacion_id',
  as: 'pagos',
  onDelete: 'CASCADE'
});
Pago.belongsTo(Cotizacion, {
  foreignKey: 'cotizacion_id',
  as: 'cotizacion'
});

// Cliente - Pagos (1:N)
Cliente.hasMany(Pago, {
  foreignKey: 'cliente_id',
  as: 'pagos',
  onDelete: 'CASCADE'
});
Pago.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

// Proveedor - CuentasPorPagar (1:N)
Proveedor.hasMany(CuentaPorPagar, {
  foreignKey: 'proveedor_id',
  as: 'cuentas_por_pagar',
  onDelete: 'CASCADE'
});
CuentaPorPagar.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

// CuentaPorPagar - PagosProveedor (1:N)
CuentaPorPagar.hasMany(PagoProveedor, {
  foreignKey: 'cuenta_por_pagar_id',
  as: 'pagos',
  onDelete: 'CASCADE'
});
PagoProveedor.belongsTo(CuentaPorPagar, {
  foreignKey: 'cuenta_por_pagar_id',
  as: 'cuenta_por_pagar'
});

// Proveedor - PagosProveedor (1:N)
Proveedor.hasMany(PagoProveedor, {
  foreignKey: 'proveedor_id',
  as: 'pagos',
  onDelete: 'CASCADE'
});
PagoProveedor.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

// Movimientos - Relaciones opcionales
Movimiento.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});
Movimiento.belongsTo(Cotizacion, {
  foreignKey: 'cotizacion_id',
  as: 'cotizacion'
});
Movimiento.belongsTo(Pago, {
  foreignKey: 'pago_id',
  as: 'pago'
});
Movimiento.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});
Movimiento.belongsTo(CuentaPorPagar, {
  foreignKey: 'cuenta_por_pagar_id',
  as: 'cuenta_por_pagar'
});
Movimiento.belongsTo(PagoProveedor, {
  foreignKey: 'pago_proveedor_id',
  as: 'pago_proveedor'
});

// ============ SINCRONIZACIÓN ============

// Sincronizar modelos con la base de datos
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
    throw error;
  }
};

// ============ EXPORTS ============

export {
  Cotizacion,
  Item,
  Usuario,
  Cliente,
  Contacto,
  Interaccion,
  Documento,
  Pago,
  Movimiento,
  Proveedor,
  CuentaPorPagar,
  PagoProveedor
};

// Exportar sequelize también
export { default as sequelizeInstance } from '../config/database.js';
