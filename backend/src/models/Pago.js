import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Pago = sequelize.define('Pago', {
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
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  tipo_pago: {
    type: DataTypes.ENUM('anticipo', 'pago_parcial', 'pago_total'),
    allowNull: false
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
    type: DataTypes.ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro'),
    defaultValue: 'transferencia'
  },
  numero_referencia: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: 'Número de transacción/cheque'
  },
  banco: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  notas: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  comprobante_url: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: 'Ruta del comprobante escaneado'
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
  tableName: 'pagos'
});

export default Pago;
