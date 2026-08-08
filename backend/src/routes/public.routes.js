import { Router } from 'express';
import publicController from '../controllers/public.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Límite de peticiones para prevenir fuerza bruta o scraping
const publicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // limite de 10 consultas por IP por cada 5 minutos
  message: { success: false, error: 'Demasiadas consultas desde esta IP, por favor intente nuevamente más tarde.' }
});

router.get('/consulta-vehiculo/:dominio', publicLimiter, publicController.consultaVehiculo);

export default router;
