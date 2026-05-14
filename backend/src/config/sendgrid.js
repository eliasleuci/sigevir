import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const fromEmail = {
  email: process.env.SENDGRID_FROM_EMAIL || 'noreply@sigevir.com',
  name: 'Sistema SIGEVIR',
};

export const emailConfig = {
  enabled: !!process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'tu_sendgrid_api_key',
};

export default sgMail;
