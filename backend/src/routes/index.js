import { Router } from 'express';
import authRoutes from './authRoutes.js';
import retencionesRoutes from './retenciones.routes.js';
import depositosRoutes from './depositos.routes.js';
import busquedaRoutes from './busqueda.routes.js';
import causasRoutes from './causas.routes.js';
import notificacionesRoutes from './notificaciones.routes.js';
import adminRoutes from './admin.routes.js';
import tiposPersonalRoutes from './tiposPersonal.routes.js';
import reportesRoutes from './reportes.routes.js';
import depositosDisponiblesRoutes from './depositosDisponibles.routes.js';
import internalRoutes from './internal.routes.js';
import institucionesRoutes from './instituciones.routes.js';
import configuracionesRoutes from './configuraciones.routes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas internas
router.use('/internal', internalRoutes);

// Rutas de tipos de personal (catálogo de roles)
router.use('/tipos-personal', tiposPersonalRoutes);

// Rutas de instituciones
router.use('/instituciones', institucionesRoutes);

// Rutas de reportes y estadisticas
router.use('/reportes', reportesRoutes);

// Rutas del módulo de registro de retenciones
router.use('/retenciones', retencionesRoutes);

// Rutas del módulo de gestión de depósitos
router.use('/depositos', depositosRoutes);
router.use('/depositos-disponibles', depositosDisponiblesRoutes);

// Rutas del módulo de búsqueda avanzada
router.use('/busqueda', busquedaRoutes);

// Rutas del módulo judicial (causas y resoluciones)
router.use('/causas', causasRoutes);

// Rutas del módulo de notificaciones
router.use('/notificaciones', notificacionesRoutes);

// Rutas de administración (protegidas por RBAC)
router.use('/admin', adminRoutes);

// Rutas de configuracion global del sistema (protegidas)
router.use('/configuraciones', configuracionesRoutes);

export default router;
