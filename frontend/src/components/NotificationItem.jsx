import { motion } from 'framer-motion';
import {
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineArrowDown,
  HiOutlineEye,
} from 'react-icons/hi';

const ICON_MAP = {
  NUEVA_RETENCION: { icon: HiOutlineShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
  CAMBIO_ESTADO: { icon: HiOutlineArrowDown, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  INGRESO_DEPOSITO: { icon: HiOutlineArrowDown, color: 'text-green-500', bg: 'bg-green-50' },
  RESOLUCION_JUDICIAL: { icon: HiOutlineDocumentText, color: 'text-purple-500', bg: 'bg-purple-50' },
  ALERTA_TIEMPO: { icon: HiOutlineExclamationCircle, color: 'text-red-500', bg: 'bg-red-50' },
  DOC_DISPONIBLE: { icon: HiOutlineDocumentText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const defaultIcon = { icon: HiOutlineClock, color: 'text-gray-500', bg: 'bg-gray-50' };

function getRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'hace unos segundos';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString('es-AR');
}

const NotificationItem = ({ notificacion, onConfirm }) => {
  const { id, tipo, mensaje, creada_at, leida_at, confirmada_at } = notificacion;
  const iconConfig = ICON_MAP[tipo] || defaultIcon;
  const IconComponent = iconConfig.icon;
  const isUnread = !leida_at;
  const isConfirmed = !!confirmada_at;
  const isCritical = tipo === 'ALERTA_TIEMPO';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border-b border-gray-100 transition-colors ${
        isUnread ? 'bg-blue-50/50' : 'bg-white'
      } ${isCritical && isUnread ? 'border-l-4 border-l-red-400' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconConfig.bg} flex-shrink-0`}>
          <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {tipo?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{mensaje}</p>
          <p className="text-[11px] text-gray-400 mt-1">{getRelativeTime(creada_at)}</p>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          {isConfirmed ? (
            <HiOutlineCheckCircle className="w-5 h-5 text-green-500" title="Confirmada" />
          ) : (
            <button
              onClick={() => onConfirm?.(id)}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Confirmar lectura"
            >
              <HiOutlineEye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
