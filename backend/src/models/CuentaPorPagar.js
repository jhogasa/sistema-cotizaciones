import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CuentaPorPagar = sequelize.define('CuentaPorPagar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  tipo_gasto: {
    type: DataTypes.ENUM(
      'servicio_tecnico',
      'consultoria',
      'software',
      'hardware',
      'arriendo',
      'servicios_publicos',
      'nomina',
      'impuestos',
      'marketing',
      'transporte',
      'papeleria',
      'mantenimiento',
      'otro'
    ),
    allowNull: false
  },
  concepto: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción del gasto'
  },
  numero_factura: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: 'Número de factura del proveedor'
  },
  fecha_factura: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  monto_total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Calculado automáticamente'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'parcial', 'pagado', 'vencido', 'anulado'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  prioridad: {
    type: DataTypes.ENUM('alta', 'media', 'baja'),
    defaultValue: 'media'
  },
  dias_vencidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Calculado automáticamente'
  },
  comprobante_url: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: 'Factura escaneada'
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
  tableName: 'cuentas_por_pagar',
  hooks: {
    beforeSave: (cuenta) => {
      // Calcular saldo pendiente automáticamente
      cuenta.saldo_pendiente = cuenta.monto_total - cuenta.monto_pagado;
      
      // Calcular días vencidos
      const hoy = new Date();
      const vencimiento = new Date(cuenta.fecha_vencimiento);
      const diffTime = hoy - vencimiento;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cuenta.dias_vencidos = diffDays > 0 ? diffDays : 0;
      
      // Actualizar estado según días vencidos y saldo
      if (cuenta.saldo_pendiente === 0) {
        cuenta.estado = 'pagado';
      } else if (cuenta.dias_vencidos > 0 && cuenta.estado !== 'anulado') {
        cuenta.estado = 'vencido';
      } else if (cuenta.monto_pagado > 0 && cuenta.saldo_pendiente > 0) {
        cuenta.estado = 'parcial';
      }
    }
  }
});

export default CuentaPorPagar;
