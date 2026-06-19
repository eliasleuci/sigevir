import React, { useState } from 'react';
import { HiOutlineUserCircle, HiOutlineChevronDown, HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from '../NotificationCenter';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, perfil } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <HiOutlineMenu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm relative">
          <HiOutlineSearch className="absolute left-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar vehículo, acta o expediente..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm outline-none border hover:border-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <NotificationCenter />

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 lg:gap-3 p-1.5 hover:bg-gray-50 rounded-xl transition-all"
          >
            {perfil?.avatar_url ? (
              <img src={perfil.avatar_url} alt="avatar" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm lg:text-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'Usuario'}</p>
              <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">{user?.role?.replace('_', ' ')}</p>
            </div>
            <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Institución</p>
                <p className="text-sm font-bold text-gray-700 truncate">{user?.Institucion?.nombre || 'Sede Central'}</p>
              </div>
              <button onClick={() => navigate('/perfil')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left">
                <HiOutlineUserCircle className="w-5 h-5" />
                Mi Perfil
              </button>
              <div className="h-px bg-gray-50 my-1"></div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
