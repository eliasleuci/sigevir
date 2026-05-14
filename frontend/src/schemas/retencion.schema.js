import { z } from 'zod';

export const retencionSchema = z.object({
  // Datos del Vehículo
  dominio: z.string()
    .min(6, 'Dominio inválido')
    .max(9, 'Dominio demasiado largo')
    .regex(/^[A-Z0-9 ]+$/, 'Formato de dominio no válido (solo letras y números)'),
  tipo_vehiculo: z.enum(['AUTO', 'MOTO', 'CAMION', 'PICKUP', 'OTRO']),
  marca: z.string().min(2, 'Marca requerida'),
  modelo: z.string().min(1, 'Modelo requerido'),
  color: z.string().min(2, 'Color requerido'),
  nro_motor: z.string().min(5, 'Número de motor requerido'),
  nro_cuadro: z.string().min(5, 'Número de cuadro/chasis requerido'),

  // Datos del Infractor / Titular
  titular_nombre: z.string().min(3, 'Nombre completo requerido'),
  titular_dni: z.string()
    .min(7, 'DNI debe tener al menos 7 dígitos')
    .max(8, 'DNI no puede superar los 8 dígitos')
    .regex(/^[0-9]+$/, 'DNI solo debe contener números'),
  titular_domicilio: z.string().min(5, 'Domicilio requerido'),

  // Datos de la Retención
  motivo_retencion: z.string().min(10, 'Describe el motivo (mínimo 10 caracteres)'),
  lugar_retencion: z.string().min(5, 'Lugar de retención requerido'),
  observaciones: z.string().optional(),
  
  // Metadatos
  institucion_id: z.string().uuid().optional(),
  agente_id: z.string().uuid().optional(),
});

export const resolucionSchema = z.object({
  tipo: z.enum(['LIBERACION', 'SUBASTA', 'COMPACTACION', 'OTRO']),
  observaciones: z.string().min(10, 'Describe las observaciones de la resolución'),
  nro_expediente: z.string().min(1, 'Número de expediente requerido'),
});
