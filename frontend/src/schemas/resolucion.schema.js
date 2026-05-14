import { z } from 'zod';

export const createResolucionSchema = z.object({
  numero_expediente: z.string().min(1, 'El número de expediente es requerido'),
  tipo: z.enum(['LIBERACION', 'SUBASTA', 'COMPACTACION'], {
    message: 'Tipo de resolución inválido',
  }),
  observaciones: z.string().min(10, 'Las observaciones deben tener al menos 10 caracteres'),
  documento_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});
