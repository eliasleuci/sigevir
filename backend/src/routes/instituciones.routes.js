import { Router } from 'express';
import institucionesController from '../controllers/instituciones.controller.js';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import { auditLog } from '../middleware/auditLog.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);
// Y autorización de administrador
router.get('/judiciales', institucionesController.listarJudiciales);

router.use(authorize('admin'));

router.get('/', institucionesController.listarInstituciones);
router.get('/:id', institucionesController.obtenerInstitucion);
router.post('/', auditLog('CREAR', 'INSTITUCION'), institucionesController.crearInstitucion);
router.put('/:id', auditLog('MODIFICAR', 'INSTITUCION'), institucionesController.editarInstitucion);
router.delete('/:id', auditLog('ELIMINAR', 'INSTITUCION'), institucionesController.eliminarInstitucion);

export default router;
