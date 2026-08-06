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

    let usuario = await Usuario.findByPk(user.id);
    if (!usuario && user.email) {
      usuario = await Usuario.findOne({ where: { email: user.email } });
    }

    const userId = usuario?.id || user.id;
    const role = usuario?.rol || user.user_metadata?.rol || 'agente_campo';
    const institucionId = usuario?.institucion_id || user.user_metadata?.institucion_id || null;

    socket.user = {
      userId,
      id: userId,
      email: user.email,
      role,
      institucion_id: institucionId,
    };

    next();
  } catch (error) {
    logger.warn(`Socket.io Authentication Error: ${error?.message}`);
    next(new Error('Authentication error: Invalid token'));
  }
};