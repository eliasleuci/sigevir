// ════════════════════════════════════════════════════════════════════════════════
// Request Logger Middleware
// Registra todos los requests HTTP para debugging y auditoría
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Middleware que loguea información de cada request
 */
export const requestLogger = (req, res, next) => {
  // Timestamp del inicio del request
  const startTime = Date.now();

  // Obtener información del cliente
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');

  // Interceptar el método res.json original para loguear respuestas
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log formateado
    const logMessage = `
      [${new Date().toISOString()}] 
      ${req.method} ${req.path}
      Status: ${statusCode}
      Duration: ${duration}ms
      IP: ${clientIp}
    `;

    // Loguear solo en desarrollo o en case de errores
    if (process.env.NODE_ENV === 'development' || statusCode >= 400) {
      console.log(logMessage);
    }

    // Retornar respuesta original
    return originalJson.call(this, data);
  };

  next();
};
