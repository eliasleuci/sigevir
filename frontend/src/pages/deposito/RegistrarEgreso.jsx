import React, { useState, useEffect } from 'react';
import ListaPendientesEgreso from '../../components/deposito/ListaPendientesEgreso';
import FormularioEgreso from '../../components/deposito/FormularioEgreso';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineCheckCircle, HiOutlineArrowLeft, HiOutlineLibrary } from 'react-icons/hi';

const RegistrarEgreso = () => {
  const [loading, setLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [step, setStep] = useState(1); // 1: Lista, 2: Formulario, 3: Éxito

  useEffect(() => {
    fetchVehiculosPendientes();
  }, []);

  const fetchVehiculosPendientes = async () => {
    setLoading(true);
    try {
      // Buscamos vehículos con estado RESOLUCION_PENDIENTE o LIBERADO
      const response = await apiClient.get('/depositos/pendientes-egreso');
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

  const handleConfirmarEgreso = async (egresoData) => {
    setLoading(true);
    try {
      await apiClient.post(`/depositos/${selectedVehiculo.id}/egreso`, egresoData);
      setStep(3);
      toast.success('¡Egreso registrado exitosamente!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar el egreso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Registro de Egresos</h1>
          <p className="text-gray-500 font-medium">Gestión de salida definitiva de vehículos del depósito.</p>
        </div>
        
        {step === 1 && (
          <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-blue-100">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black shadow-lg shadow-blue-200">
              {vehiculos.length}
            </div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-widest leading-none">Vehículos<br/>Pendientes</p>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ListaPendientesEgreso 
            vehiculos={vehiculos} 
            onSelect={handleSelectVehiculo} 
            loading={loading} 
          />
        </div>
      )}

      {step === 2 && selectedVehiculo && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <FormularioEgreso 
            vehiculo={selectedVehiculo} 
            onSubmit={handleConfirmarEgreso} 
            loading={loading}
            onCancel={() => setStep(1)}
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
          <h2 className="text-3xl font-black text-gray-900 mb-4">Egreso Confirmado</h2>
          <p className="text-gray-500 mb-10 leading-relaxed italic">
            El vehículo ha sido entregado correctamente y el historial ha sido actualizado con los datos de quien retiró la unidad.
          </p>
          <button 
            onClick={() => {
              setStep(1);
              fetchVehiculosPendientes();
            }}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            Volver a la Lista
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrarEgreso;
