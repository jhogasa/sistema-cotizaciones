import sequelize from '../config/database.js';
import Cotizacion from './Cotizacion.js';
import Item from './Item.js';
import Usuario from './Usuario.js';

// Sincronizar modelos con la base de datos
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    throw error;
  }
};

export {
  Cotizacion,
  Item,
  Usuario
};
