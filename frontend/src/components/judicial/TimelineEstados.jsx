import React from 'react';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineUser } from 'react-icons/hi';

const TimelineEstados = ({ logs = [] }) => {
  if (logs.length === 0) return null;

  // Ordenar logs por fecha descendente
  const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
      {sortedLogs.map((log, index) => (
        <div key={log.id} className="relative animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
          {/* Indicador de Punto */}
          <div className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
            index === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-300'
          }`}>
            {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${
            index === 0 ? 'bg-white border-blue-100 shadow-xl shadow-blue-50' : 'bg-gray-50/50 border-gray-100 opacity-80'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {log.estado_nuevo?.replace('_', ' ')}
                </span>
                <span className="text-gray-300 text-xs font-bold">←</span>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  {log.estado_anterior?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                <HiOutlineClock className="w-4 h-4" />
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>

            {log.observaciones && (
              <p className="text-sm text-gray-600 leading-relaxed italic mb-4 bg-white/50 p-3 rounded-xl border border-gray-50">
                "{log.observaciones}"
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
              <HiOutlineUser className="w-4 h-4" />
              Responsable: <span className="text-gray-600">{log.Usuario?.nombre || 'Sistema Automático'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineEstados;
