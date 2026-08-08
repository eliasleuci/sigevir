import React, { useState } from 'react';
import { HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineShieldCheck, HiOutlineCog, HiOutlineDatabase } from 'react-icons/hi';
import GestionUsuariosPage from './admin/GestionUsuariosPage';
import GestionRoles from '../components/admin/GestionRoles';
import VisorAuditoria from '../components/admin/VisorAuditoria';
import GestionInstituciones from '../components/admin/GestionInstituciones';
import GestionConfiguraciones from '../components/admin/GestionConfiguraciones';

const Administracion = () => {
  const [activeTab, setActiveTab] = useState('usuarios');

  const tabs = [
    { id: 'usuarios', name: 'Usuarios y Personal', icon: HiOutlineUsers },
    { id: 'instituciones', name: 'Instituciones', icon: HiOutlineOfficeBuilding },
    { id: 'roles', name: 'Roles y Permisos', icon: HiOutlineShieldCheck },
    { id: 'auditoria', name: 'Auditoría', icon: HiOutlineDatabase },
    { id: 'config', name: 'Configuración', icon: HiOutlineCog },
  ];

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-8 px-2 md:px-4 space-y-6 md:space-y-12">
      <div className="flex flex-row items-center gap-3 md:gap-5 mb-2 md:mb-4">
        <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-200">
          <HiOutlineCog className="w-6 h-6 md:w-10 md:h-10" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none mb-1 md:mb-2">Panel de Administración</h1>
          <p className="text-xs md:text-base text-gray-500 font-medium italic">Configuración maestra del sistema SIGEVIR y control de seguridad.</p>
        </div>
      </div>

      <div className="w-full flex gap-1.5 md:gap-2 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center gap-1.5 md:gap-3 px-3 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 sm:translate-y-[-2px]'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className={`w-4 h-4 md:w-6 md:h-6 ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'usuarios' && <GestionUsuariosPage />}
        {activeTab === 'instituciones' && <GestionInstituciones />}
        {activeTab === 'auditoria' && <VisorAuditoria />}
        {activeTab === 'roles' && <GestionRoles />}
        {activeTab === 'config' && <GestionConfiguraciones />}
      </div>
    </div>
  );
};

export default Administracion;
