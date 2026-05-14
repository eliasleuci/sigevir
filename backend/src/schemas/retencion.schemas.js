import Joi from 'joi';

export const createRetencionSchema = Joi.object({
  dominio: Joi.string().pattern(/^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$/i).required().messages({
    'string.pattern.base': 'El dominio debe tener formato ARG válido (ABC123 o AB123CD)'
  }),
  marca: Joi.string().required(),
  modelo: Joi.string().required(),
  anio: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  color: Joi.string().required(),
  tipo_vehiculo: Joi.string().valid('auto', 'moto', 'camioneta', 'camion', 'otro').required(),
  numero_motor: Joi.string().allow('', null),
  numero_cuadro: Joi.string().allow('', null),
  danios_visibles: Joi.string().allow('', null),
  provincia: Joi.string().required(),
  localidad: Joi.string().required(),
  calle_direccion: Joi.string().required(),
  motivo_retencion: Joi.string().required(),
  versus: Joi.string().allow('', null),
  num_cooperacion: Joi.string().allow('', null),
  num_sumario: Joi.string().allow('', null),
  num_sac: Joi.string().allow('', null),
  titular_nombre: Joi.string().allow('', null),
  titular_dni: Joi.string().allow('', null),
  titular_contacto: Joi.string().allow('', null)
});

export const listRetencionesSchema = Joi.object({
  estado: Joi.string().valid('retenido_en_transito', 'en_deposito', 'resolucion_pendiente', 'egresado').optional(),
  institucion_id: Joi.string().uuid().optional(),
  fecha_desde: Joi.date().iso().optional(),
  fecha_hasta: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
});

export const updateRetencionSchema = Joi.object({
  marca: Joi.string().optional(),
  modelo: Joi.string().optional(),
  anio: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: Joi.string().optional(),
  tipo_vehiculo: Joi.string().valid('auto', 'moto', 'camioneta', 'camion', 'otro').optional(),
  numero_motor: Joi.string().allow('', null).optional(),
  numero_cuadro: Joi.string().allow('', null).optional(),
  danios_visibles: Joi.string().allow('', null).optional(),
  motivo_retencion: Joi.string().optional(),
  versus: Joi.string().allow('', null).optional(),
  num_cooperacion: Joi.string().allow('', null).optional(),
  num_sumario: Joi.string().allow('', null).optional(),
  num_sac: Joi.string().allow('', null).optional(),
  titular_nombre: Joi.string().allow('', null).optional(),
  titular_dni: Joi.string().allow('', null).optional(),
  titular_contacto: Joi.string().allow('', null).optional()
}).min(1);
