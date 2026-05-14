import React from 'react';
import { HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const GestionInstituciones = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Instituciones del Sistema</h3>
          <p className="text-sm text-gray-500 font-medium">Gestión de sedes, jurisdicciones y tipos de organismos (Tránsito, Policía, Juzgados).</p>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Nueva Institución
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 1, nombre: 'Juzgado de Faltas Nro. 1', tipo: 'JUZGADO', jurisdiction: 'Sede Central' },
          { id: 2, nombre: 'Dirección de Tránsito', tipo: 'CONTROL_VIAL', jurisdiction: 'Zona Norte' },
          { id: 3, nombre: 'Depósito Municipal San Luis', tipo: 'DEPOSITO', jurisdiction: 'Parque Industrial' },
        ].map((inst) => (
          <div key={inst.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center font-black mb-6 transition-all">
                <HiOutlineOfficeBuilding className="w-8 h-8" />
              </div>
              
              <h4 className="text-xl font-black text-gray-900 tracking-tight mb-1">{inst.nombre}</h4>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">{inst.tipo}</p>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">{inst.jurisdiction}</span>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionInstituciones;
