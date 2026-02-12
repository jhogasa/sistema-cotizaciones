import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Documento = sequelize.define('Documento', {
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
    type: DataTypes.ENUM('rut', 'camara_comercio', 'contrato', 'cedula', 'certificado', 'otro'),
    defaultValue: 'otro'
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre original del archivo'
  },
  ruta_archivo: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ruta del archivo en el servidor'
  },
  tamano: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tamaño en bytes'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    defaultValue: 'application/octet-stream'
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
  tableName: 'documentos',
  indexes: [
    {
      fields: ['cliente_id']
    },
    {
      fields: ['tipo']
    }
  ]
});

export default Documento;
