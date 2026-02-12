import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Interaccion = sequelize.define('Interaccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('llamada', 'whatsapp', 'email', 'visita', 'nota', 'reunion'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  // Si es una cotización asociada
  cotizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de cotización asociada (opcional)'
  },
  duracion_minutos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Duración en minutos (para llamadas)'
  },
  resultado: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: 'Resultado de la interacción'
  }
}, {
  tableName: 'interacciones',
  indexes: [
    {
      fields: ['cliente_id']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['fecha']
    },
    {
      fields: ['usuario_id']
    }
  ]
});

export default Interaccion;
