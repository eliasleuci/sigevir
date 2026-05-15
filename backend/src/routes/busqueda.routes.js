import { Router } from 'express';
import busquedaController from '../controllers/busqueda.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/supabaseAuth.js';
import { busquedaAvanzadaSchema } from '../schemas/busqueda.schemas.js';

const router = Router();

router.use(authenticate);

router.post(
  '/avanzada',
  validateRequest(busquedaAvanzadaSchema),
  busquedaController.busquedaAvanzada
);

export default router;
