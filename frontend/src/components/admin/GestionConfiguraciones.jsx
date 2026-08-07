import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCog, 
  HiOutlineServer, 
  HiOutlineCurrencyDollar, 
  HiOutlineExclamationCircle,
  HiOutlineSave,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

const GestionConfiguraciones = () => {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('GENERAL');

  // Estado local para los valores que el usuario está editando
  const [formValues, setFormValues] = useState({});

  // Estado del Modal de Creación/Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null); // null = Crear
  const [modalData, setModalData] = useState({
    clave: '',
    valor: '',
    descripcion: '',
    categoria: '',
    tipo: 'string'
  });

  const fetchConfiguraciones = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/configuraciones');
      const data = response.data?.data || response.data || [];
      setConfiguraciones(data);
      
      const initialValues = {};
      data.forEach(conf => {
        initialValues[conf.clave] = conf.tipo === 'boolean' ? conf.valor === 'true' : conf.valor;
      });
      setFormValues(initialValues);
    } catch (error) {
      toast.error('Error al cargar configuraciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  const handleInputChange = (clave, valor) => {
    setFormValues(prev => ({ ...prev, [clave]: valor }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(formValues).map(([clave, valor]) => ({
        clave,
        valor: String(valor)
      }));

      await apiClient.put('/configuraciones', { configuraciones: payload });
      toast.success('Configuraciones guardadas correctamente');
      
      await fetchConfiguraciones();
    } catch (error) {
      toast.error('Error al guardar configuraciones');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // --- Lógica del CRUD (Modal) ---
  const openCreateModal = () => {
    setEditingConfig(null);
    setModalData({ clave: '', valor: '', descripcion: '', categoria: activeCategory, tipo: 'string' });
    setIsModalOpen(true);
  };

  const openEditModal = (config) => {
    setEditingConfig(config);
    setModalData({ ...config });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, clave) => {
    if (!window.confirm(`¿Estás seguro de eliminar la configuración '${clave}'? Esto podría afectar el funcionamiento del sistema.`)) return;
    try {
      await apiClient.delete(`/configuraciones/${id}`);
      toast.success('Configuración eliminada');
      fetchConfiguraciones();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await apiClient.put(`/configuraciones/${editingConfig.id}`, modalData);
        toast.success('Estructura actualizada');
      } else {
        await apiClient.post('/configuraciones', modalData);
        toast.success('Configuración creada');
      }
      setIsModalOpen(false);
      fetchConfiguraciones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
    }
  };

  // Agrupar configuraciones por categoría
  const categorias = [...new Set(configuraciones.map(c => c.categoria))];
  // Asegurar que siempre exista al menos la activa o GENERAL
  if (!categorias.includes(activeCategory)) categorias.push(activeCategory);
  
  const ICONS = {
    GENERAL: HiOutlineServer,
    VALORES: HiOutlineCurrencyDollar,
    MANTENIMIENTO: HiOutlineExclamationCircle,
  };

  const currentCategoryConfigs = configuraciones.filter(c => c.categoria === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <HiOutlineCog className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Panel de Control</h3>
            <p className="text-sm text-gray-500 font-medium mt-1 max-w-xl">
              Configura variables globales, costos base, y comportamientos del sistema. 
              <span className="text-amber-600 font-bold ml-1">Cuidado: los cambios aplican inmediatamente.</span>
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-4 bg-white text-blue-600 border border-blue-100 rounded-2xl font-black shadow-sm hover:bg-blue-50 transition-all"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Nueva Opción
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-50 disabled:transform-none"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineSave className="w-6 h-6" />
            )}
            Guardar Cambios
          </button>
        </div>

        {/* Decoración */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-gray-500">Cargando configuración...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar de categorías */}
          <div className="lg:w-1/4 flex flex-col gap-2">
            {categorias.map(cat => {
              const Icon = ICONS[cat] || HiOutlineCog;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm tracking-wide transition-all ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-2' 
                    : 'bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 hover:translate-x-1 border border-gray-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {cat.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>

          {/* Formulario principal */}
          <div className="lg:w-3/4 bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 lg:p-12">
            <h4 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4 capitalize">
              {activeCategory.replace(/_/g, ' ')}
            </h4>
            
            <div className="space-y-10">
              {currentCategoryConfigs.map(config => (
                <div key={config.clave} className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group p-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-colors relative">
                  
                  {/* Descripcion / Label */}
                  <div className="md:w-1/2">
                    <label className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-wider mb-2">
                      {config.clave.replace(/_/g, ' ')}
                      
                      {/* Botones de edición ocultos hasta hover */}
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={() => openEditModal(config)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Estructura">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(config.id, config.clave)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Opción">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </label>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      {config.descripcion}
                    </p>
                  </div>

                  {/* Input según tipo */}
                  <div className="md:w-1/2">
                    {config.tipo === 'boolean' ? (
                      <div className="flex items-center mt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formValues[config.clave] === true}
                            onChange={(e) => handleInputChange(config.clave, e.target.checked)}
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                          <span className={`ml-4 text-sm font-black uppercase tracking-widest ${formValues[config.clave] ? 'text-red-500' : 'text-gray-400'}`}>
                            {formValues[config.clave] ? 'ACTIVADO' : 'DESACTIVADO'}
                          </span>
                        </label>
                      </div>
                    ) : config.tipo === 'number' ? (
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 font-bold sm:text-sm">$ / #</span>
                        </div>
                        <input
                          type="number"
                          value={formValues[config.clave] ?? ''}
                          onChange={(e) => handleInputChange(config.clave, e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <input
                          type="text"
                          value={formValues[config.clave] ?? ''}
                          onChange={(e) => handleInputChange(config.clave, e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                </div>
              ))}
              
              {currentCategoryConfigs.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-medium italic mb-4">No hay configuraciones para esta categoría.</p>
                  <button onClick={openCreateModal} className="text-blue-600 font-bold hover:underline">Crear la primera configuración</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear / Editar Configuración */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900">
                {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Clave Única</label>
                <input
                  type="text"
                  required
                  disabled={!!editingConfig}
                  value={modalData.clave}
                  onChange={e => setModalData({...modalData, clave: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                  placeholder="EJEMPLO_VALOR"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
              </div>

              {!editingConfig && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Valor Inicial</label>
                  <input
                    type="text"
                    required
                    value={modalData.valor}
                    onChange={e => setModalData({...modalData, valor: e.target.value})}
                    placeholder="Valor por defecto..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción Corta</label>
                <input
                  type="text"
                  required
                  value={modalData.descripcion}
                  onChange={e => setModalData({...modalData, descripcion: e.target.value})}
                  placeholder="¿Para qué sirve esto?"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
                  <input
                    type="text"
                    required
                    value={modalData.categoria}
                    onChange={e => setModalData({...modalData, categoria: e.target.value.toUpperCase()})}
                    placeholder="GENERAL, VALORES..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Dato</label>
                  <select
                    value={modalData.tipo}
                    onChange={e => setModalData({...modalData, tipo: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="string">Texto</option>
                    <option value="number">Número</option>
                    <option value="boolean">Interruptor (Sí/No)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  {editingConfig ? 'Guardar Cambios' : 'Crear Opción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionConfiguraciones;
