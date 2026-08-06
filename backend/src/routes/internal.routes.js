import { Router } from 'express';
import { notificarVehiculoEnCamino } from '../services/notificacionService.js';
import db from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

const router = Router();

// Middleware de seguridad para la API interna (comparación en tiempo constante para evitar timing attacks)
const internalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    throw new AppError('Falta header Authorization', 401);
  }
  
  const token = authHeader.replace('Bearer ', '');
  const secret = process.env.INTERNAL_API_SECRET || '';

  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);

  // timingSafeEqual requiere buffers del mismo largo, si no, ya es inválido
  const esValido =
    tokenBuffer.length === secretBuffer.length &&
    crypto.timingSafeEqual(tokenBuffer, secretBuffer);

  if (!esValido) {
    logger.warn('Intento de acceso a API interna con secret inválido');
    throw new AppError('Secret inválido', 403);
  }
  
  next();
};

router.use(internalAuth);

/**
 * POST /api/internal/notificar-vehiculo-en-camino
 * Disparado por la Edge Function para notificar vía WebSockets al depósito
 */
router.post('/notificar-vehiculo-en-camino', async (req, res, next) => {
  try {
    const { retencion_id, deposito_institucion_id, agente_nombre } = req.body;

    if (!retencion_id || !deposito_institucion_id) {
      return res.status(400).json({ error: 'retencion_id y deposito_institucion_id son obligatorios' });
    }

    const retencion = await db.Retencion.findByPk(retencion_id);
    if (!retencion) {
      return res.status(404).json({ error: 'Retención no encontrada' });
    }

    const depositoInstitucion = await db.DepositoInstitucion.findByPk(deposito_institucion_id);
    if (!depositoInstitucion) {
      return res.status(404).json({ error: 'Depósito no encontrado' });
    }

    // Disparar la notificación asíncrona
    notificarVehiculoEnCamino(retencion, depositoInstitucion, agente_nombre || 'Agente de Campo')
      .catch(err => logger.error(`Error notificando vehículo en camino desde internal API: ${err.message}`));

    res.json({ success: true, message: 'Notificación disparada' });
  } catch (error) {
    next(error);
  }
});

export default router;
