import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';
import NotificationPanel from './NotificationPanel';

const NotificationCenter = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { getUnreadCount, isConnected } = useNotifications();
  const unreadCount = getUnreadCount();

  return (
    <div className="relative">
      <div className="relative">
        <NotificationBadge
          count={unreadCount}
          onClick={() => setIsPanelOpen((prev) => !prev)}
        />
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white" title="Desconectado" />
        )}
        {isConnected && (
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" title="Conectado" />
        )}
      </div>

      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};

export default NotificationCenter;
