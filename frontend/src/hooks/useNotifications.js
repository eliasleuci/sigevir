// ════════════════════════════════════════════════════════════════════════════════
// useNotifications Hook
// Acceso simplificado al contexto de notificaciones
// ════════════════════════════════════════════════════════════════════════════════

import { useContext, useMemo } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }

  const {
    socket,
    notifications,
    isConnected,
    confirmNotification,
    markAsRead,
    getUnreadCount,
  } = context;

  const sortedNotifications = useMemo(() => {
    return [...(notifications || [])].sort(
      (a, b) => new Date(b.creada_at || 0) - new Date(a.creada_at || 0)
    );
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return getUnreadCount?.() ?? 0;
  }, [notifications, getUnreadCount]);

  const recentNotifications = useMemo(() => {
    return sortedNotifications.slice(0, 5);
  }, [sortedNotifications]);

  return {
    socket,
    notifications,
    sortedNotifications,
    recentNotifications,
    unreadCount,
    isConnected,
    confirmNotification,
    markAsRead,
    getUnreadCount,
  };
};
