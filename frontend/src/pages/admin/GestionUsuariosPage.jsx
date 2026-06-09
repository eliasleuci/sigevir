import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase, SUPABASE_READY, getTiposPersonal } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_COLORS, TIPOS_PERSONAL_PUBLICOS } from '../../utils/constants';

const ITEMS_PER_PAGE = 10;

const DEMO_USERS_ADMIN = [
  { id: 'demo-admin', nombre_completo: 'Admin Demo', email: 'admin@sigevir.demo', dni: '10.000.001', rol: 'admin', tipo_personal_id: 'tp-7', institucion: 'Policia de Cordoba', activo: true, created_at: new Date().toISOString() },
  { id: 'demo-campo', nombre_completo: 'Oficial Perez', email: 'campo@sigevir.demo', dni: '20.000.002', rol: 'agente_campo', tipo_personal_id: 'tp-1', institucion: 'Policia de Cordoba', activo: true, created_at: new Date().toISOString() },
  { id: 'demo-deposito', nombre_completo: 'Juan Deposito', email: 'deposito@sigevir.demo', dni: '30.000.003', rol: 'deposito', tipo_personal_id: 'tp-3', institucion: 'Deposito Municipal', activo: true, created_at: new Date().toISOString() },
  { id: 'demo-pendiente', nombre_completo: 'Usuario Pendiente', email: 'pendiente@gmail.com', dni: '', rol: 'agente_campo', tipo_personal_id: null, institucion: '', activo: true, created_at: new Date().toISOString() },
];

const GestionUsuariosPage = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre_completo: '', dni: '', email: '', telefono: '',
    institucion: '', jurisdiccion: '', cargo: '',
    tipo_personal_id: '', password: '', confirmar_password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [tiposPersonal, setTiposPersonal] = useState([]);

  useEffect(() => {
    const fetchTipos = async () => {
      const { data } = await getTiposPersonal();
      if (data) setTiposPersonal(data);
    };
    fetchTipos();
  }, []);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      if (!SUPABASE_READY) {
        let data = [...DEMO_USERS_ADMIN];
        if (filtroRol) data = data.filter(u => u.rol === filtroRol);
        if (filtroEstado === 'activo') data = data.filter(u => u.activo && u.tipo_personal_id);
        if (filtroEstado === 'inactivo') data = data.filter(u => !u.activo);
        if (filtroEstado === 'pendiente') data = data.filter(u => !u.tipo_personal_id);
        if (search) {
          const s = search.toLowerCase();
          data = data.filter(u => (u.nombre_completo || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s));
        }
        setUsuarios(data);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroRol) query = query.eq('rol', filtroRol);
      if (filtroEstado === 'activo') query = query.eq('activo', true).not('tipo_personal_id', 'is', null);
      if (filtroEstado === 'inactivo') query = query.eq('activo', false);
      if (filtroEstado === 'pendiente') query = query.is('tipo_personal_id', null);
      if (search) {
        query = query.or(`nombre_completo.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [search, filtroRol, filtroEstado]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const totalPages = Math.ceil(usuarios.length / ITEMS_PER_PAGE);
  const paginados = usuarios.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleToggleActivo = async (usuario) => {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: !usuario.activo })
        .eq('id', usuario.id);
      if (error) throw error;
      toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`);
      fetchUsuarios();
    } catch (err) {
      toast.error('Error al cambiar estado');
    }
  }

  // Aprobar usuario pendiente (solo admin)
  const approvePending = async (u) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('http://localhost:4002/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: u.id,
          tipo_personal_id: u.tipo_personal_id || '',
          rol: u.rol || 'agente_campo',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Usuario aprobado y activado');
      fetchUsuarios();
    } catch (err) {
      console.error('Aprobación falló', err);
      toast.error(err.message || 'Error al aprobar usuario');
    }
  };;

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ nombre_completo: '', dni: '', email: '', telefono: '', institucion: '', jurisdiccion: '', cargo: '', tipo_personal_id: '', password: '', confirmar_password: '' });
    setShowModal(true);
  };

  const openEditModal = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre_completo: usuario.nombre_completo || '',
      dni: usuario.dni || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      institucion: usuario.institucion || '',
      jurisdiccion: usuario.jurisdiccion || '',
      cargo: usuario.cargo || '',
      tipo_personal_id: usuario.tipo_personal_id ? String(usuario.tipo_personal_id) : '',
      password: '',
      confirmar_password: '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre_completo || !formData.email || !formData.tipo_personal_id) {
      toast.error('Completá los campos obligatorios');
      return;
    }
    setFormLoading(true);
    try {
      const tipoPersonal = tiposPersonal.find(t => String(t.id) === String(formData.tipo_personal_id));
      const rol = tipoPersonal?.rol || 'agente_campo';

      if (editingUser) {
        const { error } = await supabase
          .from('perfiles')
          .update({
            nombre_completo: formData.nombre_completo,
            dni: formData.dni,
            telefono: formData.telefono,
            institucion: formData.institucion,
            cargo: formData.cargo,
            tipo_personal_id: formData.tipo_personal_id || null,
            rol,
            activo: true,
          })
          .eq('id', editingUser.id);
        if (error) throw error;
        toast.success(editingUser.tipo_personal_id ? 'Usuario actualizado' : '¡Usuario aprobado y activado!');
      } else {
        if (!formData.password || formData.password.length < 8) {
          toast.error('La contraseña debe tener al menos 8 caracteres');
          setFormLoading(false);
          return;
        }
        const { error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            nombre_completo: formData.nombre_completo,
            dni: formData.dni,
            telefono: formData.telefono,
            institucion: formData.institucion,
            jurisdiccion: formData.jurisdiccion,
            cargo: formData.cargo,
            tipo_personal_id: formData.tipo_personal_id,
          },
        });
        if (authError) throw authError;
        toast.success('Usuario creado exitosamente');
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err) {
      toast.error(err.message || 'Error al guardar usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleBadge = (rol) => {
    const color = ROLE_COLORS[rol] || ROLE_COLORS.agente_campo;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${color.border || 'border-gray-200'}`}>
        <span className={`${color.dot} w-1.5 h-1.5 rounded-full`} />
        {ROLES[rol] || rol}
      </span>
    );
  };

  const isPending = (u) => !u.tipo_personal_id;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Usuarios</h3>
          <p className="text-sm text-gray-500 font-medium">Administrá los usuarios del sistema SIGEVIR</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
        {/* Filtros */}
        <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              type="text"
              placeholder="Buscar por nombre, email, DNI..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={filtroRol}
              onChange={(e) => { setFiltroRol(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos los roles</option>
              {Object.entries(ROLES).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">⏳ Pendiente</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">DNI</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Institución</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : paginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : paginados.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors group ${isPending(u) ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`${isPending(u) ? 'bg-amber-100 text-amber-600' : (ROLE_COLORS[u.rol]?.bg || 'bg-gray-100') + ' ' + (ROLE_COLORS[u.rol]?.text || 'text-gray-600')} w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold`}>
                        {(u.nombre_completo || u.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.nombre_completo || <span className="text-gray-400 italic font-normal">Sin nombre</span>}</p>
                        <p className="text-[11px] text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{u.dni || <span className="text-gray-300 text-xs italic">—</span>}</td>
                  <td className="px-6 py-4">
                    {isPending(u) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-gray-200 text-gray-400 bg-gray-50">
                        Sin asignar
                      </span>
                    ) : getRoleBadge(u.rol)}
                  </td>
                  <td className="px-6 py-4"><p className="text-xs font-semibold text-gray-500">{u.institucion || <span className="text-gray-300 italic">—</span>}</p></td>
                  <td className="px-6 py-4">
                    {isPending(u) ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                        ⏳ Pendiente
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1.5 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {isPending(u) && (
                        <button
                          onClick={() => approvePending(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-all text-[11px] font-black border border-amber-200"
                          title="Aprobar y asignar rol"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Aprobar
                        </button>
                      )}
                      <button onClick={() => openEditModal(u)} className="p-2 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all" title="Editar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleToggleActivo(u)} className={`p-2 rounded-lg transition-all ${u.activo ? 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600' : 'bg-emerald-50 text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600'}`} title={u.activo ? 'Desactivar' : 'Activar'}>
                        {u.activo ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, usuarios.length)} de {usuarios.length}
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-all">Anterior</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-all">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingUser
                    ? (isPending(editingUser) ? '✅ Aprobar Usuario' : 'Editar Usuario')
                    : 'Nuevo Usuario'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {editingUser && isPending(editingUser) && (
                <div className="mx-6 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⏳</span>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Solicitud pendiente de aprobación</p>
                    <p className="text-xs text-amber-600 mt-0.5">Asigná un tipo de personal para activar el acceso de este usuario.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo *</label>
                    <input value={formData.nombre_completo} onChange={(e) => setFormData(p => ({ ...p, nombre_completo: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">DNI</label>
                    <input value={formData.dni} onChange={(e) => setFormData(p => ({ ...p, dni: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                    <input value={formData.telefono} onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                    <input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} disabled={!!editingUser} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Institución</label>
                    <input value={formData.institucion} onChange={(e) => setFormData(p => ({ ...p, institucion: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Jurisdicción</label>
                    <input value={formData.jurisdiccion} onChange={(e) => setFormData(p => ({ ...p, jurisdiccion: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cargo</label>
                    <input value={formData.cargo} onChange={(e) => setFormData(p => ({ ...p, cargo: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de personal *</label>
                    <select value={formData.tipo_personal_id} onChange={(e) => setFormData(p => ({ ...p, tipo_personal_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white">
                      <option value="">Seleccionar...</option>
                      {tiposPersonal.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                  {!editingUser && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña *</label>
                        <input value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} type="password" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmar *</label>
                        <input value={formData.confirmar_password} onChange={(e) => setFormData(p => ({ ...p, confirmar_password: e.target.value }))} type="password" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancelar</button>
                  <button type="submit" disabled={formLoading} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200">
                    {formLoading ? 'Guardando...' : editingUser ? (isPending(editingUser) ? '✅ Aprobar acceso' : 'Actualizar') : 'Crear Usuario'}
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

export default GestionUsuariosPage;
