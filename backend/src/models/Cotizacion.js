import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cotizacion = sequelize.define('Cotizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_cotizacion: {
    type: DataTypes.STRING(10),
    unique: true,
    allowNull: false
  },
  // Datos del emisor
  emisor_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'JGS SOLUCIONES TECNOLOGICAS'
  },
  emisor_nit: {
    type: DataTypes.STRING(50),
    defaultValue: '1.143.351.428'
  },
  emisor_direccion: {
    type: DataTypes.TEXT,
    defaultValue: 'terrazas de granada mz a lt 6 piso 2'
  },
  emisor_web: {
    type: DataTypes.STRING(255),
    defaultValue: 'www.jgstecnologias.com.co'
  },
  emisor_contacto: {
    type: DataTypes.STRING(255),
    defaultValue: 'JHON JAIRO GAMBIN SALAS'
  },
  emisor_email: {
    type: DataTypes.STRING(255),
    defaultValue: 'jgs.tecnologias@gmail.com'
  },
  emisor_telefono: {
    type: DataTypes.STRING(50),
    defaultValue: '3003990501'
  },
  // Datos del cliente
  cliente_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cliente_nit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  cliente_direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cliente_web: {
    type: DataTypes.STRING(255)
  },
  cliente_contacto: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cliente_email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cliente_telefono: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  // Referencia al cliente del CRM
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id'
    },
    comment: 'Referencia al cliente del CRM'
  },
  // Datos de la cotización
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validez_oferta: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    comment: 'Días de validez'
  },
  divisa: {
    type: DataTypes.STRING(10),
    defaultValue: 'COP'
  },
  forma_pago: {
    type: DataTypes.STRING(100),
    defaultValue: 'Transferencia'
  },
  // Totales
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  impuesto_porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  impuesto_valor: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  // Notas y condiciones
  notas: {
    type: DataTypes.TEXT
  },
  condiciones: {
    type: DataTypes.TEXT
  },
  // Estado
  estado: {
    type: DataTypes.ENUM('borrador', 'enviada', 'aceptada', 'rechazada', 'anulada'),
    defaultValue: 'borrador'
  },
  // Usuario que creó la cotización
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'cotizaciones',
  indexes: [
    {
      unique: true,
      fields: ['numero_cotizacion']
    }
  ]
});

export default Cotizacion;