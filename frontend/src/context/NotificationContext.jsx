import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';
import apiClient from '../services/apiClient.js';
// Se mantiene react-hot-toast para los toasts personalizados
import Toast from '../components/notifications/Toast';
export const NotificationContext = createContext();

const DEMO_NOTIFICATIONS = [
  { id: 1, mensaje: 'Bienvenido al modo demo de SIGEVIR', tipo: 'info', created_at: new Date().toISOString() },
  { id: 2, mensaje: 'Puedes explorar todos los modulos libremente', tipo: 'info', created_at: new Date().toISOString() },
];

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated, isMock } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isMock || !token) return;
    
    const cargarNotificacionesIniciales = async () => {
      try {
        const { data } = await apiClient.get('/notificaciones?limit=20');
        if (data?.data?.notificaciones) {
          setNotifications(data.data.notificaciones);
        }
      } catch (error) {
        console.error('Error cargando notificaciones iniciales:', error);
      }
    };
    
    cargarNotificacionesIniciales();
  }, [isAuthenticated, isMock, token]);

  useEffect(() => {
    if (isMock) {
      setNotifications(DEMO_NOTIFICATIONS);
      setIsConnected(true);
      return;
    }
    if (isAuthenticated && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const socketNamespace = '/notifications';
      const newSocket = io(`${socketUrl}${socketNamespace}`, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('notificaciones_pendientes', (notificaciones) => {
        setNotifications(notificaciones);
      });

      newSocket.on('nueva_notificacion', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        // Use a custom toast with premium styling
        toast.custom((t) => <Toast notification={notification} toast={t} />, {
          duration: 5000,
          position: 'bottom-right',
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token, isMock]);

  const confirmNotification = useCallback((id) => {
    if (socket && !isMock) {
      socket.emit('confirmar_notificacion', { notificacion_id: id });
    }
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, confirmada_at: new Date().toISOString() } : n)
    );
  }, [socket, isMock]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.confirmada_at && !n.read).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider 
      value={{ 
        socket, 
        notifications, 
        isConnected,
        confirmNotification,
        markAsRead,
        getUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
