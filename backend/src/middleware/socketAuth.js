import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import db from '../models/index.js';
import logger from '../utils/logger.js';

const { Usuario } = db;

export const socketAuth = async (socket, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return next(new Error('Supabase no configurado'));
    }

    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn(`Socket.io Auth Error: ${error?.message}`);
      return next(new Error('Authentication error: Invalid token'));
    }

    const usuario = await Usuario.findByPk(user.id);
    if (!usuario || !usuario.activo) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    socket.user = {
      userId: usuario.id,
      id: usuario.id,
      email: usuario.email,
      role: usuario.rol,
      institucion_id: usuario.institucion_id,
    };

    next();
  } catch (error) {
    logger.warn(`Socket.io Authentication Error: ${error?.message}`);
    next(new Error('Authentication error: Invalid token'));
  }
};