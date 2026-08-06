import { z } from 'zod';

export const retencionSchema = z.object({
  dominio: z.string()
    .min(6, 'Dominio invalido')
    .max(9, 'Dominio demasiado largo')
    .regex(/^[A-Z0-9 ]+$/, 'Formato de dominio no valido (solo letras y numeros)'),
  tipo_vehiculo: z.enum(['AUTO', 'MOTO', 'CAMION', 'PICKUP', 'OTRO']),
  marca: z.string().min(2, 'Marca requerida'),
  modelo: z.string().min(1, 'Modelo requerido'),
  color: z.string().min(2, 'Color requerido'),
  nro_motor: z.string().min(5, 'Numero de motor requerido'),
  nro_cuadro: z.string().min(5, 'Numero de cuadro/chasis requerido'),

  titular_nombre: z.string().min(3, 'Nombre completo requerido'),
  titular_dni: z.string()
    .min(7, 'DNI debe tener al menos 7 digitos')
    .max(8, 'DNI no puede superar los 8 digitos')
    .regex(/^[0-9]+$/, 'DNI solo debe contener numeros'),
  titular_domicilio: z.string().min(5, 'Domicilio requerido'),

  motivo_retencion: z.string().min(10, 'Describe el motivo (minimo 10 caracteres)'),
  lugar_retencion: z.string().min(5, 'Lugar de retencion requerido'),
  observaciones: z.string().optional(),

  latitud: z.number().min(-90).max(90).optional(),
  longitud: z.number().min(-180).max(180).optional(),

  institucion_id: z.string().uuid().optional(),
  agente_id: z.string().uuid().optional(),
  
  deposito_institucion_id: z.string().uuid().optional(),

  // -- Datos del procedimiento policial --
  numero_comision: z.string().optional(),
  numero_movil: z.string().optional(),
  colaboracion_especial: z.array(z.string()).optional().default([]),
  coopera_policia_judicial: z.boolean().optional(),

  // -- Consigna --
  queda_consigna: z.boolean().optional().default(false),
  consigna_nombre: z.string().optional(),
  consigna_cargo: z.string().optional(),
  consigna_dependencia: z.string().optional(),
  consigna_telefono: z.string().optional(),

  // -- Traslado --
  tipo_traslado: z.enum(['PROPIOS_MEDIOS', 'GRUA']).optional(),
  grua_dominio: z.string().optional(),
  grua_empresa: z.string().optional(),

  // -- Declaracion judicial --
  hora_hecho: z.string().optional(),
  numero_hecho: z.string().optional(),
  mecanica_hecho: z.string().optional(),

  // -- Entorno --
  tiene_camaras_privadas: z.boolean().optional(),
  tiene_carteles_nomenclatura: z.boolean().optional(),
  tiene_reductores_velocidad: z.boolean().optional(),
  estado_iluminacion: z.enum(['BUENA', 'REGULAR', 'MALA', 'SIN_ILUMINACION']).optional(),
  estado_calzada: z.enum(['SECA', 'MOJADA', 'DETERIORADA', 'EN_OBRA']).optional(),

  // -- Personas involucradas (array dinamico) --
  personas_involucradas: z.array(z.object({
    rol: z.enum(['CONDUCTOR', 'ACOMPANANTE', 'PEATON', 'TESTIGO', 'OTRO']),
    nombre_completo: z.string().min(3, 'Nombre requerido'),
    edad: z.number().optional(),
    dni: z.string().optional(),
    domicilio: z.string().optional(),
    telefono: z.string().optional(),
    es_lesionado: z.boolean().optional().default(false),
    tipo_lesion: z.string().optional(),
    nosocomio_traslado: z.string().optional(),
  })).optional().default([]),
});

export const resolucionSchema = z.object({
  tipo: z.enum(['LIBERACION', 'SUBASTA', 'COMPACTACION', 'OTRO']),
  observaciones: z.string().min(10, 'Describe las observaciones de la resolucion'),
  nro_expediente: z.string().min(1, 'Numero de expediente requerido'),
});
