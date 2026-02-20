import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PagoProveedor = sequelize.define('PagoProveedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cuenta_por_pagar_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cuentas_por_pagar',
      key: 'id'
    }
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  monto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta', 'consignacion'),
    defaultValue: 'transferencia'
  },
  numero_referencia: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: 'Número de transacción'
  },
  banco: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  comprobante_url: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: 'Comprobante de pago'
  },
  notas: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'pagos_proveedor'
});

export default PagoProveedor;
