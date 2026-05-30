import { Router } from 'express';
import depositosController from '../controllers/depositos.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/supabaseAuth.js';
import { uploadFotos } from '../utils/upload.js';
import {
  confirmarIngresoSchema,
  listPendingSchema,
  listInDepositSchema,
  registrarEgresoSchema,
  iniciarTramiteSchema
} from '../schemas/deposito.schemas.js';

const router = Router();

router.use(authenticate);

router.post('/confirmar-ingreso', validateRequest(confirmarIngresoSchema), depositosController.confirmarIngreso);

router.post('/:id/foto-ingreso', uploadFotos.single('file'), depositosController.uploadFotoIngreso);

router.get('/pendientes', validateRequest(listPendingSchema, 'query'), depositosController.getPendientes);

router.get('/pendientes-tramite', depositosController.getPendientesTramite);

router.post('/:id/iniciar-tramite', validateRequest(iniciarTramiteSchema), depositosController.iniciarTramite);

router.get('/pendientes-egreso', depositosController.getPendientesEgreso);


router.get('/:id', depositosController.getDeposito);

router.get('/', validateRequest(listInDepositSchema, 'query'), depositosController.listDepositos);

router.put('/:id/registrar-egreso', validateRequest(registrarEgresoSchema), depositosController.registrarEgreso);

router.post('/:id/egreso', validateRequest(registrarEgresoSchema), depositosController.registrarEgreso);

router.get('/:id/constancia-entrega', depositosController.getConstanciaEntrega);

export default router;


