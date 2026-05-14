import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineBell } from 'react-icons/hi';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../hooks/useNotifications';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, confirmNotification, getUnreadCount } = useNotifications();
  const [displayCount, setDisplayCount] = useState(20);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setDisplayCount(20);
    }
  }, [isOpen]);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 20);
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.creada_at || 0) - new Date(a.creada_at || 0)
  );

  const visibleNotifications = sortedNotifications.slice(0, displayCount);
  const hasMore = displayCount < sortedNotifications.length;
  const unreadCount = getUnreadCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
          />

          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <HiOutlineBell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-red-100 text-red-600 rounded-full">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sortedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                  <HiOutlineBell className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">No hay notificaciones</p>
                  <p className="text-xs mt-1">Las nuevas notificaciones aparecerán aquí</p>
                </div>
              ) : (
                <>
                  {visibleNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notificacion={notif}
                      onConfirm={confirmNotification}
                    />
                  ))}
                  {hasMore && (
                    <div className="p-4 text-center">
                      <button
                        onClick={loadMore}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Cargar más notificaciones
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
