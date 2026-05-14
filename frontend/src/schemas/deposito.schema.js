import { z } from 'zod';

export const confirmarIngresoSchema = z.object({
  sector: z.string().min(1, 'El sector es requerido'),
  fila: z.string().min(1, 'La fila es requerida'),
  numero_espacio: z.string().min(1, 'El número de espacio es requerido'),
  responsable_id: z.string().uuid('Debe seleccionar un responsable'),
  institucion_id: z.string().uuid().optional(),
  observaciones: z.string().optional(),
});

export const registrarEgresoSchema = z.object({
  razon_egreso: z.string().min(5, 'Debe indicar el motivo del egreso'),
  tipo_egreso: z.enum(['LIBERACION', 'TRASLADO', 'SUBASTA', 'COMPACTACION', 'OTRO'], {
    message: 'Tipo de egreso inválido',
  }),
  documento_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  observaciones: z.string().optional(),
});

export const updateUbicacionSchema = z.object({
  sector: z.string().min(1),
  fila: z.string().min(1),
  numero_espacio: z.string().min(1),
});
