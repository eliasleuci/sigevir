import { AppError } from './errorHandler.js';

/**
 * Middleware genérico para validar peticiones usando Joi schemas.
 * Valida el req.body contra el esquema proporcionado.
 * @param {Object} schema - Esquema Joi a validar
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Mapear los detalles del error para devolver un formato amigable
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return next(new AppError('Error de validación de datos', 400, errors));
    }
    
    next();
  };
};
