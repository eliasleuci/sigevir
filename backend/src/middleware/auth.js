import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Middleware para verificar JWT o Google OAuth token
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó un token de autenticación', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    // 1. Intentar verificar como JWT propio
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Inyectar usuario en req
      return next();
    } catch (jwtError) {
      // Si el token no es un JWT válido nuestro, intentamos con Google
      if (jwtError.name !== 'JsonWebTokenError' && jwtError.name !== 'TokenExpiredError') {
        throw jwtError;
      }
    }

    // 2. Intentar verificar como Google OAuth token
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      // Aquí normalmente buscarías al usuario en tu BD por email
      // Por ahora inyectamos el payload básico
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        isGoogleUser: true,
        // Estos campos deben venir de tu lógica de negocio/BD más adelante
        role: 'USER', 
        institucion_id: null 
      };
      
      return next();
    } catch (googleError) {
      logger.warn('Fallo en verificación de token JWT y Google OAuth');
      throw new AppError('Token inválido o expirado', 401, 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para control de acceso basado en roles (RBAC)
 * @param {...string} allowedRoles - Roles permitidos
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Acceso denegado para usuario ${req.user.email} con rol ${req.user.role}`);
      return next(new AppError('No tienes permisos suficientes para realizar esta acción', 403, 'FORBIDDEN'));
    }

    next();
  };
};
