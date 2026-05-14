import { Router } from 'express';
import causasController from '../controllers/causas.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  buscarCausaSchema, 
  emitirResolucionSchema, 
  cambioExtraordinarioSchema 
} from '../schemas/causa.schemas.js';

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(authenticate);

/**
 * @route   GET /api/causas/buscar
 * @desc    Buscar causas por expediente, dominio o DNI
 */
router.get(
  '/buscar',
  validateRequest(buscarCausaSchema, 'query'),
  causasController.buscarCausas
);

/**
 * @route   GET /api/causas/por-resolver
 * @desc    Listar causas pendientes de resolución
 */
router.get(
  '/por-resolver',
  causasController.getPorResolver
);

/**
 * @route   GET /api/causas/:numero_expediente/historial-completo
 * @desc    Obtener historial completo de un expediente
 */
router.get(
  '/:numero_expediente/historial-completo',
  causasController.getHistorialCompleto
);

/**
 * @route   POST /api/resoluciones
 * @desc    Emitir una resolución judicial (Solo Juez/Fiscal)
 */
router.post(
  '/resoluciones',
  authorize('fiscal_juez', 'admin'),
  validateRequest(emitirResolucionSchema),
  causasController.emitirResolucion
);

/**
 * @route   PUT /api/resoluciones/:id/cambio-extraordinario
 * @desc    Cambio de estado extraordinario por orden judicial
 */
router.put(
  '/resoluciones/:id/cambio-extraordinario',
  authorize('fiscal_juez', 'admin'),
  validateRequest(cambioExtraordinarioSchema),
  causasController.cambioExtraordinario
);

export default router;
