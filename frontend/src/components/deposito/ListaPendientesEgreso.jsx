import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineClock, HiOutlineChevronRight, HiOutlineFilter } from 'react-icons/hi';

const ListaPendientesEgreso = ({ vehiculos, onSelect, loading }) => {
  const [filter, setFilter] = useState('');

  const filteredVehiculos = vehiculos.filter(v => 
    v.dominio.toLowerCase().includes(filter.toLowerCase()) || 
    v.nro_expediente.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Filtrar por patente o expediente..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <HiOutlineFilter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Vehículo</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Expediente</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ubicación</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Estado Actual</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Días en Depósito</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6 h-16 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredVehiculos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                    No hay vehículos pendientes de egreso que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredVehiculos.map((v) => (
                  <tr 
                    key={v.id} 
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => onSelect(v)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs">
                          {v.tipo_vehiculo?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase">{v.dominio}</p>
                          <p className="text-xs text-gray-500">{v.marca} {v.modelo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-600 tracking-tight">{v.nro_expediente}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-600 uppercase">Sector {v.sector || 'S/D'}</span>
                        <span className="text-xs font-bold text-gray-500">Fila {v.fila} - Espacio {v.espacio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        v.estado === 'RESOLUCION_PENDIENTE' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                        : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {v.estado?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <HiOutlineClock className="w-4 h-4 text-gray-400" />
                        {Math.floor((new Date() - new Date(v.fecha_ingreso)) / (1000 * 60 * 60 * 24))} días
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-200">
                        <HiOutlineChevronRight className="w-5 h-5" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaPendientesEgreso;
