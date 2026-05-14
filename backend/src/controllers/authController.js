import authService from '../services/authService.js';
import googleAuthService from '../services/googleAuthService.js';
import emailService from '../services/emailService.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import db from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

const { Usuario } = db;

class AuthController {
  /**
   * POST /auth/login
   * Login usando email y contraseña
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.loginWithCredentials(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: { accessToken, user }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/google (legacy)
   * Login usando token de Google OAuth
   */
  googleLogin = async (req, res, next) => {
    try {
      const { googleToken } = req.body;
      const { accessToken, refreshToken, user } = await authService.loginWithGoogle(googleToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: { accessToken, user }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/google/signin
   * Login con Google usando idToken del frontend (GoogleSigninButton)
   */
  googleSignin = async (req, res, next) => {
    try {
      const { idToken } = req.body;

      const googleUser = await googleAuthService.verifyGoogleToken(idToken);

      const usuario = await Usuario.findOne({
        where: { email: googleUser.email }
      });

      if (!usuario) {
        logger.warn(`Google login: email no registrado: ${googleUser.email}`);
        throw new AppError('Acceso no autorizado. Debe estar registrado en el sistema primero.', 401);
      }

      if (!usuario.activo) {
        logger.warn(`Google login: usuario inactivo: ${googleUser.email}`);
        throw new AppError('Usuario inactivo o suspendido. Contacte al administrador.', 403);
      }

      if (!usuario.google_id) {
        usuario.google_id = googleUser.googleId;
      }

      usuario.ultimo_acceso = new Date();
      usuario.intentos_fallidos = 0;
      usuario.bloqueado_hasta = null;
      await usuario.save();

      const { accessToken, refreshToken } = authService.generateTokens(
        usuario.id,
        usuario.rol,
        usuario.institucion_id
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user: {
            id: usuario.id,
            nombre: usuario.nombre_completo,
            email: usuario.email,
            rol: usuario.rol,
            institucion_id: usuario.institucion_id,
            picture: googleUser.picture,
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/google/url
   * Obtener URL de autorización de Google (redirect flow)
   */
  getGoogleAuthUrl = async (req, res, next) => {
    try {
      const result = googleAuthService.getGoogleAuthUrl();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/google/callback
   * Intercambiar código de autorización por token (redirect flow)
   */
  googleCallback = async (req, res, next) => {
    try {
      const { code } = req.body;

      const tokens = await googleAuthService.exchangeAuthorizationCode(code);
      const googleUser = await googleAuthService.verifyGoogleToken(tokens.idToken);

      const usuario = await Usuario.findOne({
        where: { email: googleUser.email }
      });

      if (!usuario) {
        throw new AppError('Acceso no autorizado. Debe estar registrado en el sistema primero.', 401);
      }

      if (!usuario.activo) {
        throw new AppError('Usuario inactivo o suspendido.', 403);
      }

      if (!usuario.google_id) {
        usuario.google_id = googleUser.googleId;
      }

      usuario.ultimo_acceso = new Date();
      usuario.intentos_fallidos = 0;
      usuario.bloqueado_hasta = null;
      await usuario.save();

      const { accessToken, refreshToken } = authService.generateTokens(
        usuario.id,
        usuario.rol,
        usuario.institucion_id
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user: {
            id: usuario.id,
            nombre: usuario.nombre_completo,
            email: usuario.email,
            rol: usuario.rol,
            institucion_id: usuario.institucion_id,
            picture: googleUser.picture,
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/refresh
   * Refrescar el access token
   */
  refresh = async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;

      if (!token) {
        throw new AppError('Refresh token no proporcionado', 401);
      }

      const { accessToken } = await authService.refreshToken(token);

      res.status(200).json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   * Cerrar sesión e invalidar tokens
   */
  logout = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      let accessToken = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        accessToken = req.headers.authorization.split(' ')[1];
      }

      await authService.logout(userId, refreshToken, accessToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/recover-password
   * Solicitar recuperación de contraseña (envía email con link)
   */
  sendPasswordRecovery = async (req, res, next) => {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario || !usuario.activo) {
        // No revelar si el email existe o no
        return res.status(200).json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.'
        });
      }

      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      await usuario.update({
        reset_password_token: resetToken,
        reset_password_expires: expiresAt,
      });

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4001'}/reset-password/${resetToken}`;

      try {
        await emailService.sendPasswordRecovery(usuario.email, usuario.nombre_completo, resetLink);
      } catch (emailError) {
        logger.error(`Error enviando email de recuperación a ${email}: ${emailError.message}`);
      }

      res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/reset-password/:token
   * Restablecer contraseña usando token
   */
  resetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const usuario = await Usuario.findOne({
        where: {
          reset_password_token: token,
        }
      });

      if (!usuario) {
        throw new AppError('Token inválido o ya utilizado.', 400);
      }

      if (usuario.reset_password_expires && new Date() > usuario.reset_password_expires) {
        throw new AppError('El token ha expirado. Solicite uno nuevo.', 400);
      }

      usuario.password_hash = password;
      usuario.reset_password_token = null;
      usuario.reset_password_expires = null;
      usuario.intentos_fallidos = 0;
      usuario.bloqueado_hasta = null;
      await usuario.save();

      logger.info(`Contraseña restablecida exitosamente para: ${usuario.email}`);

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente.'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
