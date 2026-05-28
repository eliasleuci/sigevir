import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineSearch, HiOutlineClock, HiOutlineFilter,
  HiOutlineDownload, HiOutlineExclamationCircle,
  HiOutlineRefresh, HiOutlineShieldCheck, HiOutlineUser,
  HiOutlineChevronLeft, HiOutlineChevronRight
} from 'react-icons/hi';
import { supabase, SUPABASE_READY } from '../../config/supabase';
import { toast } from 'react-toastify';

// ── Datos demo para cuando Supabase no está listo ────────────────────────────
const DEMO_LOGS = [
  {
    id: '1', accion: 'REGISTRO_USUARIO', entidad: 'perfil',
    usuario_email: 'admin@sigevir.demo', usuario_nombre: 'Admin Demo',
    origen: 'web', created_at: new Date(Date.now() - 3600000).toISOString(),
    detalle: null,
  },
  {
    id: '2', accion: 'REGISTRO_USUARIO', entidad: 'perfil',
    usuario_email: 'campo@sigevir.demo', usuario_nombre: 'Oficial Pérez',
    origen: 'web', created_at: new Date(Date.now() - 7200000).toISOString(),
    detalle: null,
  },
  {
    id: '3', accion: 'REGISTRO_USUARIO', entidad: 'perfil',
    usuario_email: 'fiscal@sigevir.demo', usuario_nombre: 'Dra. Rodríguez',
    origen: 'web', created_at: new Date(Date.now() - 86400000).toISOString(),
    detalle: null,
  },
];

// ── Colores por tipo de acción ────────────────────────────────────────────────
const ACCION_CONFIG = {
  REGISTRO_USUARIO:    { color: 'bg-emerald-100 text-emerald-700',  label: 'Registro' },
  LOGIN:               { color: 'bg-blue-100 text-blue-700',        label: 'Acceso' },
  LOGOUT:              { color: 'bg-gray-100 text-gray-600',        label: 'Cierre sesión' },
  RETENCION_CREADA:    { color: 'bg-orange-100 text-orange-700',    label: 'Retención' },
  RESOLUCION:          { color: 'bg-purple-100 text-purple-700',    label: 'Resolución' },
  INGRESO_DEPOSITO:    { color: 'bg-indigo-100 text-indigo-700',    label: 'Ingreso depósito' },
  MODIFICACION:        { color: 'bg-yellow-100 text-yellow-700',    label: 'Modificación' },
  BAJA_USUARIO:        { color: 'bg-red-100 text-red-700',          label: 'Baja usuario' },
};

const PAGE_SIZE = 20;

const VisorAuditoria = () => {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isDemo, setIsDemo]     = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let timeoutId;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout fetching audit logs')), 10000);
      });
      const fetchPromise = (async () => {
        if (!SUPABASE_READY || !supabase) {
          setLogs(DEMO_LOGS);
          setTotal(DEMO_LOGS.length);
          setIsDemo(true);
          return { data: DEMO_LOGS, error: null, count: DEMO_LOGS.length };
        }

        let query = supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (filtroAccion) {
          query = query.eq('accion', filtroAccion);
        }
        if (search.trim()) {
          query = query.or(
            `usuario_email.ilike.%${search.trim()}%,usuario_nombre.ilike.%${search.trim()}%,accion.ilike.%${search.trim()}%`
          );
        }

        const { data, error, count } = await query;
        return { data, error, count };
      })();

      const { data, error, count } = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (error) {
        // Si la tabla no existe aún, mostrar demo y aviso
        if (error.code === '42P01') {
          setLogs(DEMO_LOGS);
          setTotal(DEMO_LOGS.length);
          setIsDemo(true);
          toast.warn('Ejecutá la migración 004_audit_logs.sql en Supabase para activar la auditoría real.');
        } else {
          throw error;
        }
        return;
      }

      setLogs(data || []);
      setTotal(count || 0);
      setIsDemo(false);
    } catch (err) {
      console.error('Error auditoría:', err);
      toast.error('Error al cargar logs de auditoría.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filtroAccion]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Debounce en búsqueda
  useEffect(() => {
    setPage(0);
  }, [search, filtroAccion]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getAccionConfig = (accion) =>
    ACCION_CONFIG[accion] || { color: 'bg-gray-100 text-gray-600', label: accion?.replace(/_/g, ' ') || '-' };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Historial de Auditoría</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Registro inmutable de todas las acciones críticas del sistema.
            {isDemo && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                MODO DEMO
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all text-sm">
            <HiOutlineDownload className="w-5 h-5" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Panel */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">

        {/* Barra de filtros */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/40">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[200px]">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro por acción */}
            <button
              onClick={() => setMostrarFiltros(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all ${
                mostrarFiltros || filtroAccion
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <HiOutlineFilter className="w-4 h-4" />
              Filtros {filtroAccion && '• 1'}
            </button>

            {/* Total */}
            <span className="ml-auto text-xs text-gray-400 font-medium">
              {total} {total === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {/* Filtros expandidos */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
              <span className="text-xs font-bold text-gray-500 self-center">Acción:</span>
              {[
                { value: '', label: 'Todas' },
                { value: 'REGISTRO_USUARIO', label: 'Registro' },
                { value: 'LOGIN', label: 'Acceso' },
                { value: 'RETENCION_CREADA', label: 'Retención' },
                { value: 'RESOLUCION', label: 'Resolución' },
                { value: 'MODIFICACION', label: 'Modificación' },
              ].map(op => (
                <button
                  key={op.value}
                  onClick={() => setFiltroAccion(op.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filtroAccion === op.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Cargando registros...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entidad</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const cfg = getAccionConfig(log.accion);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Fecha */}
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <HiOutlineClock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {new Date(log.created_at).toLocaleDateString('es-AR')}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <HiOutlineUser className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-800">{log.usuario_nombre || 'Sistema'}</p>
                            <p className="text-[11px] text-gray-400">{log.usuario_email || '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                          <HiOutlineShieldCheck className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Entidad */}
                      <td className="px-8 py-4">
                        <p className="text-xs font-bold text-gray-500 uppercase">
                          {log.entidad || '-'}
                        </p>
                        {log.entidad_id && (
                          <p className="text-[10px] text-gray-300 font-mono mt-0.5" title={log.entidad_id}>
                            {log.entidad_id.substring(0, 8)}…
                          </p>
                        )}
                      </td>

                      {/* Origen */}
                      <td className="px-8 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg uppercase">
                          {log.origen || 'web'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <HiOutlineExclamationCircle className="w-14 h-14 text-gray-100" />
                        <p className="text-gray-400 font-semibold">No hay registros de auditoría que mostrar.</p>
                        {search && (
                          <button onClick={() => setSearch('')} className="text-blue-500 text-sm font-bold hover:underline">
                            Limpiar búsqueda
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-400 font-medium">
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <span className="flex items-center px-4 text-xs font-bold text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisorAuditoria;