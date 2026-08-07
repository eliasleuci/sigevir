import React, { useState, useEffect } from 'react';
import { HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

const TIPOS_INSTITUCION = ['POLICIAL', 'JUDICIAL', 'MUNICIPAL', 'NACIONAL', 'OTRO'];

const GestionInstituciones = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    tipo: 'MUNICIPAL',
    jurisdiccion: '',
    logo_url: ''
  });

  const fetchInstituciones = async () => {
    setLoading(true);
    try {
      // Pedimos las instituciones, filtrando por activas si el backend lo permite
      const response = await apiClient.get('/instituciones');
      // Aseguramos que data contenga la info (puede venir en response.data.data)
      const data = response.data?.data || response.data || [];
      // Solo mostramos las activas
      setInstituciones(data.filter(inst => inst.activa));
    } catch (error) {
      toast.error('Error al cargar las instituciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstituciones();
  }, []);

  const openModal = (inst = null) => {
    if (inst) {
      setFormData({
        id: inst.id,
        nombre: inst.nombre || '',
        tipo: inst.tipo || 'MUNICIPAL',
        jurisdiccion: inst.jurisdiccion || '',
        logo_url: inst.logo_url || ''
      });
    } else {
      setFormData({
        id: null,
        nombre: '',
        tipo: 'MUNICIPAL',
        jurisdiccion: '',
        logo_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return toast.warning('El nombre es obligatorio');
    }
    
    setIsSubmitting(true);
    try {
      if (formData.id) {
        // Actualizar
        await apiClient.put(`/instituciones/${formData.id}`, formData);
        toast.success('Institución actualizada correctamente');
      } else {
        // Crear nueva
        await apiClient.post('/instituciones', formData);
        toast.success('Institución creada correctamente');
      }
      closeModal();
      fetchInstituciones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar la institución');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas dar de baja la institución "${nombre}"? Esta acción no borrará los registros históricos, pero ya no aparecerá en el sistema como opción activa.`)) {
      try {
        await apiClient.delete(`/instituciones/${id}`);
        toast.success('Institución dada de baja');
        fetchInstituciones();
      } catch (error) {
        toast.error('Error al dar de baja la institución');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Instituciones del Sistema</h3>
          <p className="text-sm text-gray-500 font-medium">Gestión de sedes, jurisdicciones y tipos de organismos (Tránsito, Policía, Juzgados).</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Nueva Institución
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-gray-500">Cargando instituciones...</p>
        </div>
      ) : instituciones.length === 0 ? (
        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineOfficeBuilding className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">No hay instituciones creadas</h4>
          <p className="text-gray-500 max-w-md mx-auto mb-6">El sistema necesita al menos una institución (como "Dirección de Tránsito") para funcionar correctamente.</p>
          <button 
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Crear la primera institución
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instituciones.map((inst) => (
            <div key={inst.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between h-full">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center font-black mb-6 transition-all overflow-hidden">
                  {inst.logo_url ? (
                    <img src={inst.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <HiOutlineOfficeBuilding className="w-8 h-8" />
                  )}
                </div>
                
                <h4 className="text-xl font-black text-gray-900 tracking-tight mb-1">{inst.nombre}</h4>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">{inst.tipo}</p>
              </div>
              
              <div className="relative z-10 pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-gray-400 max-w-[150px] truncate" title={inst.jurisdiccion}>
                  {inst.jurisdiccion || 'Sin jurisdicción específica'}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openModal(inst)}
                    className="p-2 text-gray-300 hover:text-blue-600 transition-colors"
                    title="Editar institución"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(inst.id, inst.nombre)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Dar de baja"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ABM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {formData.id ? 'Editar Institución' : 'Nueva Institución'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre de la Institución *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Dirección de Tránsito Municipal"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clasificación / Tipo *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  required
                >
                  {TIPOS_INSTITUCION.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Jurisdicción */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jurisdicción / Zona de cobertura</label>
                <input
                  type="text"
                  name="jurisdiccion"
                  value={formData.jurisdiccion}
                  onChange={handleInputChange}
                  placeholder="Ej: Ciudad Autónoma de Buenos Aires"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo Institucional (URL)</label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  Este logo aparecerá en el encabezado de los comprobantes y actas PDF generadas por la institución.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : formData.id ? 'Guardar Cambios' : 'Crear Institución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GestionInstituciones;
