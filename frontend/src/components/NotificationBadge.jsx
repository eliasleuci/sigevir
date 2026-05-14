import { motion, AnimatePresence } from 'framer-motion';

const NotificationBadge = ({ count = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-all group"
      aria-label="Notificaciones"
    >
      <svg
        className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white border-2 border-white px-1 ${
              count > 0 ? 'bg-red-500' : 'bg-gray-400'
            }`}
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default NotificationBadge;
