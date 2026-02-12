import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { syncDatabase } from './models/index.js';
import cotizacionesRoutes from './routes/cotizaciones.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Cotizaciones - JGS Soluciones Tecnológicas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      cotizaciones: '/api/cotizaciones',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (public login, protected profile/users)
app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/cotizaciones', authMiddleware, cotizacionesRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores general
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    const conectado = await testConnection();
    
    if (!conectado) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Sincronizar modelos
    await syncDatabase(false); // Cambiar a true solo para desarrollo inicial

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📁 Base de datos: ${process.env.DB_NAME}`);
      console.log(`🔐 Autenticación JWT habilitada`);
      console.log('\n✅ Sistema listo para recibir peticiones\n');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;
