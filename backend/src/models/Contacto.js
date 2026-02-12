import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Contacto = sequelize.define('Contacto', {
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
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  telefono: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  email: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  es_principal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'contactos',
  indexes: [
    {
      fields: ['cliente_id']
    },
    {
      fields: ['es_principal']
    }
  ]
});

export default Contacto;
