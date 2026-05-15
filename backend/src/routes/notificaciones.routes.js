import { Router } from 'express';
import { authenticate } from '../middleware/supabaseAuth.js';
import * as notificacionesController from '../controllers/notificaciones.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', notificacionesController.getNotificaciones);
router.put('/leer-todas', notificacionesController.marcarTodasComoLeidas);
router.put('/:id/leer', notificacionesController.marcarComoLeida);

export default router;
