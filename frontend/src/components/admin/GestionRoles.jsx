import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../../config/supabase';
import { ROLES, ROLE_COLORS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from '../../utils/constants';

const GestionRoles = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTipo, setEditingTipo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', rol_asignado: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tipos_personal')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      setTipos(data || []);
    } catch (err) {
      toast.error('Error al cargar tipos de personal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTipos(); }, [fetchTipos]);

  const handleToggleActivo = async (tipo) => {
    try {
      const { error } = await supabase
        .from('tipos_personal')
        .update({ activo: !tipo.activo })
        .eq('id', tipo.id);
      if (error) throw error;
      toast.success(`${tipo.nombre} ${tipo.activo ? 'desactivado' : 'activado'}`);
      fetchTipos();
    } catch (err) {
      toast.error('Error al cambiar estado');
    }
  };

  const openEditModal = (tipo) => {
    setEditingTipo(tipo);
    setFormData({ nombre: tipo.nombre, rol_asignado: tipo.rol_asignado, descripcion: tipo.descripcion || '' });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingTipo(null);
    setFormData({ nombre: '', rol_asignado: '', descripcion: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.rol_asignado) {
      toast.error('Nombre y rol son requeridos');
      return;
    }
    setSaving(true);
    try {
      if (editingTipo) {
        const { error } = await supabase
          .from('tipos_personal')
          .update({ 
            nombre: formData.nombre,
            descripcion: formData.descripcion 
          })
          .eq('id', editingTipo.id);
        if (error) throw error;
        toast.success('Tipo actualizado');
      } else {
        const { error } = await supabase
          .from('tipos_personal')
          .insert({ nombre: formData.nombre, rol_asignado: formData.rol_asignado, descripcion: formData.descripcion, activo: true });
        if (error) throw error;
        toast.success('Tipo creado exitosamente');
      }
      setShowModal(false);
      fetchTipos();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const contarTiposPorRol = (rol) => tipos.filter(t => t.rol_asignado === rol && t.activo).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Roles y Tipos de Personal</h3>
          <p className="text-sm text-gray-500 font-medium">Configurá los tipos de personal y su asignación automática de roles</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Tipo
        </button>
      </div>

      {/* Roles del sistema — cards */}
      <div>
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Roles del sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(ROLES).map(([rol, label]) => {
            const color = ROLE_COLORS[rol];
            const permisos = ROLE_PERMISSIONS[rol] || [];
            const cantidadTipos = contarTiposPorRol(rol);
            return (
              <motion.div key={rol} whileHover={{ y: -2 }} className={`${color.bg} border ${color.border} rounded-2xl p-5 transition-all`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center`}>
                    <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${color.text}`}>{label}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{rol}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{ROLE_DESCRIPTIONS[rol]}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {permisos.slice(0, 3).map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-white/70 px-2 py-0.5 rounded-lg border border-gray-100">
                      <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {p}
                    </span>
                  ))}
                  {permisos.length > 3 && <span className="text-[10px] text-gray-400 px-2 py-0.5">+{permisos.length - 3} más</span>}
                </div>
                <div className={`text-[10px] font-bold ${color.text} uppercase tracking-widest`}>
                  {cantidadTipos} tipo{cantidadTipos !== 1 ? 's' : ''} activo{cantidadTipos !== 1 ? 's' : ''}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tabla de tipos de personal */}
      <div>
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tipos de personal → Roles asignados</h4>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de personal</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol asignado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : tipos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-sm text-gray-400 font-medium">No hay tipos de personal configurados</p>
                    </td>
                  </tr>
                ) : tipos.map((tipo) => {
                  const color = ROLE_COLORS[tipo.rol_asignado] || ROLE_COLORS.agente_campo;
                  return (
                    <tr key={tipo.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">{tipo.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{tipo.nombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500 max-w-xs truncate">{tipo.descripcion || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${color.bg} ${color.text} border ${color.border}`}>
                          <span className={`${color.dot} w-1.5 h-1.5 rounded-full`} />
                          {ROLES[tipo.rol_asignado] || tipo.rol_asignado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActivo(tipo)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            tipo.activo
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {tipo.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(tipo)}
                          className="p-2 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                          title="Editar descripción"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <p className="text-sm font-bold text-blue-800 mb-1">¿Cómo funciona la asignación de roles?</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Cuando un usuario se registra, selecciona su <strong>tipo de personal</strong> (ej: Policía, Juez). 
            El sistema asigna automáticamente el <strong>rol</strong> correspondiente según esta tabla. 
            El usuario <strong>no puede</strong> elegir su rol directamente. Solo un administrador puede cambiar el rol de un usuario existente.
          </p>
        </div>
      </div>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{editingTipo ? 'Editar Tipo' : 'Nuevo Tipo de Personal'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del tipo *</label>
                  <input
                    value={formData.nombre}
                    onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Ej: Defensor público"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Rol asignado *</label>
                  <select
                    value={formData.rol_asignado}
                    onChange={(e) => setFormData(p => ({ ...p, rol_asignado: e.target.value }))}
                    disabled={!!editingTipo}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Seleccionar rol...</option>
                    {Object.entries(ROLES).map(([key, label]) => (
                      <option key={key} value={key}>{label} ({key})</option>
                    ))}
                  </select>
                  {editingTipo && <p className="mt-1 text-[10px] text-gray-400">El rol asignado no se puede cambiar después de creado</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    placeholder="Descripción del tipo de personal..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancelar</button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200">
                    {saving ? 'Guardando...' : editingTipo ? 'Actualizar' : 'Crear Tipo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionRoles;
