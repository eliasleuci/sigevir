import { Router } from 'express';
import { authenticate } from '../middleware/supabaseAuth.js';
import { getDepositosCercanos } from '../controllers/depositosDisponibles.controller.js';

const router = Router();

router.get('/cercanos', authenticate, getDepositosCercanos);

export default router;
