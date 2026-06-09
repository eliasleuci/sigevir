import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import routes from './routes/index.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import { setupSocketIO } from './setup/socket.js';
import checkPermanenciaProlongada from './jobs/checkPermanenciaProlongada.js';

// Cargar variables de entorno
dotenv.config();

const app = express();

// 1. Middlewares de Seguridad
app.use(helmet()); // Seguridad de headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 2. Middlewares de Parsing y Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging de requests HTTP con Morgan redirigido a Winston
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// 3. Conexión a Base de Datos
connectDB();

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
