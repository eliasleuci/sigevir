import { Router } from 'express';
import causasController from '../controllers/causas.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import { 
  buscarCausaSchema, 
  emitirResolucionSchema, 
  cambioExtraordinarioSchema 
} from '../schemas/causa.schemas.js';

const router = Router();

router.use(authenticate);

router.get(
  '/buscar',
  validateRequest(buscarCausaSchema, 'query'),
  causasController.buscarCausas
);

router.get(
  '/por-resolver',
  causasController.getPorResolver
);

router.get(
  '/:numero_expediente/historial-completo',
  causasController.getHistorialCompleto
);

router.post(
  '/resoluciones',
  authorize('FISCAL_JUEZ', 'ADMIN_GENERAL', 'ADMIN_INSTITUCION'),
  validateRequest(emitirResolucionSchema),
  causasController.emitirResolucion
);

router.put(
  '/resoluciones/:id/cambio-extraordinario',
  authorize('FISCAL_JUEZ', 'ADMIN_GENERAL', 'ADMIN_INSTITUCION'),
  validateRequest(cambioExtraordinarioSchema),
  causasController.cambioExtraordinario
);

export default router;
