import React from 'react';
import { HiOutlineChevronRight, HiOutlineDownload, HiOutlineEye, HiOutlinePrinter } from 'react-icons/hi';

const TablaResultados = ({ resultados = [], onSelect, onExport, loading }) => {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="p-4 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Resultados Obtenidos</h3>
          <p className="text-sm text-gray-500 font-medium">Se encontraron {resultados.length} vehículos bajo los criterios seleccionados.</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => onExport('csv')}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <HiOutlineDownload className="w-5 h-5 text-blue-500" />
            Exportar CSV
          </button>
          <button 
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <HiOutlinePrinter className="w-5 h-5 text-gray-400" />
            Imprimir
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-gray-50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehículo / Patente</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expediente</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Registro</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-8 py-6 h-20 bg-gray-50/10"></td>
                </tr>
              ))
            ) : resultados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-4">
                      <HiOutlineEye className="w-10 h-10" />
                    </div>
                    <p className="text-gray-400 font-bold italic text-lg">No hay datos que coincidan con la búsqueda.</p>
                    <p className="text-sm text-gray-300 mt-1">Ajusta los filtros e intenta nuevamente.</p>
                  </div>
                </td>
              </tr>
            ) : (
              resultados.map((v) => (
                <tr 
                  key={v.id} 
                  onClick={() => onSelect(v)}
                  className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:bg-blue-600 transition-colors">
                        {v.dominio?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">{v.dominio}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{v.marca} {v.modelo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block">{v.numero_expediente || 'S/N'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-700">{v.fecha_retencion ? new Date(v.fecha_retencion).toLocaleDateString() : 'S/D'}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{v.fecha_retencion ? new Date(v.fecha_retencion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 'hs' : ''}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      v.estado_actual === 'LIBERADO' ? 'bg-green-50 text-green-600 border-green-100' : 
                      v.estado_actual === 'RESOLUCION_PENDIENTE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {v.estado_actual?.replace(/_/g, ' ') || 'S/D'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-900">{v.localidad ? `${v.localidad}, ${v.provincia}` : 'Sin ubicación asignada'}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v.institucion || 'Institución S/D'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-blue-200">
                      <HiOutlineChevronRight className="w-6 h-6" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación Placeholder */}
      <div className="p-4 sm:p-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/10 text-sm font-bold text-gray-500 uppercase tracking-widest">
        <span>Mostrando {resultados.length} resultados</span>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30" disabled>Anterior</button>
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30" disabled>Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default TablaResultados;
