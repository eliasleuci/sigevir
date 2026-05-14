import { Server } from 'socket.io';
import { socketAuth } from '../middleware/socketAuth.js';
import { registerSocketEvents } from '../events/socket.events.js';
import socketService from '../services/socketService.js';
import logger from '../utils/logger.js';

export const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
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
