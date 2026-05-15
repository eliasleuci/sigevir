import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';
import { toast } from 'react-toastify';

export const NotificationContext = createContext();

const DEMO_NOTIFICATIONS = [
  { id: 1, mensaje: 'Bienvenido al modo demo de SIGEVIR', tipo: 'info', created_at: new Date().toISOString() },
  { id: 2, mensaje: 'Puedes explorar todos los modulos libremente', tipo: 'info', created_at: new Date().toISOString() },
];

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated, isDemo } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setNotifications(DEMO_NOTIFICATIONS);
      setIsConnected(true);
      return;
    }
    if (isAuthenticated && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const newSocket = io(socketUrl, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast.info(notification.mensaje || notification.message || 'Nueva notificacion');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token, isDemo]);

  const confirmNotification = useCallback((id) => {
    if (socket && !isDemo) {
      socket.emit('confirmar_notificacion', { notificacion_id: id });
    }
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, confirmada_at: new Date().toISOString() } : n)
    );
  }, [socket, isDemo]);

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
