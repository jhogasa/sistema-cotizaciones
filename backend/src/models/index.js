import sequelize from '../config/database.js';
import Cotizacion from './Cotizacion.js';
import Item from './Item.js';
import Usuario from './Usuario.js';
import Cliente from './Cliente.js';
import Contacto from './Contacto.js';
import Interaccion from './Interaccion.js';
import Documento from './Documento.js';

// ============ ASOCIACIONES ============

// Cliente - Contactos (1:N)
Cliente.hasMany(Contacto, { 
  foreignKey: 'cliente_id', 
  as: 'contactos',
  onDelete: 'CASCADE' 
});
Contacto.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// Cliente - Interacciones (1:N)
Cliente.hasMany(Interaccion, { 
  foreignKey: 'cliente_id', 
  as: 'interacciones',
  onDelete: 'CASCADE' 
});
Interaccion.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// Cliente - Documentos (1:N)
Cliente.hasMany(Documento, { 
  foreignKey: 'cliente_id', 
  as: 'documentos',
  onDelete: 'CASCADE' 
});
Documento.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// Cliente - Cotizaciones (1:N)
Cliente.hasMany(Cotizacion, { 
  foreignKey: 'cliente_id', 
  as: 'cotizaciones',
  onDelete: 'SET NULL' 
});
Cotizacion.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

// ============ SINCRONIZACIÓN ============

// Sincronizar modelos con la base de datos
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
    throw error;
  }
};

// ============ EXPORTS ============

export {
  Cotizacion,
  Item,
  Usuario,
  Cliente,
  Contacto,
  Interaccion,
  Documento
};

// Exportar sequelize también
export { default as sequelizeInstance } from '../config/database.js';
