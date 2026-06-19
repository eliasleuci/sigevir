import db from '../models/index.js';
import logger from '../utils/logger.js';
import socketService from '../services/socketService.js';

const { Notificacion, HistorialMovimiento } = db;

export const registerSocketEvents = (io, socket) => {
  const userId = socket.user.userId;

  // 1. Unir al usuario a su sala personal
  socket.join(`user_${userId}`);
  logger.info(`Socket conectado: ${socket.id} → sala user_${userId}`);

  // 2. Backfill: enviar notificaciones no leídas al conectarse
  (async () => {
    try {
      const pendientes = await Notificacion.findAll({
        where: {
          destinatario_id: userId,  // ← CORREGIDO
          leida_at: null,
        },
        order: [['createdAt', 'DESC']],
        limit: 50,
        include: [{
          model: db.Retencion,
          as: 'retencion',
          attributes: ['id', 'dominio', 'estado_actual'],
          required: false,
        }],
      });

      if (pendientes.length > 0) {
        socket.emit('notificaciones_pendientes', pendientes);
        logger.info(`Backfill: ${pendientes.length} notificaciones enviadas a ${userId}`);
      }
    } catch (error) {
      logger.error(`Error en backfill para ${userId}: ${error.message}`);
    }
  })();

  // 3. Marcar como leída
  socket.on('leer_notificacion', async ({ notificacion_id }) => {
    try {
      const notif = await Notificacion.findOne({
        where: { id: notificacion_id, destinatario_id: userId }, // ← CORREGIDO
      });
      if (notif && !notif.leida_at) {
        await notif.update({ leida_at: new Date() });
        socket.to(`user_${userId}`).emit('notificacion_actualizada', {
          id: notificacion_id, estado: 'leida',
        });
      }
    } catch (error) {
      logger.error(`Error marcando leída: ${error.message}`);
    }
  });

  // 4. Confirmar notificación
  socket.on('confirmar_notificacion', async ({ notificacion_id }) => {
    try {
      const notif = await Notificacion.findOne({
        where: { id: notificacion_id, destinatario_id: userId }, // ← CORREGIDO
      });
      if (notif) {
        await notif.update({
          confirmada_at: new Date(),
          leida_at: notif.leida_at || new Date(),
        });

        if (notif.retencion_id) {
          await HistorialMovimiento.create({
            retencion_id: notif.retencion_id,
            usuario_id: userId,
            tipo_movimiento: 'NOTIFICACION_CONFIRMADA',
            observaciones: `Notificación confirmada: ${notif.tipo}`,
          }).catch(() => {}); // No fallar si historial no existe aún
        }

        const update = { id: notificacion_id, estado: 'confirmada' };
        socket.emit('notificacion_actualizada', update);
        socket.to(`user_${userId}`).emit('notificacion_actualizada', update);
      }
    } catch (error) {
      logger.error(`Error confirmando notificación: ${error.message}`);
    }
  });

  // 5. Desconexión
  socket.on('disconnect', () => {
    logger.info(`Socket desconectado: ${socket.id} de user_${userId}`);
  });
};
