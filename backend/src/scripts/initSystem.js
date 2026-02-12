import dotenv from 'dotenv';
import { testConnection } from '../config/database.js';
import { syncDatabase, Usuario, Cotizacion, Item } from '../models/index.js';
import { Sequelize } from 'sequelize';

dotenv.config();

const inicializarSistema = async () => {
  try {
    console.log('🔄 Verificando configuración del sistema...\n');

    // Probar conexión a PostgreSQL
    console.log('📊 Verificando conexión a PostgreSQL...');
    const conectado = await testConnection();
    
    if (!conectado) {
      console.error('❌ No se pudo conectar a PostgreSQL');
      console.log('\nVerifica que:');
      console.log('1. PostgreSQL esté instalado y corriendo');
      console.log('2. La base de datos exista');
      console.log('3. Las credenciales en .env sean correctas\n');
      process.exit(1);
    }
    console.log('✅ Conexión a PostgreSQL establecida.\n');

    // Verificar si la base de datos tiene tablas
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false
      }
    );

    let dbExists = false;
    try {
      await sequelize.authenticate();
      const [results] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'cotizaciones'
        );
      `);
      dbExists = results[0]?.exists || false;
    } catch (error) {
      dbExists = false;
    }

    // Sincronizar modelos (crear tablas si no existen)
    console.log('📋 Verificando tablas de la base de datos...');
    await syncDatabase(false); // force: false no borra datos
    console.log('✅ Tablas verificadas/creadas.\n');

    // Verificar si existe un usuario admin
    console.log('👤 Verificando usuario administrador...');
    const adminExistente = await Usuario.findOne({ where: { rol: 'admin' } });
    
    if (adminExistente) {
      console.log('ℹ️  Usuario administrador ya existe:');
      console.log(`   Email: ${adminExistente.email}`);
      console.log('   No es necesario crear uno nuevo.\n');
    } else {
      console.log('⚠️  No se encontró usuario administrador.');
      console.log('   Creando usuario administrador por defecto...\n');
      
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@jgs.com',
        password: 'admin123',
        rol: 'admin',
        activo: true
      });

      console.log('✅ Usuario administrador creado:');
      console.log('   Email: admin@jgs.com');
      console.log('   Password: admin123');
      console.log('\n⚠️  IMPORTANTE: Cambie la contraseña después del primer inicio de sesión.\n');
    }

    await sequelize.close();

    console.log('============================================');
    console.log('    SISTEMA LISTO PARA INICIAR');
    console.log('============================================\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar el sistema:', error);
    process.exit(1);
  }
};

inicializarSistema();
