// ════════════════════════════════════════════════════════════════════════════════
// Dashboard.jsx - Dashboard Principal Interactiva
// ════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { 
  HiOutlineClipboardList, 
  HiOutlineCamera, 
  HiOutlineSearch, 
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineCog
} from 'react-icons/hi';
import { FaGavel } from 'react-icons/fa';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { notifications, getUnreadCount } = useNotifications();

  const unreadCount = getUnreadCount();

  const modules = [
    {
      title: 'Registrar Retención',
      description: 'Crear un nuevo registro de vehículo retenido',
      icon: HiOutlineClipboardList,
      path: '/retenciones/nueva',
      color: 'blue'
    },
    {
      title: 'Confirmar Ingreso',
      description: 'Escanear QR y confirmar ingreso al depósito',
      icon: HiOutlineCamera,
      path: '/deposito/ingreso',
      color: 'indigo'
    },
    {
      title: 'Gestión de Causas',
      description: 'Buscar y resolver causas judiciales',
      icon: FaGavel,
      path: '/judicial/causas',
      color: 'amber'
    },
    {
      title: 'Búsqueda Avanzada',
      description: 'Buscar vehículos por múltiples criterios',
      icon: HiOutlineSearch,
      path: '/busqueda',
      color: 'slate'
    },
    {
      title: 'Administración',
      description: 'Gestionar usuarios e instituciones',
      icon: HiOutlineCog,
      path: '/admin',
      color: 'gray'
    },
    {
      title: 'Reportes',
      description: 'Ver estadísticas y generar reportes',
      icon: HiOutlineChartBar,
      path: '/dashboard', // Temporalmente redirige aquí
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50 pb-12 font-sans">
      {/* Header Premium */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/icono-de-la-app.jpeg" alt="SIGEVIR" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 object-cover" />
            <h1 className="text-xl font-black text-gray-900 tracking-tight">SIGEVIR</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Notificaciones */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                <HiOutlineBell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Perfil Usuario */}
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {user?.nombre_completo || 'Administrador'}
                </p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                  {user?.rol?.replace('_', ' ') || 'MODO DEMO'}
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-blue-600 rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20 flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              ¡Bienvenido, {user?.nombre_completo?.split(' ')[0] || 'Hola'}!
            </h2>
            <p className="text-blue-100 text-lg font-medium max-w-xl">
              Sistema Integral de Gestión de Vehículos Retenidos. 
              Selecciona un módulo para comenzar tu jornada.
            </p>
          </div>
          <div className="hidden md:block opacity-20 transform rotate-12">
            <HiOutlineChartBar className="w-64 h-64" />
          </div>
          {/* Círculos decorativos */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Grid de Módulos Interactivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {modules.map((module, idx) => (
            <Link 
              key={idx} 
              to={module.path}
              className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden"
            >
              <div className={`w-16 h-16 rounded-2xl bg-${module.color}-50 text-${module.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <module.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{module.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {module.description}
              </p>
              
              {/* Flecha indicativa que aparece al hover */}
              <div className="mt-6 flex items-center text-blue-600 font-black text-xs uppercase tracking-widest opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-[-10px] md:group-hover:translate-x-0">
                Entrar al módulo ➜
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
