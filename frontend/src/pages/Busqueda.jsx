import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FormularioBusquedaAvanzada from '../components/busqueda/FormularioBusquedaAvanzada';
import TablaResultados from '../components/busqueda/TablaResultados';
import HistorialCompleto from '../components/judicial/HistorialCompleto';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft, HiOutlineSearchCircle } from 'react-icons/hi';

const Busqueda = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [view, setView] = useState('form'); // 'form', 'results', 'detail'
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const payload = {};
      if (filters.dominio) payload.dominio = filters.dominio;
      if (filters.nro_identificacion) {
        payload.nro_identificacion = filters.nro_identificacion;
      }
      if (filters.titular_dni) payload.dni_titular = filters.titular_dni;
      if (filters.estado) payload.estado_actual = filters.estado === 'RETENIDO_EN_TRANSITO' ? 'RETENIDO' : filters.estado;
      if (filters.fecha_desde) payload.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) payload.fecha_hasta = filters.fecha_hasta;

      if (Object.keys(payload).length === 0) {
        toast.warning('Ingrese al menos un criterio de búsqueda.');
        setLoading(false);
        return;
      }

      const response = await apiClient.post(`/busqueda/avanzada`, payload);
      if (response.data?.resultados) {
        setResultados(response.data.resultados);
      } else {
        setResultados(response.data?.data?.resultados || []);
      }
      setView('results');
    } catch (error) {
      toast.error('Error al ejecutar la búsqueda avanzada.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehiculo = async (vehiculo_summary) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/retenciones/${vehiculo_summary.id}`);
      setSelectedVehiculo(response.data.data);
      setView('detail');
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error('Error al cargar los detalles completos del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.preselectVehiculoId) {
      handleSelectVehiculo({ id: location.state.preselectVehiculoId });
      // Limpiamos el estado para evitar re-ejecuciones al recargar la página
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleEmitirResolucion = () => {
    navigate('/judicial/causas', { state: { preselectExpediente: selectedVehiculo.numero_expediente } });
  };

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-8 px-2 md:px-4 space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-gray-900 text-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-gray-200">
            <HiOutlineSearchCircle className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none mb-1 md:mb-2">Buscador Inteligente</h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">Localización de vehículos en todo el sistema jurisdiccional.</p>
          </div>
        </div>

        {view !== 'form' && (
          <button 
            onClick={() => setView('form')}
            className="w-full md:w-auto flex justify-center items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-white border border-gray-200 text-gray-600 rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:bg-gray-50 transition-all shadow-lg shadow-gray-100 print:hidden"
          >
            <HiOutlineArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            Nueva Búsqueda Avanzada
          </button>
        )}
      </div>

      {view === 'form' && (
        <FormularioBusquedaAvanzada onSearch={handleSearch} onClear={() => setResultados([])} loading={loading} />
      )}

      {view === 'results' && (
        <div className="animate-in slide-in-from-right-8 duration-500">
          <TablaResultados 
            resultados={resultados} 
            onSelect={handleSelectVehiculo} 
            loading={loading} 
            onExport={(type) => toast.info(`Exportando a ${type.toUpperCase()}...`)}
          />
        </div>
      )}

      {view === 'detail' && selectedVehiculo && (
        <div className="animate-in zoom-in duration-500 space-y-4 md:space-y-6">
          <button 
            onClick={() => setView('results')}
            className="w-full md:w-auto flex justify-center md:justify-start items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all px-4 py-3 md:py-2 bg-gray-50 rounded-xl text-sm"
          >
            <HiOutlineArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            Volver a los resultados
          </button>
          <HistorialCompleto vehiculo={selectedVehiculo} onEmitirResolucion={handleEmitirResolucion} />
        </div>
      )}
    </div>
  );
};

export default Busqueda;
