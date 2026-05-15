import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Unauthorized() {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⛔</div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Acceso Denegado</h1>
        <p className="text-gray-600 mb-2">
          No tienes permisos para acceder a esta seccion.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Tu rol actual: <span className="font-bold text-gray-600">{role?.replace('_', ' ') || 'Desconocido'}</span>
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}