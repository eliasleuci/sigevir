import React, { useState, useEffect } from 'react';
import FormularioNuevaRetencion from '../components/registro/FormularioNuevaRetencion';
import CargaFotos from '../components/registro/CargaFotos';
import PreviewActa from '../components/registro/PreviewActa';
import MuestraQR from '../components/registro/MuestraQR';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineCheckCircle, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi';

const NuevaRetencion = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const borrador = localStorage.getItem('sigevir_borrador_retencion');
    if (borrador) {
      try {
        setFormData(JSON.parse(borrador));
      } catch (e) {
        console.error('Error al cargar borrador');
      }
    }
  }, []);

  const handleNextStep = (data) => {
    setFormData(data);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmitFinal = async () => {
    if (fotos.length < 4) {
      toast.warning('Debes cargar al menos 4 fotos del vehículo');
      return;
    }

    setLoading(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    fotos.forEach(foto => {
      data.append('fotos', foto.file);
    });

    try {
      const response = await apiClient.post('/retenciones', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { id, nro_expediente, pdf_url, qr_url } = response.data.data;
      setResult({ id, nro_expediente, pdfUrl: pdf_url, qrUrl: qr_url });
      
      localStorage.removeItem('sigevir_borrador_retencion');
      setStep(3);
      toast.success('¡Retención registrada exitosamente!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al registrar la retención');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between px-4 sm:px-0">
        {[
          { s: 1, n: 'Datos del Vehículo' },
          { s: 2, n: 'Registro Fotográfico' },
          { s: 3, n: 'Acta y Finalización' }
        ].map((item) => (
          <div key={item.s} className="flex flex-col items-center gap-2 flex-1 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${
              step >= item.s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > item.s ? <HiOutlineCheckCircle className="w-6 h-6" /> : item.s}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:block ${
              step >= item.s ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {item.n}
            </span>
            {item.s < 3 && (
              <div className={`absolute top-5 left-[50%] w-full h-0.5 -z-0 ${
                step > item.s ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-black text-gray-900">Nueva Retención de Vehículo</h1>
              <button 
                type="submit" 
                form="form-retencion"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 self-start sm:self-auto"
              >
                Siguiente Paso
                <HiOutlineArrowRight className="w-5 h-5" />
              </button>
            </div>
            <FormularioNuevaRetencion 
              onSubmit={handleNextStep} 
              initialData={formData} 
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-gray-900">Carga de Evidencia</h1>
                <p className="text-gray-500 text-sm">Registra el estado actual del vehículo con fotos nítidas.</p>
              </div>
              <div className="flex gap-3 self-start sm:self-auto">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                  Volver
                </button>
                <button 
                  onClick={handleSubmitFinal}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Finalizar Registro'}
                  <HiOutlineCheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <CargaFotos fotos={fotos} setFotos={setFotos} />
          </div>
        )}

        {step === 3 && result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in duration-500">
            <div className="lg:col-span-2">
              <PreviewActa pdfUrl={result.pdfUrl} />
            </div>
            <div className="lg:col-span-1">
              <MuestraQR qrUrl={result.qrUrl} nroExpediente={result.nro_expediente} />
              
              <div className="mt-8 bg-blue-600 p-8 rounded-3xl text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-4">Próximos Pasos</h4>
                  <ul className="space-y-4 text-sm font-medium text-blue-50 opacity-90">
                    <li className="flex gap-3 items-start">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">1</span>
                      Imprime el acta y entrégala al ciudadano.
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">2</span>
                      El vehículo debe ser trasladado al depósito asignado.
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">3</span>
                      El personal de depósito escaneará el QR para confirmar el ingreso.
                    </li>
                  </ul>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-8 w-full py-4 bg-white text-blue-600 rounded-2xl font-black shadow-lg hover:bg-blue-50 transition-all"
                  >
                    Registrar Otra Retención
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NuevaRetencion;
