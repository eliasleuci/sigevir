import { Router } from 'express';
import depositosController from '../controllers/depositos.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/supabaseAuth.js';
import { uploadFotos } from '../utils/upload.js';
import { auditLog } from '../middleware/auditLog.js';
import {
  confirmarIngresoSchema,
  listPendingSchema,
  listInDepositSchema,
  registrarEgresoSchema,
  iniciarTramiteSchema
} from '../schemas/deposito.schemas.js';

const router = Router();

router.use(authenticate);

// The frontend calls POST /api/depositos/:id/ingreso with multipart/form-data
router.post('/:id/ingreso', auditLog('CREAR', 'DEPOSITO'), uploadFotos.array('fotos'), depositosController.confirmarIngreso);

router.post('/:id/foto-ingreso', auditLog('MODIFICAR', 'DEPOSITO'), uploadFotos.single('file'), depositosController.uploadFotoIngreso);

router.get('/pendientes', validateRequest(listPendingSchema, 'query'), depositosController.getPendientes);

router.get('/pendientes-tramite', depositosController.getPendientesTramite);

router.post('/:id/iniciar-tramite', auditLog('MODIFICAR', 'DEPOSITO'), validateRequest(iniciarTramiteSchema), depositosController.iniciarTramite);

router.get('/pendientes-egreso', depositosController.getPendientesEgreso);


router.get('/:id', depositosController.getDeposito);

router.get('/', validateRequest(listInDepositSchema, 'query'), depositosController.listDepositos);

router.put('/:id/registrar-egreso', auditLog('MODIFICAR', 'DEPOSITO'), validateRequest(registrarEgresoSchema), depositosController.registrarEgreso);

router.post('/:id/egreso', auditLog('MODIFICAR', 'DEPOSITO'), validateRequest(registrarEgresoSchema), depositosController.registrarEgreso);

router.get('/:id/constancia-entrega', depositosController.getConstanciaEntrega);

export default router;


