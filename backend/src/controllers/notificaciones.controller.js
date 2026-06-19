import db from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';

const { Notificacion, Retencion } = db;

/**
 * Obtener notificaciones del usuario autenticado
 * @route GET /api/notificaciones
 */
export const getNotificaciones = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const soloNoLeidas = req.query.unread === 'true';

    const where = { destinatario_id: req.user.id };
    if (soloNoLeidas) {
      where.leida_at = null;
    }

    const notificaciones = await Notificacion.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Retencion,
          as: 'retencion',
          attributes: ['id', 'dominio', 'estado_actual']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        notificaciones: notificaciones.rows,
        total: notificaciones.count,
        limit,
        offset,
        unreadCount: await Notificacion.count({ where: { destinatario_id: req.user.id, leida_at: null } })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar una notificación específica como leída
 * @route PUT /api/notificaciones/:id/leer
 */
export const marcarComoLeida = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findOne({
      where: { id, destinatario_id: req.user.id }
    });

    if (!notificacion) {
      throw new ApiError(404, 'Notificación no encontrada');
    }

    if (!notificacion.leida_at) {
      notificacion.leida_at = new Date();
      await notificacion.save();
    }

    res.status(200).json({
      status: 'success',
      data: { notificacion }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar todas las notificaciones del usuario como leídas
 * @route PUT /api/notificaciones/leer-todas
 */
export const marcarTodasComoLeidas = async (req, res, next) => {
  try {
    await Notificacion.update(
      { leida_at: new Date() },
      {
        where: {
          destinatario_id: req.user.id,
          leida_at: null
        }
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    next(error);
  }
};
