import { Router } from 'express';
import institucionesController from '../controllers/instituciones.controller.js';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);
// Y autorización de administrador
router.use(authorize('admin'));

router.get('/', institucionesController.listarInstituciones);
router.get('/:id', institucionesController.obtenerInstitucion);
router.post('/', institucionesController.crearInstitucion);
router.put('/:id', institucionesController.editarInstitucion);
router.delete('/:id', institucionesController.eliminarInstitucion);

export default router;
