import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.FRONTEND_URL || 'http://localhost:4001'}/api/auth/google/callback`;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

class GoogleAuthService {
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new AppError('Token de Google inválido: payload vacío', 401);
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error verificando token de Google: ${error.message}`);
      throw new AppError('Token de Google inválido o expirado', 401);
    }
  }

  getGoogleAuthUrl() {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'openid',
        'email',
        'profile',
      ],
    });

    return { url };
  }

  async exchangeAuthorizationCode(code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.id_token) {
        throw new AppError('No se recibió id_token de Google', 401);
      }

      return {
        idToken: tokens.id_token,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error intercambiando código de autorización: ${error.message}`);
      throw new AppError('Código de autorización inválido', 401);
    }
  }
}

export default new GoogleAuthService();
