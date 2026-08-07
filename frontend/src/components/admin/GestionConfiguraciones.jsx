import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCog, 
  HiOutlineServer, 
  HiOutlineCurrencyDollar, 
  HiOutlineExclamationCircle,
  HiOutlineSave
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

  const fetchConfiguraciones = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/configuraciones');
      const data = response.data?.data || response.data || [];
      setConfiguraciones(data);
      
      // Inicializar el estado de formValues
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
      // Formatear payload
      const payload = Object.entries(formValues).map(([clave, valor]) => ({
        clave,
        valor: String(valor)
      }));

      await apiClient.put('/configuraciones', { configuraciones: payload });
      toast.success('Configuraciones guardadas correctamente');
      
      // Recargar para tener los datos frescos
      await fetchConfiguraciones();
    } catch (error) {
      toast.error('Error al guardar configuraciones');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Agrupar configuraciones por categoría
  const categorias = [...new Set(configuraciones.map(c => c.categoria))];
  
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
        
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="relative z-10 flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-50 disabled:transform-none"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <HiOutlineSave className="w-6 h-6" />
          )}
          Guardar Cambios
        </button>

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
            
            <div className="space-y-8">
              {currentCategoryConfigs.map(config => (
                <div key={config.clave} className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group">
                  
                  {/* Descripcion / Label */}
                  <div className="md:w-1/2">
                    <label className="block text-sm font-black text-gray-900 uppercase tracking-wider mb-2">
                      {config.clave.replace(/_/g, ' ')}
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
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white"
                        />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <input
                          type="text"
                          value={formValues[config.clave] ?? ''}
                          onChange={(e) => handleInputChange(config.clave, e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white"
                        />
                      </div>
                    )}
                  </div>

                </div>
              ))}
              
              {currentCategoryConfigs.length === 0 && (
                <p className="text-gray-400 font-medium italic">No hay configuraciones para esta categoría.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionConfiguraciones;
