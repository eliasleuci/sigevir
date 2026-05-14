import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/apiClient';
import { retencionSchema } from '../../schemas/retencion.schema';
import CargaFotos from './CargaFotos';
import PreviewActa from './PreviewActa';
import MuestraQR from './MuestraQR';

/**
 * Formulario para crear una nueva retención.
 * - Usa React Hook Form + Zod.
 * - Guarda borrador en localStorage.
 * - Maneja estados: empty → filling → ready → submitting → success.
 */
const FormularioNuevaRetencion = () => {
  const methods = useForm({
    resolver: zodResolver(retencionSchema),
    mode: 'onChange',
    defaultValues: JSON.parse(localStorage.getItem('retencionDraft') || '{}'),
  });

  const { handleSubmit, watch, setError, clearErrors, formState } = methods;
  const [state, setState] = useState('empty'); // empty, filling, ready, submitting, success
  const [expediente, setExpediente] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [actaUrl, setActaUrl] = useState(null);
  const [photos, setPhotos] = useState([]);

  // Guardado de borrador
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('retencionDraft', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Detectar cambios para actualizar estado
  useEffect(() => {
    const hasValues = Object.values(methods.getValues()).some((v) => v);
    if (hasValues) setState('filling');
    else setState('empty');
  }, [watch]);

  const onSubmit = async (data) => {
    if (photos.length < 4) {
      toast.error('Debe subir al menos 4 fotos');
      return;
    }
    setState('submitting');
    try {
      const formData = new FormData();
      // Append fields del formulario
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // objetos anidados (agente, titular)
          Object.entries(value).forEach(([k, v]) => {
            formData.append(`${key}[${k}]`, v);
          });
        } else {
          formData.append(key, value);
        }
      });
      // Append fotos
      photos.forEach((file, idx) => {
        formData.append('fotos', file, `foto_${idx}.jpg`);
      });

      const response = await axiosInstance.post('/retenciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { numero_expediente, qr_url, acta_url } = response.data;
      setExpediente(numero_expediente);
      setQrUrl(qr_url);
      setActaUrl(acta_url);
      setState('success');
      localStorage.removeItem('retencionDraft');
      toast.success('Retención creada correctamente');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al crear la retención');
      setState('ready');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Aquí irían los inputs del formulario; por brevedad se delegan a un componente interno */}
        {/* Ejemplo de campo dominio */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dominio">Dominio</label>
          <Controller
            name="dominio"
            control={methods.control}
            render={({ field }) => (
              <input
                {...field}
                id="dominio"
                className={`w-full border rounded px-3 py-2 ${formState.errors.dominio ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}
          />
          {formState.errors.dominio && (
            <p className="text-red-600 text-sm mt-1">{formState.errors.dominio.message}</p>
          )}
        </div>
        {/* Se pueden añadir más campos siguiendo el mismo patrón */}

        {/* Carga de fotos */}
        <CargaFotos photos={photos} setPhotos={setPhotos} />

        {/* Botones de envío */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              setState('empty');
              methods.reset();
              setPhotos([]);
              localStorage.removeItem('retencionDraft');
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {state === 'submitting' ? 'Creando...' : 'Crear Retención'}
          </button>
        </div>

        {/* Vista de éxito */}
        {state === 'success' && (
          <div className="mt-6 space-y-4">
            <p className="text-green-700 font-semibold">Expediente creado: {expediente}</p>
            {actaUrl && <PreviewActa actaUrl={actaUrl} />}
            {qrUrl && <MuestraQR qrUrl={qrUrl} />}
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default FormularioNuevaRetencion;
