import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import logger from '../utils/logger.js';

const { Usuario } = db;

/**
 * Middleware para validar el JWT en la conexión de Socket.io
 */
export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_desarrollo');
    
    // Opcional: Validar que el usuario sigue existiendo y está activo
    const user = await Usuario.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    // Adjuntar los datos decodificados al objeto socket
    socket.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Socket.io Authentication Error: ${error.message}`);
    next(new Error('Authentication error: Invalid token'));
  }
};
