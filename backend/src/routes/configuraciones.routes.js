import { Router } from 'express';
import configuracionesController from '../controllers/configuraciones.controller.js';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import { auditLog } from '../middleware/auditLog.js';

const router = Router();

// Todas las rutas de configuración requieren ser admin
router.use(authenticate);
router.use(authorize('admin'));

// Obtener todas las configuraciones
router.get('/', configuracionesController.getAll);

// Obtener una específica
router.get('/:clave', configuracionesController.getByClave);

// Actualizar configuraciones en bloque
router.put('/', auditLog('MODIFICACION', 'CONFIGURACION'), configuracionesController.updateMultiple);

// Crear nueva configuración
router.post('/', auditLog('CREACION', 'CONFIGURACION'), configuracionesController.create);

// Modificar estructura de una configuración existente
router.put('/:id', auditLog('MODIFICACION', 'CONFIGURACION'), configuracionesController.update);

// Eliminar configuración
router.delete('/:id', auditLog('ELIMINACION', 'CONFIGURACION'), configuracionesController.delete);

export default router;
