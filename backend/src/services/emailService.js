import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import db from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'emails');

const { Notificacion } = db;

// Configuración de Nodemailer (Gmail u otro SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromEmail = {
  address: process.env.SMTP_USER || 'noreply@sigevir.gob.ar',
  name: 'Sistema SIGEVIR',
};

const emailEnabled = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

function loadTemplate(name, variables = {}) {
  let html = fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.html`), 'utf-8');
  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }
  return html;
}

async function sendWithRetry(msg, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!emailEnabled) {
        logger.info(`[EMAIL SIMULATED] To: ${msg.to} | Subject: ${msg.subject}`);
        return { success: true, simulated: true };
      }
      // Adaptar el mensaje de SendGrid a formato Nodemailer
      const mailOptions = {
        from: `"${msg.from?.name || fromEmail.name}" <${msg.from?.email || fromEmail.address}>`,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
      };
      await transporter.sendMail(mailOptions);
      logger.info(`Email enviado a ${msg.to}: ${msg.subject}`);
      return { success: true };
    } catch (error) {
      const isLastAttempt = attempt === retries;
      logger.error(
        `Intento ${attempt}/${retries} fallido para email a ${msg.to}: ${error.message}`
      );
      if (!isLastAttempt) {
        const backoff = delay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
      } else {
        logger.error(`Email a ${msg.to} falló tras ${retries} intentos`);
        return { success: false, error: error.message };
      }
    }
  }
}

async function updateNotificacionEmailSent(notificacionId) {
  if (!notificacionId) return;
  try {
    await Notificacion.update(
      { enviado_email: true, email_enviado_at: new Date() },
      { where: { id: notificacionId } }
    );
  } catch (error) {
    logger.error(`Error actualizando notificacion ${notificacionId}: ${error.message}`);
  }
}

class EmailService {
  async sendResolucionJudicial(email, datos, notificacionId = null) {
    const html = loadTemplate('resolucion', {
      nombre_responsable: datos.nombre_responsable || 'Usuario',
      numero_expediente: datos.numero_expediente || '',
      dominio: datos.dominio || '',
      tipo_resolucion: datos.tipo_resolucion || '',
      fecha_emision: datos.fecha_emision
        ? new Date(datos.fecha_emision).toLocaleString('es-AR')
        : '',
      sistema_url: process.env.FRONTEND_URL || 'http://localhost:4001',
    });

    const msg = {
      to: email,
      from: fromEmail,
      subject: `SIGEVIR - Resolución Judicial - ${datos.numero_expediente || ''}`,
      html,
    };

    const result = await sendWithRetry(msg);
    if (result.success) {
      await updateNotificacionEmailSent(notificacionId);
    }
    return result;
  }

  async sendPasswordRecovery(email, nombre, resetLink) {
    const html = loadTemplate('password-recovery', {
      nombre: nombre || 'Usuario',
      reset_link: resetLink,
      sistema_url: process.env.FRONTEND_URL || 'http://localhost:4001',
    });

    const msg = {
      to: email,
      from: fromEmail,
      subject: 'SIGEVIR - Recuperación de Contraseña',
      html,
    };

    return await sendWithRetry(msg);
  }

  async sendWelcomeNewUser(email, nombre, passwordTemporal, loginUrl) {
    const html = loadTemplate('welcome', {
      nombre: nombre || 'Usuario',
      password_temporal: passwordTemporal || '',
      login_url: loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:4001'}/login`,
      sistema_url: process.env.FRONTEND_URL || 'http://localhost:4001',
    });

    const msg = {
      to: email,
      from: fromEmail,
      subject: 'SIGEVIR - Bienvenido al Sistema',
      html,
    };

    return await sendWithRetry(msg);
  }

  async sendAlertaPermancenciaProlongada(email, datos, notificacionId = null) {
    const html = loadTemplate('resolucion', {
      nombre_responsable: datos.nombre_responsable || 'Usuario',
      numero_expediente: datos.numero_expediente || '',
      dominio: datos.dominio || '',
      tipo_resolucion: `ALERTA - ${datos.dias || '?'} días en depósito`,
      fecha_emision: `Acción requerida: el vehículo lleva ${datos.dias || '?'} días en depósito`,
      sistema_url: process.env.FRONTEND_URL || 'http://localhost:4001',
    });

    const msg = {
      to: email,
      from: fromEmail,
      subject: `SIGEVIR - Alerta: ${datos.dominio || ''} lleva ${datos.dias || '?'} días en depósito`,
      html,
    };

    const result = await sendWithRetry(msg);
    if (result.success) {
      await updateNotificacionEmailSent(notificacionId);
    }
    return result;
  }
  async sendAccountApproved(email, nombre, rol) {
    const html = loadTemplate('account-approved', {
      nombre: nombre || 'Usuario',
      rol: rol || 'Usuario',
      login_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
    });

    const msg = {
      to: email,
      from: fromEmail,
      subject: 'SIGEVIR - Tu cuenta ha sido aprobada',
      html,
    };

    return await sendWithRetry(msg);
  }

  async sendAccountRejected(email, nombre) {
    const html = loadTemplate('account-rejected', {
      nombre: nombre || 'Usuario',
    });

    const msg = {
      to: email,
      from: fromEmail,
      subject: 'SIGEVIR - Actualización sobre tu solicitud',
      html,
    };

    return await sendWithRetry(msg);
  }
}

export default new EmailService();
