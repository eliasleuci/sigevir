import { Router } from 'express';
import reportesController from '../controllers/reportes.controller.js';
import { authenticate } from '../middleware/supabaseAuth.js';

const router = Router();

router.use(authenticate);

router.get('/', reportesController.getEstadisticas);

export default router;
