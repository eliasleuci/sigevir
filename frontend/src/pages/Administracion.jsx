import React, { useState } from 'react';
import { 
  HiOutlineUsers, 
  HiOutlineOfficeBuilding, 
  HiOutlineShieldCheck, 
  HiOutlineCog,
  HiOutlineDatabase
} from 'react-icons/hi';
import GestionUsuarios from '../components/admin/GestionUsuarios';
import VisorAuditoria from '../components/admin/VisorAuditoria';

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
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <div className="flex items-center gap-5 mb-4">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-200">
          <HiOutlineCog className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">Panel de Administración</h1>
          <p className="text-gray-500 font-medium italic">Configuración maestra del sistema SIGEVIR y control de seguridad.</p>
        </div>
      </div>

      {/* Navegación por Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-3xl border border-gray-100 shadow-xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 md:px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-y-[-2px]' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="min-h-[500px]">
        {activeTab === 'usuarios' && <GestionUsuarios />}
        
        {activeTab === 'instituciones' && (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
            <HiOutlineOfficeBuilding className="w-20 h-20 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Gestión de Instituciones</h3>
            <p className="text-gray-400 font-medium">Módulo en proceso de implementación para el próximo despliegue.</p>
          </div>
        )}

        {activeTab === 'auditoria' && <VisorAuditoria />}

        {['roles', 'config'].includes(activeTab) && (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
            <HiOutlineShieldCheck className="w-20 h-20 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Panel de Control</h3>
            <p className="text-gray-400 font-medium">Sección de configuración avanzada en desarrollo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Administracion;
