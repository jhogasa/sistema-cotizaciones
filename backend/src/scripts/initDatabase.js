import { testConnection } from '../config/database.js';
import { syncDatabase, Cotizacion, Item } from '../models/index.js';

const inicializarBaseDatos = async () => {
  try {
    console.log('🔄 Iniciando configuración de base de datos...\n');

    // Probar conexión
    const conectado = await testConnection();
    
    if (!conectado) {
      console.error('❌ No se pudo conectar a PostgreSQL');
      console.log('\nVerifica que:');
      console.log('1. PostgreSQL esté instalado y corriendo');
      console.log('2. La base de datos exista');
      console.log('3. Las credenciales en .env sean correctas\n');
      process.exit(1);
    }

    // Sincronizar modelos (crear tablas)
    console.log('\n📋 Creando tablas en la base de datos...');
    await syncDatabase(true); // force: true recrea las tablas

    console.log('\n✅ Base de datos inicializada correctamente\n');
    console.log('Tablas creadas:');
    console.log('- cotizaciones');
    console.log('- items\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
  }
};

inicializarBaseDatos();