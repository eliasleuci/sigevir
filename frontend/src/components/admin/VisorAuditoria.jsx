import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineClock, HiOutlineFilter, HiOutlineDownload, HiOutlineExclamationCircle } from 'react-icons/hi';
import apiClient from '../../services/apiClient';
import { isSupabaseConfigured } from '../../config/supabase';
import { toast } from 'react-toastify';

const DEMO_LOGS = [
  { id: 1, tipo_movimiento: 'RETENCION', origen: 'Retencion', destino: 'En Deposito', fecha_hora: new Date(Date.now() - 3600000).toISOString(), observaciones: 'Ingreso al deposito municipal', usuario_nombre: 'Oficial Perez' },
  { id: 2, tipo_movimiento: 'INGRESO_DEPOSITO', origen: 'Via publica', destino: 'Deposito', fecha_hora: new Date(Date.now() - 7200000).toISOString(), observaciones: 'Confirmacion de ingreso', usuario_nombre: 'Juan Deposito' },
  { id: 3, tipo_movimiento: 'RESOLUCION', origen: 'En Deposito', destino: 'Liberado', fecha_hora: new Date(Date.now() - 86400000).toISOString(), observaciones: 'Resolucion judicial de liberacion', usuario_nombre: 'Dra. Rodriguez' },
];

const VisorAuditoria = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setLogs(DEMO_LOGS);
        setLoading(false);
        return;
      }
      const response = await apiClient.get('/admin/logs');
      const data = response.data?.data;
      setLogs(data?.items || []);
    } catch (error) {
      toast.error('Error al cargar logs de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Historial de Auditoria</h3>
          <p className="text-sm text-gray-500 font-medium">Registro inmutable de todas las acciones criticas realizadas en el sistema.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all">
          <HiOutlineDownload className="w-5 h-5" />
          Descargar Reporte PDF
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="relative w-full md:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Filtrar..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500">
              <HiOutlineFilter className="w-4 h-4" />
              Mas Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Accion / Evento</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Origen</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(function(log) {
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <HiOutlineClock className="w-4 h-4 text-gray-300" />
                        {new Date(log.fecha_hora || log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-gray-700 uppercase">{log.usuario_nombre || log.Usuario?.nombre || 'SISTEMA'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-600 rounded-full uppercase tracking-widest">
                        {(log.tipo_movimiento || log.accion || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-blue-600">{log.origen || log.dominio || '-'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-gray-500 font-medium italic">{log.observaciones ? '"' + log.observaciones + '"' : '-'}</p>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <HiOutlineExclamationCircle className="w-12 h-12 text-gray-200 mb-2" />
                      <p className="text-gray-400 italic">No hay registros de auditoria que mostrar.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisorAuditoria;