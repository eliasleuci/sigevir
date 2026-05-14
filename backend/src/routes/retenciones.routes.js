import { Router } from 'express';
import retencionesController from '../controllers/retenciones.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createRetencionSchema, updateRetencionSchema } from '../schemas/retencion.schemas.js';
import { authenticate } from '../middleware/auth.js';
import { uploadFotos } from '../utils/upload.js';

const router = Router();

// Todas las rutas de retenciones requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/retenciones
 * @desc    Crear una nueva retención de vehículo
 * @access  Private (agente_campo, admin)
 */
router.post(
  '/',
  validateRequest(createRetencionSchema),
  retencionesController.createRetencion
);

/**
 * @route   POST /api/retenciones/:id/fotos
 * @desc    Cargar fotos asociadas a una retención (4-20 archivos)
 * @access  Private (agente_campo de la misma institución, admin)
 */
router.post(
  '/:id/fotos',
  uploadFotos.array('files', 20),
  retencionesController.uploadFotos
);

/**
 * @route   GET /api/retenciones
 * @desc    Listar retenciones con filtros y paginación
 * @access  Private (todos los roles autenticados, filtrado por permisos)
 */
router.get(
  '/',
  retencionesController.listRetenciones
);

/**
 * @route   GET /api/retenciones/:id
 * @desc    Obtener detalle completo de una retención
 * @access  Private (todos los roles, filtrado por permisos)
 */
router.get(
  '/:id',
  retencionesController.getRetencion
);

/**
 * @route   PUT /api/retenciones/:id
 * @desc    Editar una retención (solo si estado = RETENIDO)
 * @access  Private (admin, agente creador)
 */
router.put(
  '/:id',
  validateRequest(updateRetencionSchema),
  retencionesController.updateRetencion
);

export default router;
