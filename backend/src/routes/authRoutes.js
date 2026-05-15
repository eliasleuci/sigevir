import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema } from '../schemas/auth.schemas.js';
import { authenticate } from '../middleware/supabaseAuth.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

export default router;
