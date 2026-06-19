import logger from '../utils/logger.js';

/**
 * Middleware global de manejo de errores
 * Captura todos los errores, loguea en auditoría y retorna respuesta consistente
 */
export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Log siempre completo internamente
  logger.error({
    message: err.message,
    stack:   err.stack,
    code:    err.code,
    url:     req.originalUrl,
    method:  req.method,
    user:    req.user?.email || 'anónimo',
  });

  // Respuesta al cliente: en producción, mensajes genéricos
  const status  = err.statusCode || err.status || 500;
  const message = isDev
    ? err.message
    : status === 500
      ? 'Error interno del servidor. Por favor, intentá de nuevo.'
      : err.message;

  res.status(status).json({
    success: false,
    error: {
      message,
      code:  err.code || 'INTERNAL_ERROR',
      // Solo en desarrollo: stack trace
      ...(isDev && { stack: err.stack }),
    },
  });
};

// Clase base para errores personalizados
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError as ApiError };
