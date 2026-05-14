import { z } from 'zod';

export const createVehiculoSchema = z.object({
  dominio: z.string()
    .min(6, 'El dominio debe tener al menos 6 caracteres')
    .max(9, 'El dominio debe tener como máximo 9 caracteres')
    .regex(/^[A-Z0-9 ]+$/, 'Solo letras mayúsculas y números')
    .transform((v) => v.toUpperCase()),
  marca: z.string().min(2, 'La marca debe tener al menos 2 caracteres'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  anio: z.coerce.number()
    .int()
    .min(1980, 'Año mínimo 1980')
    .max(new Date().getFullYear() + 1, 'Año inválido')
    .optional(),
  color: z.string().min(2, 'El color debe tener al menos 2 caracteres'),
  tipo_vehiculo: z.enum(['AUTO', 'MOTO', 'CAMION', 'PICKUP', 'OTRO'], {
    message: 'Tipo de vehículo inválido',
  }),
  numero_motor: z.string().min(5, 'El número de motor debe tener al menos 5 caracteres').optional(),
  numero_cuadro: z.string().min(5, 'El número de cuadro debe tener al menos 5 caracteres').optional(),
});

export const searchVehiculoSchema = z.object({
  dominio: z.string().min(2).max(9).optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  tipo_vehiculo: z.enum(['AUTO', 'MOTO', 'CAMION', 'PICKUP', 'OTRO']).optional(),
});
