import Joi from 'joi';

export const confirmarIngresoSchema = Joi.object({
  numero_expediente: Joi.string().required().messages({ 'any.required': 'El número de expediente es obligatorio' }),
  sector: Joi.string().required().max(10),
  fila: Joi.number().integer().min(1).required(),
  numero_espacio: Joi.number().integer().min(1).required(),
  inventario_objetos: Joi.string().required().min(5),
  observaciones: Joi.string().allow('', null)
});

export const listPendingSchema = Joi.object({
  institucion_id: Joi.string().uuid().optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
});

export const listInDepositSchema = Joi.object({
  estado: Joi.string().valid('en_deposito', 'egresado').default('en_deposito'),
  sector: Joi.string().optional(),
  institucion_id: Joi.string().uuid().optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
});

export const iniciarTramiteSchema = Joi.object({
  quien_retira: Joi.string().required().min(3).messages({
    'any.required': 'El nombre de quien retira es obligatorio',
    'string.min': 'El nombre debe tener al menos 3 caracteres'
  }),
  dni_quien_retira: Joi.string().required().min(6).messages({
    'any.required': 'El DNI de quien retira es obligatorio'
  }),
  razon_egreso: Joi.string().required().min(5).messages({
    'any.required': 'Debe especificar la razón del egreso'
  }),
  documentos_egreso: Joi.object().optional()
});
export const registrarEgresoSchema = Joi.object({
  razon_egreso: Joi.string().required().min(5).messages({
    'any.required': 'Debe especificar la razón del egreso',
    'string.min': 'La razón del egreso debe tener al menos 5 caracteres'
  }),
  quien_retira: Joi.string().optional().allow('', null),
  dni_quien_retira: Joi.string().optional().allow('', null),
  documentos_egreso: Joi.object().optional()
});

