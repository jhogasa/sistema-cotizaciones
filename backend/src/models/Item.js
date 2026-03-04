import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Cotizacion from './Cotizacion.js';

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cotizaciones',
      key: 'id'
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  descuento_porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  aplica_iva: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si el item tiene IVA (19%)'
  },
  iva_valor: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Valor del IVA calculado'
  },
  total_sin_iva: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Total del item sin IVA'
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Orden de visualización del item'
  }
}, {
  tableName: 'items',
  indexes: [
    {
      fields: ['cotizacion_id']
    }
  ]
});

// Relaciones
Cotizacion.hasMany(Item, {
  foreignKey: 'cotizacion_id',
  as: 'items',
  onDelete: 'CASCADE'
});

Item.belongsTo(Cotizacion, {
  foreignKey: 'cotizacion_id',
  as: 'cotizacion'
});

export default Item;