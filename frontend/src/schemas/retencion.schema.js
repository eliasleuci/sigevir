import { z } from 'zod';

export const retencionSchema = z.object({
  dominio: z.string()
    .min(6, 'Dominio inválido (mínimo 6 caracteres)')
    .max(9, 'Dominio demasiado largo')
    .regex(/^[A-Z0-9 ]+$/i, 'Formato de dominio no válido (solo letras y números)'),
  tipo_vehiculo: z.enum(['AUTO', 'MOTO', 'CAMION', 'PICKUP', 'OTRO']).optional().default('AUTO'),
  marca: z.string().min(2, 'Marca requerida'),
  modelo: z.string().min(1, 'Modelo requerido'),
  color: z.string().optional().nullable(),
  nro_motor: z.string().optional().nullable(),
  nro_cuadro: z.string().optional().nullable(),

  // Datos del titular (opcionales para protocolo policial donde hay lista de involucrados)
  titular_nombre: z.string().optional().nullable(),
  titular_dni: z.string().optional().nullable(),
  titular_domicilio: z.string().optional().nullable(),

  motivo_retencion: z.string().min(5, 'Describe el motivo (mínimo 5 caracteres)'),
  lugar_retencion: z.string().min(3, 'Lugar de retención requerido'),
  observaciones: z.string().optional().nullable(),

  latitud: z.any().optional().nullable(),
  longitud: z.any().optional().nullable(),

  institucion_id: z.string().optional().nullable(),
  agente_id: z.string().optional().nullable(),
  deposito_institucion_id: z.string().optional().nullable(),

  // -- Datos del procedimiento policial --
  numero_comision: z.string().optional().nullable(),
  numero_movil: z.string().optional().nullable(),
  colaboracion_especial: z.array(z.string()).optional().default([]),
  coopera_policia_judicial: z.any().optional().nullable(),

  // -- Consigna --
  queda_consigna: z.any().optional().nullable(),
  consigna_nombre: z.string().optional().nullable(),
  consigna_cargo: z.string().optional().nullable(),
  consigna_dependencia: z.string().optional().nullable(),
  consigna_telefono: z.string().optional().nullable(),

  // -- Traslado --
  tipo_traslado: z.any().optional().nullable(),
  grua_dominio: z.string().optional().nullable(),
  grua_empresa: z.string().optional().nullable(),

  // -- Declaración judicial --
  hora_hecho: z.string().optional().nullable(),
  numero_hecho: z.string().optional().nullable(),
  mecanica_hecho: z.string().optional().nullable(),

  // -- Entorno --
  tiene_camaras_privadas: z.any().optional().nullable(),
  tiene_carteles_nomenclatura: z.any().optional().nullable(),
  tiene_reductores_velocidad: z.any().optional().nullable(),
  tipo_iluminacion: z.any().optional().nullable(),
  estado_iluminacion: z.any().optional().nullable(),
  estado_calzada: z.any().optional().nullable(),

  // -- Personas involucradas (array dinámico) --
  personas_involucradas: z.array(z.object({
    rol: z.string().optional().nullable(),
    nombre_completo: z.string().optional().nullable(),
    edad: z.any().optional().nullable(),
    dni: z.string().optional().nullable(),
    domicilio: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    es_lesionado: z.any().optional().nullable(),
    tipo_lesion: z.string().optional().nullable(),
    nosocomio_traslado: z.string().optional().nullable(),
  })).optional().default([]),
});

export const resolucionSchema = z.object({
  tipo: z.enum(['LIBERACION', 'SUBASTA', 'COMPACTACION', 'OTRO']),
  observaciones: z.string().min(10, 'Describe las observaciones de la resolución'),
  nro_expediente: z.string().min(1, 'Número de expediente requerido'),
});
