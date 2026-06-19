import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import routes from './routes/index.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import { setupSocketIO } from './setup/socket.js';
import checkPermanenciaProlongada from './jobs/checkPermanenciaProlongada.js';
import { validateEnv } from './utils/validateEnv.js';

// Cargar variables de entorno
dotenv.config();
validateEnv();

const app = express();

// ── Rate Limiting ──────────────────────────────────────────────────────────
// Límite general: 100 requests por IP cada 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes desde esta IP. Intentá de nuevo en 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  skip: (req) => process.env.NODE_ENV === 'development' && req.headers['x-demo-mode'],
});

// Límite estricto para autenticación: 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos. Cuenta bloqueada temporalmente por 15 minutos.',
      code: 'AUTH_RATE_LIMIT'
    }
  },
});

// Límite para subida de archivos: 20 uploads por hora
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      message: 'Límite de subida de archivos alcanzado. Intentá en 1 hora.',
      code: 'UPLOAD_RATE_LIMIT'
    }
  },
});

// Aplicar rate limiters
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
// ──────────────────────────────────────────────────────────────────────────

// 1. Middlewares de Seguridad
// ── Headers de Seguridad (Helmet) ─────────────────────────────────────────
app.use(helmet({
  // HTTP Strict Transport Security: forzar HTTPS por 1 año
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  // Política de seguridad de contenido
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https:"],
      connectSrc:  [
        "'self'",
        process.env.SUPABASE_URL || '',
        'https://*.supabase.co',
      ].filter(Boolean),
      fontSrc:     ["'self'", "https:", "data:"],
      objectSrc:   ["'none'"],
      frameAncestors: ["'none'"],
    },
    // En desarrollo desactivar CSP para no bloquear Vite HMR
    reportOnly: process.env.NODE_ENV !== 'production',
  },
  // No exponer el framework usado
  hidePoweredBy: true,
  // Prevenir clickjacking
  frameguard: { action: 'deny' },
  // Prevenir sniffing de MIME types
  noSniff: true,
  // Prevenir ataques XSS en IE
  xssFilter: true,
}));
// ──────────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 2. Middlewares de Parsing y Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Sanitización XSS ───────────────────────────────────────────────────────
// Limpiar todos los strings del body para prevenir inyección de scripts
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (typeof val === 'string') {
      sanitized[key] = xss(val.trim());
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeObject(val);
    } else {
      sanitized[key] = val;
    }
  });
  return sanitized;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
});
// ──────────────────────────────────────────────────────────────────────────

// Logging de requests HTTP con Morgan redirigido a Winston
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// 3. Conexión a Base de Datos
connectDB();

// ── HTTPS Obligatorio en Producción ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.header('x-forwarded-proto');
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
// ──────────────────────────────────────────────────────────────────────────

// 4. Rutas Base / Health Check
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 5. Manejo de Rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.originalUrl}`,
      code: 'NOT_FOUND'
    }
  });
});

// 6. Manejo Global de Errores (Siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 4001;

const httpServer = createServer(app);
const io = setupSocketIO(httpServer);

const cronSchedule = process.env.CRON_SCHEDULE || '0 8 * * *';
const cronEnabled = process.env.CRON_ENABLED !== 'false';

if (cronEnabled) {
  cron.schedule(cronSchedule, async () => {
    logger.info(`[CRON] Ejecutando verificación de permanencias prolongadas (schedule: ${cronSchedule})`);
    const resultado = await checkPermanenciaProlongada.execute();
    if (!resultado.success) {
      logger.error(`[CRON] Error en verificación: ${resultado.error}`);
    }
  });
  logger.info(`✅ Cron job iniciado: checkPermanenciaProlongada (${cronSchedule})`);
} else {
  logger.info('⏸️ Cron job deshabilitado (CRON_ENABLED=false)');
}

httpServer.listen(PORT, () => {
  logger.info(`🚀 Servidor HTTP y WebSocket SIGEVIR corriendo en puerto ${PORT} [${process.env.NODE_ENV}]`);
});

// Manejo de cierres limpios y errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Apagando...', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Apagando...', err);
  process.exit(1);
});

export default app;
