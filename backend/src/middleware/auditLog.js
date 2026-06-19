import logger from '../utils/logger.js';

/**
 * Middleware de auditoría: registra quién hizo qué y cuándo.
 * No modifica la lógica de negocio, solo registra.
 *
 * @param {string} accion   - Ej: 'CREAR', 'MODIFICAR', 'ELIMINAR', 'CONSULTAR'
 * @param {string} entidad  - Ej: 'RETENCION', 'VEHICULO', 'USUARIO'
 */
export const auditLog = (accion, entidad) => (req, res, next) => {
  const inicio = Date.now();
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    const duracion = Date.now() - inicio;
    const exitoso = res.statusCode < 400;

    // Registrar en log estructurado
    const logData = {
      tipo: 'AUDITORIA',
      accion,
      entidad,
      exitoso,
      usuario_id:    req.user?.id      || 'anonimo',
      usuario_email: req.user?.email   || 'anonimo',
      usuario_rol:   req.user?.role    || 'desconocido',
      ip:            req.ip            || req.connection?.remoteAddress,
      metodo:        req.method,
      ruta:          req.originalUrl,
      status:        res.statusCode,
      duracion_ms:   duracion,
      timestamp:     new Date().toISOString(),
    };

    if (exitoso) {
      logger.info('AUDIT', logData);
    } else {
      logger.warn('AUDIT_FALLO', logData);
    }

    return originalJson(data);
  };

  next();
};
