import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../config/supabase';
import { HiOutlineChartBar, HiOutlineClipboardList, HiOutlineServer, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';

const ESTADOS_MAP = {
  RETENIDO: { label: 'Retenidos', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  EN_DEPOSITO: { label: 'En Deposito', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  RESOLUCION_PENDIENTE: { label: 'Pendientes', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  LIBERADO: { label: 'Liberados', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  SUBASTADO: { label: 'Subastados', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  COMPACTADO: { label: 'Compactados', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' },
};

const DEMO_DATA = {
  resumen: { total: 156, totalMovimientos: 1240 },
  porEstado: [
    { estado: 'RETENIDO', cantidad: 45 },
    { estado: 'EN_DEPOSITO', cantidad: 62 },
    { estado: 'RESOLUCION_PENDIENTE', cantidad: 18 },
    { estado: 'LIBERADO', cantidad: 22 },
    { estado: 'SUBASTADO', cantidad: 5 },
    { estado: 'COMPACTADO', cantidad: 4 },
  ],
  porMes: [
    { mes: '2025-06', cantidad: 8 },
    { mes: '2025-07', cantidad: 12 },
    { mes: '2025-08', cantidad: 10 },
    { mes: '2025-09', cantidad: 15 },
    { mes: '2025-10', cantidad: 14 },
    { mes: '2025-11', cantidad: 18 },
    { mes: '2025-12', cantidad: 11 },
    { mes: '2026-01', cantidad: 9 },
    { mes: '2026-02', cantidad: 13 },
    { mes: '2026-03', cantidad: 16 },
    { mes: '2026-04', cantidad: 20 },
    { mes: '2026-05', cantidad: 10 },
  ],
  ultimas: [
    { id: 1, expediente: 'RET-2026-0156', dominio: 'AB123CD', marca: 'Toyota', modelo: 'Corolla', estado: 'EN_DEPOSITO', fecha: new Date().toISOString(), direccion: 'Av. Colon 500, Cordoba' },
    { id: 2, expediente: 'RET-2026-0155', dominio: 'XYZ789', marca: 'Ford', modelo: 'Fiesta', estado: 'RETENIDO', fecha: new Date(Date.now() - 86400000).toISOString(), direccion: '25 de Mayo 300, Cordoba' },
    { id: 3, expediente: 'RET-2026-0154', dominio: 'DEF456', marca: 'Volkswagen', modelo: 'Gol', estado: 'LIBERADO', fecha: new Date(Date.now() - 172800000).toISOString(), direccion: 'Av. Velez Sarsfield 100, Cordoba' },
  ]
};

const Reportes = () => {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setData(DEMO_DATA);
        setLoading(false);
        return;
      }
      const res = await apiClient.get('/reportes');
      setData(res.data.data);
    } catch {
      setData(DEMO_DATA);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <HiOutlineChartBar className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-medium">Cargando estadisticas...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxMes = Math.max(...(data.porMes?.map(m => m.cantidad) || [1]), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reportes</h1>
        <p className="text-gray-500 font-medium mt-1">Estadisticas y metricas del sistema.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: HiOutlineClipboardList, label: 'Total Retenciones', value: data.resumen.total, color: 'blue' },
          { icon: HiOutlineServer, label: 'En Deposito', value: data.porEstado?.find(e => e.estado === 'EN_DEPOSITO')?.cantidad || 0, color: 'indigo' },
          { icon: HiOutlineCheckCircle, label: 'Liberados', value: data.porEstado?.find(e => e.estado === 'LIBERADO')?.cantidad || 0, color: 'green' },
          { icon: HiOutlineClock, label: 'Movimientos', value: data.resumen.totalMovimientos, color: 'purple' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${card.color}-50 text-${card.color}-600`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Retenciones por Mes</h3>
          <div className="space-y-3">
            {data.porMes?.map(m => {
              const pct = Math.round((m.cantidad / maxMes) * 100);
              return (
                <div key={m.mes} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-16 shrink-0">
                    {m.mes.slice(0, 7)}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-gray-700 w-8 text-right">{m.cantidad}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Estado Actual</h3>
          <div className="space-y-4">
            {data.porEstado?.map(e => {
              const estado = ESTADOS_MAP[e.estado] || { label: e.estado, color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };
              const pct = data.resumen.total > 0 ? Math.round((e.cantidad / data.resumen.total) * 100) : 0;
              return (
                <div key={e.estado}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${estado.color}`}></span>
                      <span className="text-sm font-semibold text-gray-700">{estado.label}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{e.cantidad} ({pct}%)</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${estado.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Ultimas Retenciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expediente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dominio</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehiculo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicacion</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.ultimas?.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-blue-600">{r.expediente}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-gray-900">{r.dominio}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600">{r.marca} {r.modelo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      ESTADOS_MAP[r.estado]?.bgLight || 'bg-gray-50'
                    } ${ESTADOS_MAP[r.estado]?.textColor || 'text-gray-600'}`}>
                      {ESTADOS_MAP[r.estado]?.label || r.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">{r.direccion}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">{new Date(r.fecha).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
