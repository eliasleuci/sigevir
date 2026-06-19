import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import db from '../models/index.js';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

const { Usuario } = db;

const setReqUser = (req, usuario) => {
  req.user = {
    userId: usuario.id,
    id: usuario.id,
    email: usuario.email,
    role: usuario.rol,
    institucion_id: usuario.institucion_id,
    nombre_completo: usuario.nombre_completo,
  };
};

export const authenticate = async (req, res, next) => {
  try {
    // MODO DEMO: Solo disponible en desarrollo
    if (
      process.env.NODE_ENV !== 'production' &&
      req.headers['x-demo-mode'] === 'true'
    ) {
      const email = req.headers['x-demo-user-email'];
      if (!email) {
        return next(new AppError('Header X-Demo-User-Email requerido', 401, 'DEMO_MISSING_EMAIL'));
      }
      const usuario = await Usuario.findOne({
        where: { email },
        attributes: { exclude: ['password_hash'] },
      });
      if (!usuario) {
        return next(new AppError('Usuario demo no encontrado en BD local: ' + email, 404, 'USER_NOT_FOUND'));
      }
      if (!usuario.activo) {
        return next(new AppError('Usuario inactivo', 403, 'USER_INACTIVE'));
      }
      setReqUser(req, usuario);
      return next();
    }

    // Bloquear intento de usar modo demo en producción
    if (
      process.env.NODE_ENV === 'production' &&
      req.headers['x-demo-mode']
    ) {
      return next(new AppError(
        'Acceso denegado',
        403,
        'FORBIDDEN'
      ));
    }

    // --- Supabase Auth ---
    if (!isSupabaseConfigured()) {
      throw new AppError('Supabase no configurado. Contacte al administrador.', 503, 'SUPABASE_NOT_CONFIGURED');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporciono un token de autenticacion', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Token vacio', 401, 'UNAUTHORIZED');
    }

    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      logger.warn('Auth fallo: ' + (error?.message || 'usuario no encontrado'));
      throw new AppError('Token invalido o expirado', 401, 'INVALID_TOKEN');
    }

    let usuario = await Usuario.findByPk(supabaseUser.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!usuario) {
      // Intentar buscar por email por si fue pre-cargado con un UUID distinto
      usuario = await Usuario.findOne({ where: { email: supabaseUser.email.toLowerCase() } });
      
      if (usuario) {
        logger.info(`Enlazando cuenta existente ${usuario.email} con nuevo ID de Supabase`);
        await usuario.update({ id: supabaseUser.id });
      } else {
        logger.warn('Usuario Supabase no encontrado en BD local, CREANDO: ' + supabaseUser.id);
        const metadata = supabaseUser.user_metadata || {};
      try {
        usuario = await Usuario.create({
          id: supabaseUser.id,
          email: supabaseUser.email,
          nombre_completo: metadata.nombre_completo || supabaseUser.email.split('@')[0],
          rol: metadata.rol || 'admin',
          institucion_id: metadata.institucion_id || '3e23f6e0-eeeb-477a-99a5-ecb93e49a074',
          activo: true,
          password_hash: 'NOPASSWORD_SUPABASE'
        });
      } catch (err) {
        logger.error('Error creando usuario en BD local, mockeando en memoria: ' + err.message);
        usuario = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          nombre_completo: metadata.nombre_completo || supabaseUser.email.split('@')[0],
          rol: metadata.rol || 'admin',
          institucion_id: metadata.institucion_id || '3e23f6e0-eeeb-477a-99a5-ecb93e49a074',
          activo: true
        };
      }
      }
    }

    if (!usuario.activo) {
      logger.warn('Usuario inactivo: ' + (usuario.email || usuario.id));
      throw new AppError('Usuario inactivo o suspendido', 403, 'USER_INACTIVE');
    }

    setReqUser(req, usuario);
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED'));
    }
    const normalizedUser = req.user.role.toUpperCase().replace(/-/g, '_');
    const hasAccess = allowedRoles.some(function(r) {
      return r.toUpperCase().replace(/-/g, '_') === normalizedUser;
    });
    if (!hasAccess) {
      logger.warn('Acceso denegado: ' + req.user.role + ' no autorizado para ' + req.originalUrl);
      return next(new AppError('No tienes permisos para realizar esta accion', 403, 'FORBIDDEN'));
    }
    next();
  };
};