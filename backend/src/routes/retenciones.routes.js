import { Router } from 'express';
import retencionesController from '../controllers/retenciones.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createRetencionSchema, updateRetencionSchema } from '../schemas/retencion.schemas.js';
import { authenticate } from '../middleware/supabaseAuth.js';
import { uploadFotos } from '../utils/upload.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validateRequest(createRetencionSchema),
  retencionesController.createRetencion
);

router.post(
  '/:id/fotos',
  uploadFotos.array('files', 20),
  retencionesController.uploadFotos
);

router.get(
  '/',
  retencionesController.listRetenciones
);

router.get(
  '/:id',
  retencionesController.getRetencion
);

router.put(
  '/:id',
  validateRequest(updateRetencionSchema),
  retencionesController.updateRetencion
);

export default router;
