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
}

export default new PDFService();
