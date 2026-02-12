import dotenv from 'dotenv';
import { testConnection } from '../config/database.js';
import { syncDatabase, Usuario } from '../models/index.js';

dotenv.config();

const initSuperUser = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    const conectado = await testConnection();
    
    if (!conectado) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Sincronizar modelos
    await syncDatabase(false);

    // Verificar si ya existe un admin
    const adminExistente = await Usuario.findOne({ where: { rol: 'admin' } });
    
    if (adminExistente) {
      console.log('ℹ️  Ya existe un usuario administrador:');
      console.log(`   Email: ${adminExistente.email}`);
      console.log(`   Nombre: ${adminExistente.nombre}`);
      console.log('   Si necesita restablecer la contraseña, use la gestión de usuarios.');
    } else {
      // Crear super usuario
      const superUser = await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@jgs.com',
        password: 'admin123',
        rol: 'admin',
        activo: true
      });

      console.log('✅ Super usuario creado exitosamente:');
      console.log(`   Email: ${superUser.email}`);
      console.log(`   Contraseña: admin123`);
      console.log(`   Rol: ${superUser.rol}`);
      console.log('\n⚠️  IMPORTANTE: Cambie la contraseña después del primer inicio de sesión.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar super usuario:', error);
    process.exit(1);
  }
};

initSuperUser();
