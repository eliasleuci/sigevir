import QRCode from 'qrcode';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

class QRService {
  /**
   * Genera un código QR como Data URL (base64)
   * @param {string} text - Contenido del QR
   * @param {number} size - Tamaño en píxeles
   * @returns {Promise<string>} Data URL del QR
   */
  async generateQRCode(text, size = 300) {
    try {
      return await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (error) {
      logger.error(`Error generando QR: ${error.message}`);
      throw new AppError('Error al generar el código QR', 500);
    }
  }

  /**
   * Genera un código QR como Buffer (PNG)
   * @param {string} url - URL para el QR
   * @returns {Promise<Buffer>} Buffer de la imagen
   */
  async generateQRCodeImage(url) {
    try {
      return await QRCode.toBuffer(url, {
        width: 300,
        margin: 2,
      });
    } catch (error) {
      logger.error(`Error generando imagen QR: ${error.message}`);
      throw new AppError('Error al generar la imagen del código QR', 500);
    }
  }
}

export default new QRService();
