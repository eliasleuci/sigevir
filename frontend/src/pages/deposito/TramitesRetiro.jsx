import React, { useState, useEffect } from 'react';
import ListaPendientesEgreso from '../../components/deposito/ListaPendientesEgreso';
import FormularioTramite from '../../components/deposito/FormularioTramite';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineCheckCircle, HiOutlineLibrary, HiOutlineDownload } from 'react-icons/hi';

const TramitesRetiro = () => {
  const [loading, setLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [step, setStep] = useState(1);
  const [tramiteResult, setTramiteResult] = useState(null);

  useEffect(() => { fetchPendientes(); }, []);

  const fetchPendientes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/depositos/pendientes-tramite');
      setVehiculos(response.data.data);
    } catch (error) {
      toast.error('Error al cargar vehículos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehiculo = (vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleIniciarTramite = async (data) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/depositos/' + selectedVehiculo.id + '/iniciar-tramite', data);
      setTramiteResult(response.data.data);
      setStep(3);
      toast.success('¡Trámite iniciado exitosamente!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar el trámite.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadConstancia = async () => {
    try {
      const response = await apiClient.get('/depositos/' + (tramiteResult?.id || selectedVehiculo.id) + '/constancia-entrega', {
        responseType: 'arraybuffer'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'constancia_tramite_' + (tramiteResult?.id || selectedVehiculo.id) + '.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar la constancia.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Trámites de Retiro</h1>
          <p className="text-gray-500 font-medium">Gestión de trámites administrativos previos al egreso del vehículo.</p>
        </div>

        {step === 1 && (
          <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-blue-100">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black shadow-lg shadow-blue-200">
              {vehiculos.length}
            </div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-widest leading-none">Expedientes<br/>Pendientes</p>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ListaPendientesEgreso vehiculos={vehiculos} onSelect={handleSelectVehiculo} loading={loading} />
        </div>
      )}

      {step === 2 && selectedVehiculo && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <FormularioTramite
            vehiculo={selectedVehiculo}
            onSubmit={handleIniciarTramite}
            onBack={() => setStep(1)}
            loading={loading}
          />
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md mx-auto py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-blue-100 relative">
            <HiOutlineCheckCircle className="w-16 h-16" />
            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
              <HiOutlineLibrary className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Trámite Iniciado</h2>
          <p className="text-gray-500 mb-6 leading-relaxed italic">
            El trámite de retiro ha sido iniciado. Ahora el vehículo está disponible para registrar el egreso definitivo.
          </p>

          <button onClick={handleDownloadConstancia}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-3 mb-4">
            <HiOutlineDownload className="w-6 h-6" />
            Descargar Constancia
          </button>

          <button onClick={() => { setStep(1); setSelectedVehiculo(null); setTramiteResult(null); fetchPendientes(); }}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
            Volver a la Lista
          </button>
        </div>
      )}
    </div>
  );
};

export default TramitesRetiro;
