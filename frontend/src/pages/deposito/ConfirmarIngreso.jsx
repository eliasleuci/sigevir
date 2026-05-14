import React, { useState } from 'react';
import ScannerQR from '../../components/deposito/ScannerQR';
import FormularioConfirmacion from '../../components/deposito/FormularioConfirmacion';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineCheckCircle, HiOutlineArrowLeft, HiOutlineSearch } from 'react-icons/hi';

const ConfirmarIngreso = () => {
  const [step, setStep] = useState(1); // 1: Escanear, 2: Formulario, 3: Éxito
  const [loading, setLoading] = useState(false);
  const [vehiculo, setVehiculo] = useState(null);
  const [manualDominio, setManualDominio] = useState('');

  const handleScanSuccess = async (decodedText) => {
    // El texto decodificado es el ID de la retención o el nro de expediente
    setLoading(true);
    try {
      // Buscamos la retención por el ID decodificado del QR
      const response = await apiClient.get(`/retenciones/${decodedText}`);
      setVehiculo(response.data.data);
      setStep(2);
    } catch (error) {
      toast.error('No se encontró una retención válida para este código QR.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualDominio) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/busqueda?dominio=${manualDominio}`);
      const resultados = response.data.data.resultados;
      if (resultados.length > 0) {
        setVehiculo(resultados[0]);
        setStep(2);
      } else {
        toast.error('No se encontró ningún vehículo con esa patente.');
      }
    } catch (error) {
      toast.error('Error al buscar vehículo manualmente.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarIngreso = async (ingresoData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('sector', ingresoData.sector);
      formData.append('fila', ingresoData.fila);
      formData.append('espacio', ingresoData.espacio);
      formData.append('observaciones_ingreso', ingresoData.observaciones_ingreso || '');
      
      if (ingresoData.fotos && ingresoData.fotos.length > 0) {
        ingresoData.fotos.forEach(f => formData.append('fotos', f.file));
      }

      await apiClient.post(`/depositos/${vehiculo.id}/ingreso`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStep(3);
      toast.success('Ingreso confirmado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al confirmar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Confirmar Ingreso a Depósito</h1>
        <p className="text-gray-500 font-medium">Control de recepción y ubicación física del vehículo.</p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScannerQR onScanSuccess={handleScanSuccess} />
          
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4">¿No puedes escanear?</h3>
                <p className="text-gray-500 text-sm mb-6">Busca el vehículo manualmente ingresando su número de dominio (patente).</p>
                
                <form onSubmit={handleManualSearch} className="flex gap-3">
                  <div className="flex-1 relative">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={manualDominio}
                      onChange={(e) => setManualDominio(e.target.value.toUpperCase())}
                      placeholder="PATENTE"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-black text-lg tracking-widest uppercase"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="px-8 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
                  >
                    Buscar
                  </button>
                </form>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-2xl shadow-blue-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <HiOutlineCheckCircle className="w-6 h-6" />
                Seguridad de Datos
              </h4>
              <p className="text-xs text-blue-50 leading-relaxed opacity-90">
                Al escanear el QR, el sistema registra automáticamente tu usuario, la fecha y hora exacta del ingreso. 
                Asegúrate de asignar el sector y fila correctos para facilitar su posterior egreso.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && vehiculo && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setStep(1)}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Volver al Scanner
          </button>
          <FormularioConfirmacion vehiculo={vehiculo} onSubmit={handleConfirmarIngreso} loading={loading} />
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md mx-auto py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100">
            <HiOutlineCheckCircle className="w-16 h-16" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ingreso Registrado</h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            El vehículo ha sido ingresado al depósito con éxito y se encuentra ubicado en el sector asignado. 
            El estado de la retención ha pasado a <span className="font-bold text-gray-900">"EN_DEPOSITO"</span>.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all"
          >
            Confirmar Otro Ingreso
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmarIngreso;
