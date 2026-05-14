import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que querés continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  loading = false,
}) => {
  const confirmStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onCancel}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-4 ${
                variant === 'danger' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <HiOutlineExclamationCircle className={`w-6 h-6 ${
                  variant === 'danger' ? 'text-red-500' : 'text-blue-500'
                }`} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 mb-6">{message}</p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${confirmStyles[variant] || confirmStyles.primary}`}
                >
                  {loading ? 'Procesando...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
