import puppeteer from 'puppeteer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import qrService from './qrService.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
      },
    });
  }

  async generateActaRetencion(data) {
    let browser;
    try {
      const qrDataUrl = await qrService.generateQRCode(data.qr_url);
      const templatePath = path.join(__dirname, '../templates/acta.html');
      let html = await fs.readFile(templatePath, 'utf8');
      const replacements = {
        '{{logo_url}}': data.institucion?.logo_url || 'https://via.placeholder.com/150',
        '{{institucion_nombre}}': data.institucion?.nombre || 'Institución No Especificada',
        '{{institucion_tipo}}': data.institucion?.tipo || '',
        '{{institucion_jurisdiccion}}': data.institucion?.jurisdiccion || '',
        '{{numero_expediente}}': data.numero_expediente,
        '{{fecha_hora}}': new Date(data.fecha_hora).toLocaleString('es-AR'),
        '{{vehiculo_dominio}}': data.vehiculo?.dominio || 'N/A',
        '{{vehiculo_tipo}}': data.vehiculo?.tipo_vehiculo || 'N/A',
        '{{vehiculo_marca}}': data.vehiculo?.marca || '',
        '{{vehiculo_modelo}}': data.vehiculo?.modelo || '',
        '{{vehiculo_anio}}': data.vehiculo?.anio || 'N/A',
        '{{vehiculo_color}}': data.vehiculo?.color || 'N/A',
        '{{vehiculo_motor}}': data.vehiculo?.numero_motor || 'N/A',
        '{{vehiculo_cuadro}}': data.vehiculo?.numero_cuadro || 'N/A',
        '{{vehiculo_danios}}': data.vehiculo?.danios_visibles || 'Sin daños informados',
        '{{provincia}}': data.provincia || 'N/A',
        '{{localidad}}': data.localidad || 'N/A',
        '{{direccion}}': data.calle_direccion || 'N/A',
        '{{motivo_retencion}}': data.motivo_retencion || 'N/A',
        '{{versus}}': data.versus ? `Versus: ${data.versus}` : '',
        '{{agente_nombre}}': data.agente?.nombre_completo || 'Oficial Interviniente',
        '{{agente_dni}}': data.agente?.dni || 'N/A',
        '{{agente_seccion}}': data.agente?.seccion || 'N/A',
        '{{titular_nombre}}': data.titular?.nombre || 'N/A',
        '{{titular_dni}}': data.titular?.dni || 'N/A',
        '{{titular_contacto}}': data.titular?.contacto || 'N/A',
        '{{fecha_firma}}': new Date().toLocaleDateString('es-AR'),
        '{{qr_data_url}}': qrDataUrl
      };
      for (const [key, value] of Object.entries(replacements)) {
        html = html.split(key).join(value);
      }
      const fotosHtml = (data.fotos || []).slice(0, 4).map(url => `<img src="${url}" class="photo-item">`).join('');
      html = html.replace('{{#each fotos}}', '').replace('{{/each}}', fotosHtml);
      if (!data.versus) {
        html = html.replace(/{{#if versus}}[\s\S]*?{{\/if}}/, '');
      } else {
        html = html.replace('{{#if versus}}', '').replace('{{/if}}', '');
      }
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
      });
      await browser.close();
      return pdfBuffer;
    } catch (error) {
      if (browser) await browser.close();
      logger.error(`Error generando PDF: ${error.message}`);
      throw new AppError('Error al generar el acta en PDF', 500);
    }
  }

  async uploadPdfToS3(pdfBuffer, fileName) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `actas/${year}/${month}/${fileName}.pdf`;
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_DOCUMENTS_BUCKET || 'sigevir-documents',
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      });
      await this.s3Client.send(command);
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_DOCUMENTS_BUCKET || 'sigevir-documents',
        Key: key
      });
      if (process.env.NODE_ENV !== 'production' && !process.env.AWS_ACCESS_KEY_ID) {
        logger.warn('Simulando subida a S3 y URL firmada (entorno desarrollo)');
        return `https://s3.amazonaws.com/sigevir-documents/${key}?signed=true`;
      }
      return await getSignedUrl(this.s3Client, getCommand, { expiresIn: 604800 });
    } catch (error) {
      logger.error(`Error subiendo a S3: ${error.message}`);
      throw new AppError('Error al guardar el acta digital', 500);
    }
  }

  async generatePdfFromHtml(html) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      await browser.close();
      return pdfBuffer;
    } catch (error) {
      if (browser) await browser.close();
      logger.error('Error generando PDF desde HTML: ' + error.message);
      throw new AppError('Error al generar el PDF', 500);
    }
  }

  /**
   * Genera el comprobante formal para el ciudadano.
   * A diferencia del acta interna, NO incluye datos del agente policial.
   */
  async generarComprobanteCiudadano(retencion) {
    try {
      const SIGEVIR_DOMAIN = process.env.SIGEVIR_PUBLIC_DOMAIN || 'https://sigevir.dominio.com';
      const targetUrl = retencion.qr_url || `${SIGEVIR_DOMAIN}/r/${retencion.numero_expediente || retencion.nro_expediente || retencion.id}`;
      const qrDataUrl = await qrService.generateQRCode(targetUrl);

      const template = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
            .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0; font-size: 12px; }
            .seccion { margin-bottom: 20px; }
            .seccion h2 { font-size: 14px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
            .dato { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .dato .label { color: #6b7280; }
            .dato .valor { font-weight: 600; color: #111827; }
            .qr-box { text-align: center; margin-top: 30px; padding: 20px; border: 2px dashed #2563eb; border-radius: 12px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 140px; color: rgba(37, 99, 235, 0.05); z-index: -1; white-space: nowrap; font-weight: 900; pointer-events: none; letter-spacing: 15px; }
          </style>
        </head>
        <body style="position: relative; z-index: 1;">
          <div class="watermark">SIGEVIR</div>
          <div class="header">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <h1>SIGEVIR</h1>
            <p>Sistema Integral de Gestión de Vehículos Retenidos</p>
          </div>

          <div class="seccion">
            <h2>Datos del hecho</h2>
            <div class="dato"><span class="label">Fecha y hora</span><span class="valor">{{fecha_hora}}</span></div>
            <div class="dato"><span class="label">Lugar</span><span class="valor">{{lugar_retencion}}</span></div>
            <div class="dato"><span class="label">N° de seguimiento</span><span class="valor">{{numero_expediente}}</span></div>
          </div>

          <div class="seccion">
            <h2>Datos del vehículo</h2>
            <div class="dato"><span class="label">Dominio</span><span class="valor">{{dominio}}</span></div>
            <div class="dato"><span class="label">Marca / Modelo</span><span class="valor">{{marca}} {{modelo}}</span></div>
            <div class="dato"><span class="label">Color</span><span class="valor">{{color}}</span></div>
          </div>

          <div class="seccion">
            <h2>Lugar de traslado</h2>
            <div class="dato"><span class="label">Depósito de resguardo</span><span class="valor">{{deposito_nombre}}</span></div>
            <div class="dato"><span class="label">Dirección</span><span class="valor">{{deposito_direccion}}</span></div>
          </div>

          <div class="qr-box">
            <p style="font-size:12px; color:#2563eb; font-weight:600; margin-bottom:12px;">
              Escaneá este código para hacer seguimiento
            </p>
            <img src="{{qr_data_url}}" width="180" height="180" />
          </div>

          <div class="footer">
            Documento generado automáticamente por SIGEVIR — no requiere firma.<br/>
            Conservá este comprobante para el seguimiento de tu vehículo.
          </div>
        </body>
        </html>
      `;

      const html = template
        .replace('{{fecha_hora}}', retencion.fecha_hora ? new Date(retencion.fecha_hora).toLocaleString('es-AR') : new Date().toLocaleString('es-AR'))
        .replace('{{lugar_retencion}}', retencion.calle_direccion || 'N/A')
        .replace('{{numero_expediente}}', retencion.numero_expediente || retencion.nro_expediente || String(retencion.id).slice(0, 8).toUpperCase())
        .replace('{{dominio}}', retencion.vehiculo?.dominio || retencion.dominio || 'N/A')
        .replace('{{marca}}', retencion.vehiculo?.marca || retencion.marca || '')
        .replace('{{modelo}}', retencion.vehiculo?.modelo || retencion.modelo || '')
        .replace('{{color}}', retencion.vehiculo?.color || retencion.color || 'N/A')
        .replace('{{deposito_nombre}}', retencion.deposito_institucion?.nombre || 'A confirmar')
        .replace('{{deposito_direccion}}', retencion.deposito_institucion?.direccion || 'A confirmar')
        .replace('{{qr_data_url}}', qrDataUrl);

      return await this.generatePdfFromHtml(html);
    } catch (error) {
      logger.error(`Error generando comprobante ciudadano: ${error.message}`);
      throw new AppError('Error al generar el comprobante', 500);
    }
  }
}

export default new PDFService();
