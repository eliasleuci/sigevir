import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineInformationCircle } from 'react-icons/hi';
import apiClient from '../services/apiClient';

const ConsultaPublica = () => {
  const [patente, setPatente] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patente.trim()) return;

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const { data } = await apiClient.get(`/public/consulta-vehiculo/${patente.trim()}`);
      if (data?.success && data?.data) {
        setResultado(data.data);
      } else {
        setError('No se pudo obtener información de este vehículo.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ningún vehículo retenido con esa patente en este momento.');
      } else if (err.response?.status === 429) {
        setError('Has realizado demasiadas consultas. Por favor, intenta de nuevo más tarde.');
      } else {
        setError('Ocurrió un error al consultar el sistema.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden flex flex-col justify-center">
      {/* Marca de agua de fondo */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: 'url(/icono-de-la-app.jpeg)',
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="max-w-xl mx-auto space-y-8 w-full relative z-10">
        
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <HiOutlineSearch className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Consulta de Vehículos</h2>
          <p className="mt-3 text-lg text-gray-500 font-medium">
            Ingresá tu número de patente para conocer el estado y ubicación de tu vehículo retenido.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="patente" className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                Número de Patente
              </label>
              <div className="relative">
                <input
                  id="patente"
                  type="text"
                  placeholder="Ej: AB123CD o ABC123"
                  className="block w-full pl-5 pr-12 py-5 text-xl font-bold uppercase border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 placeholder:normal-case placeholder:font-medium placeholder:text-gray-400 text-center tracking-widest"
                  value={patente}
                  onChange={(e) => setPatente(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !patente.trim()}
              className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-black text-white bg-gray-900 hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Buscando...' : 'Consultar Estado'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 animate-in fade-in zoom-in duration-300">
              <HiOutlineInformationCircle className="w-6 h-6 shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          {resultado && (
            <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="h-px bg-gray-100 w-full" />
              
              <div className="text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                  resultado.estado_actual === 'LIBERADO' ? 'bg-green-100 text-green-700 border border-green-200' :
                  resultado.estado_actual === 'RESOLUCION_PENDIENTE' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  ESTADO: {resultado.estado_actual.replace(/_/g, ' ')}
                </span>
                <h3 className="mt-4 text-3xl font-black text-gray-900 uppercase tracking-widest">{resultado.dominio}</h3>
                <p className="text-gray-500 font-bold mt-1 uppercase">{resultado.marca} {resultado.modelo}</p>
              </div>

              {resultado.deposito_institucion ? (
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-blue-100 opacity-50">
                    <HiOutlineLocationMarker className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Ubicación Actual</p>
                    <p className="text-xl font-black text-blue-900 leading-tight mb-2">
                      {resultado.deposito_institucion.nombre}
                    </p>
                    <p className="text-sm font-medium text-blue-800">
                      {resultado.deposito_institucion.direccion}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resultado.deposito_institucion.nombre + ' ' + resultado.deposito_institucion.direccion)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white text-blue-700 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors border border-blue-200"
                    >
                      <HiOutlineLocationMarker className="w-5 h-5 mr-2" />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 text-center">
                  <p className="text-gray-600 font-medium text-sm">
                    El vehículo se encuentra en tránsito o la ubicación del depósito aún no fue asignada.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-400 font-medium">
          <p>Portal Oficial del Ciudadano • SIGEVIR</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultaPublica;
