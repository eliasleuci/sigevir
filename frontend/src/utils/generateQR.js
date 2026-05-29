// src/utils/generateQR.js
// Genera un código QR a partir de un texto y devuelve un data URL (base64 PNG).
// Usa la librería 'qrcode' que debe estar instalada en el proyecto (npm i qrcode).

import QRCode from 'qrcode';

/**
 * Genera un QR en formato Data URL.
 * @param {string} text - Texto a codificar (p.ej. la URL de la acta o el número de expediente).
 * @returns {Promise<string>} Data URL con la imagen PNG del QR.
 */
export async function generateQR(text) {
  try {
    // Opciones de alta calidad para que el QR sea nítido en pantalla y cuando se imprima.
    const opts = {
      errorCorrectionLevel: 'H', // máximo nivel de corrección
      type: 'image/png',
      quality: 0.9,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000', // negro
        light: '#FFFFFF' // blanco
      }
    };
    const dataUrl = await QRCode.toDataURL(text, opts);
    return dataUrl;
  } catch (err) {
    console.error('Error generando QR:', err);
    throw err;
  }
}
