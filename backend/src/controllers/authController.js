import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const { Usuario } = db;

class AuthController {
  login = async (req, res, next) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new AppError('Supabase no configurado', 503);
      }
      const { email, password } = req.body;

      const { data: { session }, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new AppError('Credenciales inválidas', 401);

      const usuario = await Usuario.findOne({
        where: { email },
        attributes: { exclude: ['password_hash'] },
      });

      if (!usuario) throw new AppError('Usuario no encontrado en el sistema', 404);
      if (!usuario.activo) throw new AppError('Usuario inactivo o suspendido', 403);

      usuario.ultimo_acceso = new Date();
      await usuario.save();

      res.status(200).json({
        success: true,
        data: {
          accessToken: session.access_token,
          user: {
            id: usuario.id,
            nombre: usuario.nombre_completo,
            email: usuario.email,
            rol: usuario.rol,
            institucion_id: usuario.institucion_id,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new AppError('Supabase no configurado', 503);
      }
      const { data: { session }, error } = await supabaseAdmin.auth.refreshSession();
      if (error) throw new AppError('Sesión expirada', 401);
      res.status(200).json({ success: true, data: { accessToken: session.access_token } });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new AppError('Supabase no configurado', 503);
      }
      const token = req.headers.authorization?.split(' ')?.[1];
      if (token) {
        await supabaseAdmin.auth.admin.signOut(token);
      }
      res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const usuario = await Usuario.findByPk(req.user.userId, {
        attributes: { exclude: ['password_hash'] },
        include: ['Institucion'],
      });
      if (!usuario) throw new AppError('Usuario no encontrado', 404);
      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();