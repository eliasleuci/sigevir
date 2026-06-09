import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BuscadorCausas from '../../components/judicial/BuscadorCausas';
import HistorialCompleto from '../../components/judicial/HistorialCompleto';
import FormularioResolucion from '../../components/judicial/FormularioResolucion';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft, HiOutlineChevronRight, HiOutlineDocumentSearch } from 'react-icons/hi';

const GestionCausas = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [view, setView] = useState('search'); // 'search', 'detail', 'emit_resolution'

  useEffect(() => {
    if (location.state?.preselectExpediente) {
      const autoSearch = async () => {
        setLoading(true);
        try {
          const response = await apiClient.post(`/busqueda/avanzada`, { numero_expediente: location.state.preselectExpediente });
          const items = response.data?.resultados || response.data?.data?.resultados || [];
          if (items.length > 0) {
            // Auto select the first vehicle found and jump to emit resolution!
            const details = await apiClient.get(`/retenciones/${items[0].id}`);
            setSelectedVehiculo(details.data.data);
            setView('emit_resolution');
          }
        } catch (error) {
          toast.error('Error al auto-cargar el expediente.');
        } finally {
          setLoading(false);
          // Clear state to avoid infinite loops on refresh
          window.history.replaceState({}, document.title);
        }
      };
      autoSearch();
    }
  }, [location.state]);

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const payload = {};
      if (filters.dominio) payload.dominio = filters.dominio;
      if (filters.nro_expediente) payload.numero_expediente = filters.nro_expediente;
      if (filters.titular_dni) payload.dni_titular = filters.titular_dni;

      const response = await apiClient.post(`/busqueda/avanzada`, payload);
      setResults(response.data?.resultados || response.data?.data?.resultados || []);
      setView('results');
    } catch (error) {
      toast.error('Error al realizar la búsqueda de causas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehiculo = async (vehiculo) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/retenciones/${vehiculo.id}`);
      setSelectedVehiculo(response.data.data);
      setView('detail');
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error('Error al obtener los detalles del expediente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmitirResolucion = async (resolucionData) => {
    setLoading(true);
    try {
      const payload = {
        numero_expediente: selectedVehiculo.numero_expediente,
        tipo: resolucionData.tipo.toLowerCase(),
        observaciones: resolucionData.observaciones,
        documento_url: resolucionData.documento_id || null
      };
      await apiClient.post(`/causas/resoluciones`, payload);
      toast.success('¡Resolución emitida correctamente!');
      
      // Refrescar datos
      const response = await apiClient.get(`/retenciones/${selectedVehiculo.id}`);
      setSelectedVehiculo(response.data.data);
      setView('detail');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al emitir resolución.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      {/* Header Contextual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Gestión de Causas Judiciales</h1>
          <p className="text-gray-500 font-medium">Búsqueda, historial completo y emisión de dictámenes legales.</p>
        </div>

        {view !== 'search' && (
          <button 
            onClick={() => setView('search')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Nueva Búsqueda
          </button>
        )}
      </div>

      {/* Vista de Búsqueda */}
      {view === 'search' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <BuscadorCausas onSearch={handleSearch} loading={loading} />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg mb-4 font-black">1</div>
              <h4 className="font-black text-blue-900 mb-2 uppercase tracking-widest text-sm">Identificar</h4>
              <p className="text-xs text-blue-700 opacity-80 leading-relaxed font-medium">Busca el expediente por patente, número de acta o DNI del infractor.</p>
            </div>
            <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg mb-4 font-black">2</div>
              <h4 className="font-black text-indigo-900 mb-2 uppercase tracking-widest text-sm">Auditar</h4>
              <p className="text-xs text-indigo-700 opacity-80 leading-relaxed font-medium">Revisa las fotos, el inventario del depósito y el historial de estados del vehículo.</p>
            </div>
            <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg mb-4 font-black">3</div>
              <h4 className="font-black text-emerald-900 mb-2 uppercase tracking-widest text-sm">Dictaminar</h4>
              <p className="text-xs text-emerald-700 opacity-80 leading-relaxed font-medium">Firma digitalmente la resolución de liberación, subasta o compactación.</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de Búsqueda */}
      {view === 'results' && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="flex items-center gap-3">
            <HiOutlineDocumentSearch className="w-8 h-8 text-blue-600" />
            <h3 className="text-2xl font-black text-gray-900">Resultados de la Búsqueda</h3>
          </div>

          {results.length === 0 ? (
            <div className="py-20 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 font-bold text-xl italic mb-4">No encontramos expedientes con esos datos.</p>
              <button onClick={() => setView('search')} className="text-blue-600 font-black uppercase text-sm tracking-widest hover:underline">Intentar nuevamente</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => handleSelectVehiculo(v)}
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center font-black text-2xl transition-all">
                      {v.dominio?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900 uppercase tracking-tight">{v.dominio}</p>
                      <p className="text-sm font-bold text-gray-500">Expediente: <span className="text-blue-600">{v.nro_expediente}</span> • {v.marca} {v.modelo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Titular</p>
                      <p className="text-sm font-bold text-gray-700">{v.titular_nombre}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Estado</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        v.estado === 'LIBERADO' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {v.estado?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <HiOutlineChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista de Detalle (Historial) */}
      {view === 'detail' && selectedVehiculo && (
        <HistorialCompleto 
          vehiculo={selectedVehiculo} 
          onEmitirResolucion={() => setView('emit_resolution')} 
        />
      )}

      {/* Vista de Emisión de Resolución */}
      {view === 'emit_resolution' && selectedVehiculo && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button 
              onClick={() => setView('detail')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
              Cancelar y Volver al Historial
            </button>
            <div className="text-left sm:text-right">
              <h2 className="text-2xl font-black text-gray-900">Emisión de Sentencia Judicial</h2>
              <p className="text-sm text-gray-500 font-medium">Vehículo: {selectedVehiculo.dominio} • Exp: {selectedVehiculo.nro_expediente}</p>
            </div>
          </div>
          <FormularioResolucion 
            vehiculo={selectedVehiculo} 
            onSubmit={handleEmitirResolucion} 
            loading={loading} 
          />
        </div>
      )}
    </div>
  );
};

export default GestionCausas;
