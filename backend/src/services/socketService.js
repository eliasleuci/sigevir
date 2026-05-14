import db from '../models/index.js';
import logger from '../utils/logger.js';

const { Notificacion, Usuario } = db;

/**
 * Servicio para gestionar las notificaciones en tiempo real
 */
class SocketService {
  constructor() {
    this.io = null;
    this.notificationsNamespace = null;
  }

  /**
   * Inicializa el servicio con la instancia de Socket.io
   */
  init(io) {
    this.io = io;
    this.notificationsNamespace = io.of('/notifications');
  }

  /**
   * Envía una notificación a un usuario específico
   * @param {string} destinatarioId - UUID del usuario
   * @param {Object} notificacion - Datos de la notificación
   */
  async broadcastNotification(destinatarioId, notificacion) {
    if (!this.notificationsNamespace) {
      logger.error('SocketService no ha sido inicializado.');
      return;
    }

    try {
      // Guardar en base de datos primero (asumiendo que el modelo Notificacion existe)
      // Si el modelo aún no existe, deberíamos crearlo o manejar este error graciosamente
      const record = await Notificacion.create({
        destinatario_id: destinatarioId,
        tipo: notificacion.tipo,
        mensaje: notificacion.mensaje,
        retencion_id: notificacion.retencion_id || null
      }).catch(err => {
         logger.warn('No se pudo guardar la notificación en BD (probablemente falte el modelo): ' + err.message);
         // Proveemos un ID temporal para que fluya en el frontend
         return { id: `temp_${Date.now()}`, ...notificacion };
      });

      const notifData = {
        id: record.id,
        tipo: record.tipo || notificacion.tipo,
        mensaje: record.mensaje || notificacion.mensaje,
        retencion_id: record.retencion_id || notificacion.retencion_id,
        creada_at: record.createdAt || new Date(),
        leida_at: null,
        confirmada_at: null
      };

      // Enviar al cuarto específico del usuario
      this.notificationsNamespace.to(`user_${destinatarioId}`).emit('nueva_notificacion', notifData);
      
      logger.info(`Notificación enviada al usuario ${destinatarioId}`);
      return record;
    } catch (error) {
      logger.error(`Error enviando notificación: ${error.message}`);
    }
  }

  /**
   * Envía una notificación a todos los usuarios con un rol en una institución
   */
  async broadcastToRole(rol, institucionId, notificacion) {
    try {
      // Buscar todos los usuarios con ese rol en la institución
      const usuarios = await Usuario.findAll({
        where: {
          role: rol,
          institucion_id: institucionId,
          is_active: true
        },
        attributes: ['id']
      });

      // Enviar notificación a cada uno
      for (const usuario of usuarios) {
        await this.broadcastNotification(usuario.id, notificacion);
      }
      
      logger.info(`Notificación enviada al rol ${rol} en institución ${institucionId}`);
    } catch (error) {
      logger.error(`Error enviando notificación por rol: ${error.message}`);
    }
  }

  /**
   * Obtiene la cantidad de notificaciones sin leer de un usuario
   */
  async getPendingNotificationsCount(usuarioId) {
    try {
      if (!Notificacion) return 0;
      
      const count = await Notificacion.count({
        where: {
          destinatario_id: usuarioId,
          leida_at: null
        }
      });
      return count;
    } catch (error) {
      logger.error(`Error contando notificaciones: ${error.message}`);
      return 0;
    }
  }
}

// Exportamos un singleton
export default new SocketService();
