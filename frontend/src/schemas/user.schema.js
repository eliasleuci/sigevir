import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const createUserSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  rol: z.enum([
    'ADMIN_GENERAL',
    'ADMIN_INSTITUCION',
    'FISCAL_JUEZ',
    'AGENTE_CAMPO',
    'DEPOSITO',
    'CONTROLADOR',
  ], { message: 'Rol inválido' }),
  institucion_id: z.string().uuid('Debe ser una institución válida'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener un carácter especial')
    .optional(),
});

export const updateUserSchema = z.object({
  nombre_completo: z.string().min(3).optional(),
  email: z.string().email().optional(),
  rol: z.enum([
    'ADMIN_GENERAL',
    'ADMIN_INSTITUCION',
    'FISCAL_JUEZ',
    'AGENTE_CAMPO',
    'DEPOSITO',
    'CONTROLADOR',
  ]).optional(),
  activo: z.boolean().optional(),
});
