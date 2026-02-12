import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.STRING(20),
    defaultValue: 'empresa'
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  departamento: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  pagina_web: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'prospecto'
  },
  sector: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  prioridad: {
    type: DataTypes.STRING(20),
    defaultValue: 'media'
  },
  tamano: {
    type: DataTypes.STRING(20),
    defaultValue: 'mediano'
  },
  sincronizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ultimo_contacto: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notas_internas: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'clientes'
});

export default Cliente;
