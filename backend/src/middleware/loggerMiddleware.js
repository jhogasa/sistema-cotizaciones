import { logger } from '../services/loggerService.js';

/**
 * Middleware para registrar todas las solicitudes API
 */
export const logRequests = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Capturar usuario si está autenticado
  if (req.usuario) {
    logger.setUser(req.usuario);
  }

  // Log de solicitud entrante
  logger.api(method, originalUrl, '...', 0, req.usuario?.email || 'Anonimo');

  // Sobrescribir response.send para capturar respuesta
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Log de respuesta
    logger.api(method, originalUrl, status, duration, req.usuario?.email || 'Anonimo');

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware para logging de errores
 */
export const logErrors = (err, req, res, next) => {
  logger.error(
    `Error en ${req.method} ${req.originalUrl}`,
    err
  );
  next();
};

export default { logRequests, logErrors };
