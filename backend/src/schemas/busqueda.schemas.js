import Joi from 'joi';

export const busquedaAvanzadaSchema = Joi.object({
  dominio: Joi.string().allow('', null),
  numero_motor: Joi.string().allow('', null),
  numero_cuadro: Joi.string().allow('', null),
  dni_titular: Joi.string().allow('', null),
  numero_expediente: Joi.string().allow('', null),
  estado_actual: Joi.string().valid('RETENIDO', 'EN_DEPOSITO', 'RESOLUCION_PENDIENTE', 'LIBERADO', 'SUBASTADO', 'COMPACTADO').allow('', null),
  fecha_desde: Joi.date().iso().allow('', null),
  fecha_hasta: Joi.date().iso().allow('', null),
  institucion_id: Joi.string().uuid().allow('', null),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un criterio de búsqueda'
});
