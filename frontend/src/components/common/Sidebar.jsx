import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineClipboardList, 
  HiOutlineSearch, 
  HiOutlineOfficeBuilding, 
  HiOutlineDocumentText, 
  HiOutlineUsers,
  HiOutlineLogout,
  HiX
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome, roles: ['ADMIN_GENERAL', 'ADMIN_INSTITUCION', 'AGENTE_CAMPO', 'FISCAL_JUEZ', 'DEPOSITO', 'CONTROLADOR'] },
    { name: 'Nueva Retención', path: '/retenciones/nueva', icon: HiOutlineClipboardList, roles: ['ADMIN_GENERAL', 'ADMIN_INSTITUCION', 'AGENTE_CAMPO'] },
    { name: 'Búsqueda', path: '/busqueda', icon: HiOutlineSearch, roles: ['ADMIN_GENERAL', 'ADMIN_INSTITUCION', 'FISCAL_JUEZ', 'CONTROLADOR'] },
    { name: 'Ingreso Depósito', path: '/deposito/ingreso', icon: HiOutlineOfficeBuilding, roles: ['ADMIN_GENERAL', 'ADMIN_INSTITUCION', 'DEPOSITO'] },
    { name: 'Causas Judiciales', path: '/judicial/causas', icon: HiOutlineDocumentText, roles: ['ADMIN_GENERAL', 'FISCAL_JUEZ'] },
    { name: 'Administración', path: '/admin', icon: HiOutlineUsers, roles: ['ADMIN_GENERAL', 'ADMIN_INSTITUCION'] },
  ];

  const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(role));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        h-screen w-64 bg-slate-900 text-white
        flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icono-de-la-app.jpeg" alt="SIGEVIR" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 object-cover" />
            <span className="text-xl font-extrabold tracking-tight">SIGEVIR</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110`} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 font-medium group"
          >
            <HiOutlineLogout className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
