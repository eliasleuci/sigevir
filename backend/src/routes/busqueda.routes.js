import { Router } from 'express';
import busquedaController from '../controllers/busqueda.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';
import { busquedaAvanzadaSchema } from '../schemas/busqueda.schemas.js';

const router = Router();

// Todas las rutas de búsqueda requieren estar autenticado
router.use(authenticate);

/**
 * @route   POST /api/busqueda/avanzada
 * @desc    Búsqueda multicriterio avanzada de vehículos y retenciones
 * @access  Private
 */
router.post(
  '/avanzada',
  validateRequest(busquedaAvanzadaSchema),
  busquedaController.busquedaAvanzada
);

export default router;
