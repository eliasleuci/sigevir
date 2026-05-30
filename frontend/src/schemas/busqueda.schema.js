import { z } from 'zod';

export const busquedaRapidaSchema = z.object({
  q: z.string().min(2, 'Ingrese al menos 2 caracteres'),
});

export const busquedaAvanzadaSchema = z.object({
  dominio: z.string().max(9).optional().or(z.literal('')),
  numero_expediente: z.string().optional().or(z.literal('')),
  tipo_vehiculo: z.enum(['AUTO', 'MOTO', 'CAMION', 'PICKUP', 'OTRO']).optional().or(z.literal('')),
  marca: z.string().optional().or(z.literal('')),
  modelo: z.string().optional().or(z.literal('')),
  estado_actual: z.enum([
    'RETENIDO', 'EN_DEPOSITO', 'RESOLUCION_PENDIENTE', 'EN_TRAMITE', 'LIBERADO', 'SUBASTADO', 'COMPACTADO',
  ]).optional().or(z.literal('')),
  fecha_desde: z.string().optional().or(z.literal('')),
  fecha_hasta: z.string().optional().or(z.literal('')),
  institucion_id: z.string().uuid().optional().or(z.literal('')),
  titular_dni: z.string().optional().or(z.literal('')),
  titular_nombre: z.string().optional().or(z.literal('')),
});

export const busquedaCausaSchema = z.object({
  numero_expediente: z.string().min(1, 'Ingrese un nÃºmero de expediente'),
});

