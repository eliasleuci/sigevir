import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';
import { toast } from 'react-toastify';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const newSocket = io(socketUrl, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket conectado');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket desconectado');
        setIsConnected(false);
      });

      newSocket.on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast.info(notification.mensaje || notification.message || 'Nueva notificación');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  const confirmNotification = useCallback((id) => {
    if (socket) {
      socket.emit('confirmar_notificacion', { notificacion_id: id });
    }
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, confirmada_at: new Date().toISOString() } : n)
    );
  }, [socket]);

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
