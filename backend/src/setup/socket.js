import { Server } from 'socket.io';
import { socketAuth } from '../middleware/socketAuth.js';
import { registerSocketEvents } from '../events/socket.events.js';
import socketService from '../services/socketService.js';
import logger from '../utils/logger.js';

export const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      // Aceptar el puerto real del frontend
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:4001',
        'http://localhost:4001',
        'http://localhost:5173',  // fallback por si cambia
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Reconexión automática
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Inicializar el servicio de sockets para que pueda ser llamado desde controladores
  socketService.init(io);

  const notificationsNamespace = io.of('/notifications');

  // Aplicar middleware de autenticación
  notificationsNamespace.use(socketAuth);

  // Manejar conexiones
  notificationsNamespace.on('connection', (socket) => {
    // El objeto socket.user fue inyectado por el middleware socketAuth
    logger.info(`Nueva conexión WebSocket autenticada: Usuario ${socket.user.userId}`);
    
    // Registrar todos los manejadores de eventos para este socket
    registerSocketEvents(io, socket);
  });

  return io;
};
