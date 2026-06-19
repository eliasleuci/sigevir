import { Router } from 'express';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import checkPermanenciaProlongada from '../jobs/checkPermanenciaProlongada.js';
import db from '../models/index.js';
import logger from '../utils/logger.js';
import { auditLog } from '../middleware/auditLog.js';

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