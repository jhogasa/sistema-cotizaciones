import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('empresa', 'persona', 'tecnico_externo', 'freelancer'),
    defaultValue: 'empresa',
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nit_cedula: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  email: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  direccion: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  ciudad: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  departamento: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  banco: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: 'Banco para pagos'
  },
  tipo_cuenta: {
    type: DataTypes.ENUM('ahorros', 'corriente'),
    allowNull: true
  },
  numero_cuenta: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  categoria: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: 'servicios_tecnicos, software, hardware, consultoria, etc.'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo',
    allowNull: false
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
  tableName: 'proveedores'
});

export default Proveedor;
