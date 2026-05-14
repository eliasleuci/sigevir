import logger from '../utils/logger.js';

/**
 * Middleware global de manejo de errores
 * Captura todos los errores, loguea en auditoría y retorna respuesta consistente
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Estructura de respuesta consistente
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  };

  // Log de auditoría detallado
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    institutionId: req.user?.institucion_id || null,
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query
  });

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
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
