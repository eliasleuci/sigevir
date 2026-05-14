import Joi from 'joi';

// Schema para login con credenciales
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe proporcionar un correo electrónico válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  })
});

// Schema para login con Google
export const googleLoginSchema = Joi.object({
  googleToken: Joi.string().required().messages({
    'any.required': 'El token de Google es requerido'
  })
});

// Schema para login con Google (nuevo flujo signin)
export const googleSigninSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'El idToken de Google es requerido'
  })
});

// Schema para refrescar el token
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'El refresh token es requerido'
  })
});
