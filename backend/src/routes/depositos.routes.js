import { Router } from 'express';
import depositosController from '../controllers/depositos.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';
import { uploadFotos } from '../utils/upload.js'; // Reutilizamos configuración de multer
import {
  confirmarIngresoSchema,
  listPendingSchema,
  listInDepositSchema,
  registrarEgresoSchema
} from '../schemas/deposito.schemas.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/depositos/confirmar-ingreso
 * @desc    Confirmar ingreso de vehículo mediante QR
 */
router.post(
  '/confirmar-ingreso',
  validateRequest(confirmarIngresoSchema),
  depositosController.confirmarIngreso
);

/**
 * @route   POST /api/depositos/:id/foto-ingreso
 * @desc    Cargar foto de ingreso al depósito
 */
router.post(
  '/:id/foto-ingreso',
  uploadFotos.single('file'),
  depositosController.uploadFotoIngreso
);

/**
 * @route   GET /api/depositos/pendientes
 * @desc    Listar retenciones pendientes de ingreso
 */
router.get(
  '/pendientes',
  validateRequest(listPendingSchema, 'query'),
  depositosController.getPendientes
);

/**
 * @route   GET /api/depositos/:id
 * @desc    Detalles de un registro en depósito
 */
router.get('/:id', depositosController.getDeposito);

/**
 * @route   GET /api/depositos
 * @desc    Listar vehículos en depósito con filtros
 */
router.get(
  '/',
  validateRequest(listInDepositSchema, 'query'),
  depositosController.listDepositos
);

/**
 * @route   PUT /api/depositos/:id/registrar-egreso
 * @desc    Registrar egreso físico del vehículo
 */
router.put(
  '/:id/registrar-egreso',
  validateRequest(registrarEgresoSchema),
  depositosController.registrarEgreso
);

export default router;
