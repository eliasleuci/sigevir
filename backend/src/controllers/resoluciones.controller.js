import Joi from 'joi';
import db from '../models/index.js';
import logger from '../utils/logger.js';
import socketService from '../services/socketService.js';
import emailService from '../services/emailService.js';

const { ResolucionJudicial, Retencion, Deposito, Usuario } = db;

/**
 * Validación del payload de creación de resolución judicial.
 */
const crearResolucionSchema = Joi.object({
  numero_expediente: Joi.string().required(),
  tipo: Joi.string()
    .valid('LIBERACION', 'SUBASTA', 'COMPACTACION')
    .required(),
  observaciones: Joi.string().allow('', null),
  documento_url: Joi.string().uri().required()
});

/**
 * Crea una resolución judicial y notifica al responsable del depósito.
 *
 * 1️⃣ Validamos el cuerpo con Joi.
 * 2️⃣ Verificamos que la retención exista y esté en estado "en_deposito".
 * 3️⃣ Persistimos la resolución en la tabla `resoluciones_judiciales`.
 * 4️⃣ Cambiamos el estado de la retención a "resolucion_pendiente".
 * 5️⃣ Recuperamos el `responsable_id` del depósito asociado.
 * 6️⃣ Emitimos la notificación en tiempo real usando `socketService.broadcastNotification`.
 */
export const crearResolucion = async (req, res, next) => {
  try {
    // 1️⃣ Validación del payload
    const { error, value } = crearResolucionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    const { numero_expediente, tipo, observaciones, documento_url } = value;

    // 2️⃣ Buscar la retención y validar estado
    const retencion = await Retencion.findOne({ where: { numero_expediente } });
    if (!retencion) {
      return res.status(404).json({ success: false, error: 'Retención no encontrada' });
    }
    if (retencion.estado_actual !== 'en_deposito') {
      return res.status(400).json({
        success: false,
        error: `La retención debe estar en estado "en_deposito" para emitir una resolución (actual: ${retencion.estado_actual})`
      });
    }

    // 3️⃣ Persistir la resolución
    const resolucion = await ResolucionJudicial.create({
      retencion_id: retencion.id,
      usuario_judicial_id: req.user.id, // El middleware auth coloca el usuario en req.user
      tipo,
      observaciones,
      documento_url,
      fecha_emision: new Date()
    });

    // 4️⃣ Actualizar estado de la retención
    await retencion.update({ estado_actual: 'resolucion_pendiente' });

    // 5️⃣ Obtener responsable del depósito (si ya está creado)
    const deposito = await Deposito.findOne({ where: { retencion_id: retencion.id } });
    const responsableId = deposito ? deposito.responsable_id : null;

    // 6️⃣ Notificación en tiempo real
    if (responsableId) {
      const notificacion = {
        tipo: 'RESOLUCION_JUDICIAL',
        mensaje: `Se ha emitido una resolución (${tipo.toLowerCase()}) para el expediente ${numero_expediente}`,
        retencion_id: retencion.id,
        numero_expediente,
        documento_url
      };
      const notificacionCreada = await socketService.broadcastNotification(responsableId, notificacion);

      // 7️⃣ Enviar email al responsable del depósito
      try {
        const responsable = await Usuario.findByPk(responsableId);
        if (responsable && responsable.email) {
          const vehiculo = await db.Vehiculo.findByPk(retencion.vehiculo_id);
          await emailService.sendResolucionJudicial(
            responsable.email,
            {
              nombre_responsable: responsable.nombre_completo,
              numero_expediente,
              dominio: vehiculo?.dominio || 'N/D',
              tipo_resolucion: tipo === 'LIBERACION' ? 'Liberación' : tipo === 'SUBASTA' ? 'Subasta' : 'Compactación',
              fecha_emision: new Date().toISOString(),
            },
            notificacionCreada?.id || null
          );
        }
      } catch (emailError) {
        logger.error(`Error enviando email de resolución a responsable ${responsableId}: ${emailError.message}`);
      }
    } else {
      logger.warn(`No se encontró responsable de depósito para la retención ${retencion.id}`);
    }

    // Respuesta al cliente
    return res.status(201).json({
      id: resolucion.id,
      numero_expediente,
      tipo: resolucion.tipo,
      observaciones: resolucion.observaciones,
      documento_url: resolucion.documento_url,
      fecha_emision: resolucion.fecha_emision,
      estado_actual: retencion.estado_actual
    });
  } catch (err) {
    logger.error('Error en crearResolucion:', err);
    next(err);
  }
};

/**
 * Obtiene la resolución asociada a un número de expediente.
 */
export const obtenerResolucion = async (req, res, next) => {
  try {
    const { numero_expediente } = req.params;
    const retencion = await Retencion.findOne({ where: { numero_expediente } });
    if (!retencion) {
      return res.status(404).json({ success: false, error: 'Retención no encontrada' });
    }
    const resolucion = await ResolucionJudicial.findOne({ where: { retencion_id: retencion.id } });
    if (!resolucion) {
      return res.status(404).json({ success: false, error: 'Resolución no encontrada' });
    }
    return res.json({
      id: resolucion.id,
      numero_expediente,
      tipo: resolucion.tipo,
      observaciones: resolucion.observaciones,
      documento_url: resolucion.documento_url,
      fecha_emision: resolucion.fecha_emision
    });
  } catch (err) {
    logger.error('Error en obtenerResolucion:', err);
    next(err);
  }
};
