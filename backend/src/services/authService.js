import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import tokenBlacklist from '../middleware/tokenBlacklist.js';

const { Usuario } = db;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
   * Hashea una contraseña usando bcrypt (10 rounds)
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash resultante
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara una contraseña en texto plano contra su hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hash - Hash en la base de datos
   * @returns {Promise<boolean>}
   */
  async comparePassword(password, hash) {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera los tokens de acceso y refresco para un usuario
   * @param {string} userId - ID del usuario
   * @param {string} role - Rol del usuario
   * @param {string} institucion_id - ID de la institución
   * @returns {Object} { accessToken, refreshToken }
   */
  generateTokens(userId, role, institucion_id) {
    const payload = { userId, role, institucion_id };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    // Refresh token solo necesita el userId
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  /**
   * Valida un JWT y devuelve su payload
   * @param {string} token 
   * @returns {Object|null} Payload o null si es inválido
   */
  validateJWT(token) {
    try {
      if (tokenBlacklist.isBlacklisted(token)) {
        return null; // El token fue revocado (logout)
      }
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Autentica a un usuario usando credenciales (email y password)
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} { accessToken, refreshToken, user }
   */
  async loginWithCredentials(email, password) {
    const usuario = await Usuario.findOne({ where: { email } });

    // Mensaje genérico por seguridad (no revelar si el email existe o no)
    const genericErrorMsg = 'Credenciales inválidas';

    if (!usuario) {
      logger.warn(`Intento de login fallido para email no existente: ${email}`);
      throw new AppError(genericErrorMsg, 401);
    }

    if (!usuario.activo) {
      logger.warn(`Intento de login de usuario inactivo: ${email}`);
      throw new AppError('Usuario inactivo o suspendido. Contacte al administrador.', 403);
    }

    // Verificar bloqueo temporal (ej: por 5 intentos fallidos)
    if (usuario.bloqueado_hasta && new Date() < usuario.bloqueado_hasta) {
      logger.warn(`Intento de login de usuario bloqueado temporalmente: ${email}`);
      throw new AppError('Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente más tarde.', 403);
    }

    const isMatch = await this.comparePassword(password, usuario.password_hash);

    if (!isMatch) {
      // Incrementar intentos fallidos
      usuario.intentos_fallidos += 1;
      
      if (usuario.intentos_fallidos >= 5) {
        // Bloquear por 30 minutos
        const unblockDate = new Date(Date.now() + 30 * 60000);
        usuario.bloqueado_hasta = unblockDate;
        logger.warn(`Cuenta bloqueada por 30 minutos debido a demasiados intentos fallidos: ${email}`);
      }
      
      await usuario.save();
      throw new AppError(genericErrorMsg, 401);
    }

    // Si success: resetear intentos y actualizar último acceso
    usuario.intentos_fallidos = 0;
    usuario.bloqueado_hasta = null;
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    // Generar tokens
    const { accessToken, refreshToken } = this.generateTokens(
      usuario.id,
      usuario.rol,
      usuario.institucion_id
    );

    // Retornar datos (sin información sensible como password_hash)
    const userData = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      institucion_id: usuario.institucion_id
    };

    logger.info(`Usuario logueado exitosamente (credenciales): ${email}`);

    return { accessToken, refreshToken, user: userData };
  }

  /**
   * Autentica a un usuario usando un token de Google
   * @param {string} googleToken 
   * @returns {Promise<Object>} { accessToken, refreshToken, user }
   */
  async loginWithGoogle(googleToken) {
    try {
      // Verificar el token con Google
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const { email, sub: googleId } = payload; // sub es el ID único de Google

      // Buscar usuario por email o google_id
      const usuario = await Usuario.findOne({ 
        where: { email } 
      });

      if (!usuario) {
        logger.warn(`Intento de login con Google fallido. Email no registrado en BD: ${email}`);
        throw new AppError('Acceso no autorizado. Debe estar registrado en el sistema primero.', 401);
      }

      if (!usuario.activo) {
        logger.warn(`Intento de login con Google de usuario inactivo: ${email}`);
        throw new AppError('Usuario inactivo o suspendido. Contacte al administrador.', 403);
      }

      // Si no tenía el google_id guardado, lo actualizamos ahora (primer login con Google de una cuenta existente)
      if (!usuario.google_id) {
        usuario.google_id = googleId;
      }

      // Actualizar último acceso
      usuario.ultimo_acceso = new Date();
      usuario.intentos_fallidos = 0;
      usuario.bloqueado_hasta = null;
      await usuario.save();

      // Generar tokens propios
      const { accessToken, refreshToken } = this.generateTokens(
        usuario.id,
        usuario.rol,
        usuario.institucion_id
      );

      const userData = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        institucion_id: usuario.institucion_id
      };

      logger.info(`Usuario logueado exitosamente (Google): ${email}`);

      return { accessToken, refreshToken, user: userData };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error verificando token de Google: ${error.message}`);
      throw new AppError('Token de Google inválido o expirado', 401);
    }
  }

  /**
   * Refresca un token de acceso usando un refresh token válido
   * @param {string} refreshToken 
   * @returns {Promise<Object>} { accessToken }
   */
  async refreshToken(refreshToken) {
    const payload = this.validateJWT(refreshToken);
    
    if (!payload || !payload.userId) {
      throw new AppError('Refresh token inválido o expirado', 401);
    }

    const usuario = await Usuario.findByPk(payload.userId);

    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario inactivo o no encontrado', 401);
    }

    // Generar nuevos tokens (opcionalmente podemos retornar un nuevo refresh token también,
    // pero aquí sólo emitiremos un nuevo access token para extender la sesión)
    const tokens = this.generateTokens(
      usuario.id,
      usuario.rol,
      usuario.institucion_id
    );

    return { accessToken: tokens.accessToken };
  }

  /**
   * Cierra la sesión del usuario invalidando su refresh token y opcionalmente el access token
   * @param {string} userId - ID del usuario que cierra sesión
   * @param {string} refreshToken - Token a invalidar
   * @param {string} accessToken - Token actual (opcional, para invalidarlo inmediato)
   */
  async logout(userId, refreshToken, accessToken) {
    // Si tenemos un sistema de lista negra de tokens (en memoria/redis)
    if (refreshToken) {
      tokenBlacklist.add(refreshToken);
    }
    
    if (accessToken) {
      // 15 minutos (900 segs) es el max age de un access token
      tokenBlacklist.add(accessToken, 900);
    }

    logger.info(`Usuario hizo logout: ${userId}`);
    return { success: true };
  }
}

export default new AuthService();
