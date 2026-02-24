import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { syncDatabase, Usuario } from './models/index.js';
import cotizacionesRoutes from './routes/cotizaciones.js';
import clientesRoutes from './routes/clientes.js';
import authRoutes from './routes/auth.js';
import proveedoresRoutes from './routes/proveedores.js';
import financieroRoutes from './routes/financiero.js';
import { authMiddleware } from './middleware/auth.js';
import { logRequests, logErrors } from './middleware/loggerMiddleware.js';
import { logger } from './services/loggerService.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging de requests
app.use(logRequests);

// Log de inicio
logger.divider('🚀 SISTEMA DE COTIZACIONES - JGS SOLUCIONES TECNOLÓGICAS');
logger.system('Inicializando servidor...');

// Rutas
app.get('/', (req, res) => {
  logger.api('GET', '/', 200, 0);
  res.json({
    message: 'API de Cotizaciones - JGS Soluciones Tecnológicas',
    version: '2.1.0',
    endpoints: {
      auth: '/api/auth',
      cotizaciones: '/api/cotizaciones',
      clientes: '/api/clientes',
      proveedores: '/api/proveedores',
      financiero: '/api/financiero',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  logger.api('GET', '/health', 200, 0);
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (public login, protected profile/users)
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/cotizaciones', authMiddleware, cotizacionesRoutes);
app.use('/api/clientes', authMiddleware, clientesRoutes);
app.use('/api/proveedores', authMiddleware, proveedoresRoutes);
app.use('/api/financiero', authMiddleware, financieroRoutes);

// Manejo de errores 404
app.use((req, res) => {
  logger.warn('Ruta no encontrada', req.path);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores general
app.use((err, req, res, next) => {
  logErrors(err, req, res, next);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    logger.info('Conectando a base de datos...');
    const conectado = await testConnection();
    
    if (!conectado) {
      logger.error('No se pudo conectar a la base de datos');
      process.exit(1);
    }
    logger.success('Conexión a PostgreSQL establecida');

    // Sincronizar modelos
    logger.info('Sincronizando modelos con la base de datos...');
    await syncDatabase(false);
    logger.success('Modelos sincronizados');

    // Crear usuario admin si no existe
    logger.info('Verificando usuario administrador...');
    const adminExists = await Usuario.findOne({ where: { rol: 'admin' } });
    if (!adminExists) {
      logger.warn('No existe admin, creando uno nuevo...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@jgs.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true
      });
      logger.success('Usuario administrador creado: admin@jgs.com / admin123');
    } else {
      logger.success('Usuario administrador ya existe');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.divider('✅ SERVIDOR INICIADO CORRECTAMENTE');
      console.log(`\n🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📁 Base de datos: ${process.env.DB_NAME}`);
      console.log(`🔐 Autenticación JWT habilitada`);
      console.log('\n📝 El sistema está registrando todas las acciones en tiempo real.\n');
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;
