import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Movimiento = sequelize.define('Movimiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'egreso'),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'venta, servicio, nomina, arriendo, servicios, compras, etc.'
  },
  subcategoria: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: 'Más específico'
  },
  monto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id'
    },
    comment: 'Solo para ingresos'
  },
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cotizaciones',
      key: 'id'
    }
  },
  pago_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pagos',
      key: 'id'
    }
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'proveedores',
      key: 'id'
    },
    comment: 'Para egresos'
  },
  cuenta_por_pagar_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cuentas_por_pagar',
      key: 'id'
    }
  },
  pago_proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pagos_proveedor',
      key: 'id'
    }
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro'),
    defaultValue: 'transferencia'
  },
  numero_referencia: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  proveedor_nombre: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: 'Para egresos sin proveedor registrado'
  },
  comprobante_url: {
    type: DataTypes.STRING(255),
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
  tableName: 'movimientos'
});

export default Movimiento;
