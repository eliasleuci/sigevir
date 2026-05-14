import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineDocumentText, HiOutlineIdentification, HiOutlineHashtag } from 'react-icons/hi';

const BuscadorCausas = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState({
    nro_expediente: '',
    dominio: '',
    titular_dni: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6 animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <HiOutlineSearch className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Buscador de Causas Judiciales</h3>
      </div>
      
      <p className="text-sm text-gray-500 font-medium">Ingresa al menos uno de los campos para localizar el expediente judicial.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1 relative">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nro. Expediente</label>
          <div className="relative">
            <HiOutlineHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="text" 
              value={filters.nro_expediente}
              onChange={(e) => setFilters({...filters, nro_expediente: e.target.value})}
              placeholder="000-000000"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dominio / Patente</label>
          <div className="relative">
            <HiOutlineDocumentText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="text" 
              value={filters.dominio}
              onChange={(e) => setFilters({...filters, dominio: e.target.value.toUpperCase()})}
              placeholder="PATENTE"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-black text-gray-900 uppercase tracking-widest"
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DNI del Titular</label>
          <div className="relative">
            <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="text" 
              value={filters.titular_dni}
              onChange={(e) => setFilters({...filters, titular_dni: e.target.value})}
              placeholder="Sin puntos"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
            />
          </div>
        </div>

        <div className="md:col-span-3 flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={() => setFilters({ nro_expediente: '', dominio: '', titular_dni: '' })}
            className="px-6 md:px-8 py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
          >
            Limpiar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-8 md:px-12 py-3 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar Causa'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuscadorCausas;
