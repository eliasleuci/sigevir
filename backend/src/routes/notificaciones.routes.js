import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificacionesController from '../controllers/notificaciones.controller.js';

const router = Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authenticate);

// Obtener historial de notificaciones
router.get('/', notificacionesController.getNotificaciones);

// Marcar todas como leídas
router.put('/leer-todas', notificacionesController.marcarTodasComoLeidas);

// Marcar una como leída
router.put('/:id/leer', notificacionesController.marcarComoLeida);

export default router;
