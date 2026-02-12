import dotenv from 'dotenv';
import { testConnection } from '../config/database.js';
import { syncDatabase, Usuario } from '../models/index.js';
import { logger } from '../services/loggerService.js';

dotenv.config();

const initSuperUser = async () => {
  logger.divider('👤 INICIALIZACIÓN DE SUPER USUARIO');
  
  try {
    logger.info('Conectando a la base de datos...');
    const conectado = await testConnection();
    
    if (!conectado) {
      logger.error('No se pudo conectar a la base de datos');
      process.exit(1);
    }
    logger.success('Conexión establecida');

    // Sincronizar modelos
    logger.info('Sincronizando modelos...');
    await syncDatabase(false);
    logger.success('Modelos sincronizados');

    // Verificar si ya existe un admin
    const adminExistente = await Usuario.findOne({ where: { rol: 'admin' } });
    
    if (adminExistente) {
      logger.info('Usuario administrador ya existe', `Email: ${adminExistente.email}`);
      console.log('\nℹ️  Ya existe un usuario administrador:');
      console.log(`   Email: ${adminExistente.email}`);
      console.log(`   Nombre: ${adminExistente.nombre}`);
      console.log('   Si necesita restablecer la contraseña, use la gestión de usuarios.');
    } else {
      // Crear super usuario
      logger.warn('No existe admin, creando uno nuevo...');
      const superUser = await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@jgs.com',
        password: 'admin123',
        rol: 'admin',
        activo: true
      });

      logger.success('Super usuario creado', `Email: ${superUser.email} | Rol: ${superUser.rol}`);
      console.log('\n✅ Super usuario creado exitosamente:');
      console.log(`   Email: ${superUser.email}`);
      console.log(`   Contraseña: admin123`);
      console.log(`   Rol: ${superUser.rol}`);
      console.log('\n⚠️  IMPORTANTE: Cambie la contraseña después del primer inicio de sesión.');
    }

    logger.divider('✅ INICIALIZACIÓN COMPLETA');
    process.exit(0);
  } catch (error) {
    logger.error('Error al inicializar super usuario', error);
    process.exit(1);
  }
};

initSuperUser();
