import logger from '../utils/logger.js';
import db from '../models/index.js';

function mapAccion(accion, entidad, ruta) {
  if (ruta?.includes('iniciar-tramite')) return 'INICIAR_TRAMITE';
  if (ruta?.includes('egreso')) return 'REGISTRAR_EGRESO';
  if (ruta?.includes('ingreso')) return 'INGRESO_DEPOSITO';
  if (ruta?.includes('resolucion')) return 'RESOLUCION';
  if (accion === 'CREAR' && entidad === 'RETENCION') return 'RETENCION_CREADA';
  if (accion === 'CREAR' && entidad === 'DEPOSITO') return 'INGRESO_DEPOSITO';
  if (accion === 'CREAR' && entidad === 'CAUSA') return 'RESOLUCION';
  return `${accion}_${entidad}`;
}

export const auditLog = (accion, entidad) => (req, res, next) => {
  const inicio = Date.now();
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    const duracion = Date.now() - inicio;
    const exitoso = res.statusCode < 400;

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

      // Persistir registro en la tabla audit_logs de PostgreSQL
      const accionFinal = mapAccion(accion, entidad, req.originalUrl);
      const isUuid = (val) => typeof val === 'string' && val.length === 36 && val.includes('-');
      const usuarioId = isUuid(req.user?.id || req.user?.userId) ? (req.user?.id || req.user?.userId) : null;
      const entidadId = req.params?.id || data?.data?.id || data?.id || null;

      db.sequelize.query(
        `INSERT INTO audit_logs (id, created_at, usuario_id, usuario_email, usuario_nombre, accion, entidad, entidad_id, detalle, ip, origen)
         VALUES (gen_random_uuid(), NOW(), :usuario_id, :usuario_email, :usuario_nombre, :accion, :entidad, :entidad_id, :detalle, :ip, 'web')`,
        {
          replacements: {
            usuario_id: usuarioId,
            usuario_email: req.user?.email || 'contacto@sigevir.com.ar',
            usuario_nombre: req.user?.nombre_completo || req.user?.email || 'Usuario SIGEVIR',
            accion: accionFinal,
            entidad: entidad?.toLowerCase() || 'sistema',
            entidad_id: isUuid(entidadId) ? entidadId : null,
            detalle: JSON.stringify({
              metodo: req.method,
              ruta: req.originalUrl,
              nro_expediente: req.body?.numero_expediente || req.body?.nro_expediente || data?.data?.nro_expediente || null,
              dominio: req.body?.dominio || data?.data?.dominio || null
            }),
            ip: req.ip || req.connection?.remoteAddress || '127.0.0.1'
          }
        }
      ).catch(err => logger.error(`Error al guardar audit_log en DB: ${err.message}`));
    } else {
      logger.warn('AUDIT_FALLO', logData);
    }

    return originalJson(data);
  };

  next();
};

