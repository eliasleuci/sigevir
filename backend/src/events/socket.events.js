import db from '../models/index.js';
import logger from '../utils/logger.js';
import socketService from '../services/socketService.js';

const { Notificacion, HistorialMovimiento } = db;

export const registerSocketEvents = (io, socket) => {
  const userId = socket.user.userId;

  // 1. Unir al usuario a su sala personal
  socket.join(`user_${userId}`);
  logger.info(`Socket conectado: ${socket.id} unido a sala user_${userId}`);

  // 2. Enviar notificaciones pendientes (Backfill)
  const sendPendingNotifications = async () => {
    try {
      const pendientes = await Notificacion.findAll({
        where: {
          usuario_id: userId,
          leida_at: null
        },
        order: [['createdAt', 'DESC']],
        limit: 50 // Límite razonable para backfill
      });

      if (pendientes.length > 0) {
        socket.emit('notificaciones_pendientes', pendientes);
      }
    } catch (error) {
      logger.error(`Error obteniendo notificaciones pendientes para ${userId}: ${error.message}`);
    }
  };

  sendPendingNotifications();

  // 3. Evento 'leer_notificacion'
  socket.on('leer_notificacion', async (data) => {
    try {
      const { notificacion_id } = data;
      const notif = await Notificacion.findOne({
        where: { id: notificacion_id, usuario_id: userId }
      });

      if (notif) {
        await notif.update({ leida_at: new Date() });
        // Informar a otros posibles clientes/pestañas del mismo usuario
        socket.to(`user_${userId}`).emit('notificacion_actualizada', {
          id: notificacion_id,
          estado: 'leida'
        });
      }
    } catch (error) {
      logger.error(`Error marcando notificación como leída: ${error.message}`);
    }
  });

  // 4. Evento 'confirmar_notificacion'
  socket.on('confirmar_notificacion', async (data) => {
    try {
      const { notificacion_id } = data;
      const notif = await Notificacion.findOne({
        where: { id: notificacion_id, usuario_id: userId }
      });

      if (notif) {
        await notif.update({ 
          confirmada_at: new Date(),
          leida_at: notif.leida_at || new Date() // Si confirma, implícitamente la leyó
        });

        // Registrar en historial si aplica
        if (notif.retencion_id) {
          await HistorialMovimiento.create({
            retencion_id: notif.retencion_id,
            usuario_id: userId,
            tipo_movimiento: 'NOTIFICACION_CONFIRMADA',
            observaciones: `Notificación confirmada: ${notif.mensaje}`
          });
        }

        socket.to(`user_${userId}`).emit('notificacion_actualizada', {
          id: notificacion_id,
          estado: 'confirmada'
        });
        
        // Responder al emisor para que actualice su UI localmente
        socket.emit('notificacion_actualizada', {
          id: notificacion_id,
          estado: 'confirmada'
        });
      }
    } catch (error) {
      logger.error(`Error confirmando notificación: ${error.message}`);
    }
  });

  // 5. Desconexión
  socket.on('disconnect', () => {
    logger.info(`Socket desconectado: ${socket.id} de la sala user_${userId}`);
    // No hay limpieza especial requerida ya que socket.io maneja las salas por defecto al desconectar
  });
};
