import { Router } from 'express';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import checkPermanenciaProlongada from '../jobs/checkPermanenciaProlongada.js';
import db from '../models/index.js';
import logger from '../utils/logger.js';
import { auditLog } from '../middleware/auditLog.js';
import { supabaseAdmin } from '../config/supabase.js';

const { Usuario, HistorialMovimiento } = db;
const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'ADMIN_INSTITUCION'));

router.get('/check-permanencias', auditLog('MODIFICAR', 'ADMIN'), async (req, res, next) => {
  try {
    const resultado = await checkPermanenciaProlongada.execute();
    res.status(200).json({ success: true, data: resultado });
  } catch (error) {
    logger.error(`Error en trigger manual de check-permanencias: ${error?.message}`);
    next(error);
  }
});

router.get('/usuarios', async (req, res, next) => {
  try {
    const { institucion_id, activo, rol } = req.query;
    const where = {};
    if (institucion_id) where.institucion_id = institucion_id;
    if (activo !== undefined) where.activo = activo === 'true';
    if (rol) where.rol = rol;

    if (req.user.role !== 'admin' && req.user.institucion_id) {
      where.institucion_id = req.user.institucion_id;
    }

    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['nombre_completo', 'ASC']],
    });

    res.status(200).json({ success: true, data: usuarios });
  } catch (error) {
    next(error);
  }
});

// Eliminar / Rechazar usuario (solo admin)
router.delete('/usuarios/:id', auditLog('ELIMINAR', 'USUARIO'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Obtener email del usuario antes de eliminarlo para mandarle correo
    const usuarioABorrar = await Usuario.findByPk(id);

    // 1. Eliminar de auth.users usando PostgreSQL directamente para evitar errores de GoTrue
    await db.sequelize.query(`DELETE FROM auth.users WHERE id = :id`, {
      replacements: { id },
      type: db.sequelize.QueryTypes.DELETE
    });
    
    // 2. Eliminar de la tabla perfiles (por si falla el CASCADE o no hay Supabase)
    await Usuario.destroy({ where: { id } });

    // Enviar email de rechazo si se encontró el correo
    if (usuarioABorrar && usuarioABorrar.email) {
      try {
        await emailService.sendAccountRejected(usuarioABorrar.email, usuarioABorrar.nombre_completo);
        logger.info(`Email de rechazo enviado a ${usuarioABorrar.email}`);
      } catch (err) {
        logger.error(`Error enviando email de rechazo: ${err.message}`);
      }
    }

    res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    logger.error(`Error al eliminar usuario ${req.params.id}: ${error?.message}`);
    next(error);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, tipo_movimiento } = req.query;
    const where = {};
    if (tipo_movimiento) where.tipo_movimiento = tipo_movimiento;

    const logs = await HistorialMovimiento.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['fecha_hora', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        items: logs.rows,
        total: logs.count,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;