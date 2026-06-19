import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';

const TIPO_CONFIG = {
  NUEVA_RETENCION:     { emoji: '🚗', color: 'blue',   label: 'Nueva retención' },
  INGRESO_DEPOSITO:    { emoji: '🏭', color: 'green',  label: 'Ingreso al depósito' },
  RESOLUCION_JUDICIAL: { emoji: '⚖️', color: 'purple', label: 'Resolución judicial' },
  EGRESO_VEHICULO:     { emoji: '✅', color: 'teal',   label: 'Vehículo entregado' },
  USUARIO_PENDIENTE:   { emoji: '👤', color: 'amber',  label: 'Usuario pendiente' },
  ALERTA_TIEMPO:       { emoji: '⚠️', color: 'red',    label: 'Alerta permanencia' },
  CAMBIO_ESTADO:       { emoji: '🔄', color: 'gray',   label: 'Cambio de estado' },
  DOC_DISPONIBLE:      { emoji: '📄', color: 'blue',   label: 'Documento disponible' },
};

const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    sortedNotifications,
    unreadCount,
    confirmNotification,
    markAsRead,
    isConnected,
  } = useNotifications();

  if (!isOpen) return null;

  const marcarTodasLeidas = () => {
    sortedNotifications
      .filter(n => !n.leida_at && !n.read)
      .forEach(n => markAsRead(n.id));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute -right-16 sm:right-0 top-12 w-[320px] sm:w-96 bg-white rounded-2xl shadow-2xl
        border border-gray-100 z-50 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
          border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold
                px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador de conexión */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs text-gray-400">
                {isConnected ? 'En línea' : 'Reconectando...'}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas leídas
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="max-h-96 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-4xl mb-3">🔔</span>
              <p className="text-sm font-medium">Sin notificaciones</p>
              <p className="text-xs mt-1">Todo al día por aquí</p>
            </div>
          ) : (
            sortedNotifications.map(notif => {
              const config = TIPO_CONFIG[notif.tipo] || TIPO_CONFIG.CAMBIO_ESTADO;
              const esNoLeida = !notif.leida_at && !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50
                    hover:bg-gray-50 transition cursor-pointer
                    ${esNoLeida ? 'bg-blue-50/40' : ''}`}
                  onClick={() => {
                    markAsRead(notif.id);
                    confirmNotification(notif.id);
                  }}
                >
                  {/* Emoji */}
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {config.emoji}
                  </span>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase
                      tracking-wide mb-0.5">
                      {config.label}
                    </p>
                    <p className="text-sm text-gray-700 leading-snug">
                      {notif.mensaje}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleString('es-AR', {
                            day: '2-digit', month: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : 'Ahora'}
                    </p>
                  </div>

                  {/* Punto de no leída */}
                  {esNoLeida && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {sortedNotifications.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400 text-center">
              Mostrando las últimas {sortedNotifications.length} notificaciones
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
