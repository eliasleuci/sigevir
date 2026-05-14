import Joi from 'joi';

export const buscarCausaSchema = Joi.object({
  numero_expediente: Joi.string().allow('', null),
  dominio: Joi.string().allow('', null),
  dni_titular: Joi.string().allow('', null)
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un criterio de búsqueda (Expediente, Dominio o DNI)'
});

export const emitirResolucionSchema = Joi.object({
  numero_expediente: Joi.string().required(),
  tipo: Joi.string().valid('liberacion', 'subasta', 'compactacion').required(),
  observaciones: Joi.string().allow('', null),
  documento_url: Joi.string().uri().required().messages({
    'any.required': 'La URL del documento judicial es obligatoria',
    'string.uri': 'La URL del documento debe ser una URI válida'
  })
});

export const cambioExtraordinarioSchema = Joi.object({
  nuevo_estado: Joi.string().valid(
    'RETENIDO', 
    'EN_DEPOSITO', 
    'RESOLUCION_PENDIENTE', 
    'LIBERADO', 
    'SUBASTADO', 
    'COMPACTADO'
  ).required(),
  justificacion: Joi.string().min(10).required(),
  documento_url: Joi.string().uri().required()
});
