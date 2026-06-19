import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { retencionSchema } from '../../schemas/retencion.schema';
import { HiOutlineInformationCircle, HiOutlineUser, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineSearch } from 'react-icons/hi';
import MapaSelector from './MapaSelector';

const FormularioNuevaRetencion = ({ onSubmit, loading, initialData = {} }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue,
    reset,
    getValues
  } = useForm({
    resolver: zodResolver(retencionSchema),
    defaultValues: initialData || {}
  });

  const [coords, setCoords] = useState({
    latitud: initialData?.latitud ?? undefined,
    longitud: initialData?.longitud ?? undefined
  });

  const [isSearching, setIsSearching] = useState(false);

  const formValues = watch();
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      localStorage.setItem('sigevir_borrador_retencion', JSON.stringify(formValues));
    }
  }, [formValues]);

  const handleLocationChange = ({ lat, lng, direccion }) => {
    setCoords({ latitud: lat, longitud: lng });
    setValue('latitud', lat, { shouldValidate: true });
    setValue('longitud', lng, { shouldValidate: true });
    if (direccion) {
      setValue('lugar_retencion', direccion);
    }
  };

  const handleSearchAddress = async () => {
    const query = getValues('lugar_retencion');
    console.log('Buscar dirección:', query);
    if (!query || query.trim().length < 3) {
      alert('Por favor, ingrese al menos 3 caracteres para buscar la dirección.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      if (!res.ok) {
        const errText = await res.text();
        console.error('Geocode request error', res.status, errText);
        throw new Error('Geocode request failed');
      }
      const data = await res.json();
      console.log('Geocode response', data);
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        // actualizar mapa y dirección
        handleLocationChange({ lat: latNum, lng: lngNum, direccion: result.formatted_address });
      } else {
        alert('No se encontró la dirección exacta. Intente con más detalles.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al consultar la API de Google Maps. Verifique su conexión.');
    } finally {
      setIsSearching(false);
    }
  };

  const customSubmit = (data) => {
    onSubmit({
      ...data,
      latitud: coords.latitud ?? null,
      longitud: coords.longitud ?? null
    });
  };

  return (
    <form id="form-retencion" onSubmit={handleSubmit(customSubmit)} className="space-y-8 pb-20">
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineTruck className="w-6 h-6" />
          <h3 className="font-bold text-lg">Datos del Vehículo</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Dominio / Patente</label>
            <input 
              {...register('dominio')}
              placeholder="Ej: ABC 123"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.dominio ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'} focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all uppercase`}
            />
            {errors.dominio && <p className="text-xs text-red-500 font-medium">{errors.dominio.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Tipo de Vehículo</label>
            <select 
              {...register('tipo_vehiculo')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
            >
              <option value="AUTO">Automóvil</option>
              <option value="MOTO">Motocicleta</option>
              <option value="CAMION">Camión</option>
              <option value="PICKUP">Camioneta / Pick-up</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Marca</label>
            <input 
              {...register('marca')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.marca && <p className="text-xs text-red-500 font-medium">{errors.marca.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Modelo</label>
            <input 
              {...register('modelo')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.modelo && <p className="text-xs text-red-500 font-medium">{errors.modelo.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Color</label>
            <input 
              {...register('color')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.color && <p className="text-xs text-red-500 font-medium">{errors.color.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nro. de Motor</label>
            <input 
              {...register('nro_motor')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.nro_motor && <p className="text-xs text-red-500 font-medium">{errors.nro_motor.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nro. de Cuadro / Chasis</label>
            <input 
              {...register('nro_cuadro')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.nro_cuadro && <p className="text-xs text-red-500 font-medium">{errors.nro_cuadro.message}</p>}
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineUser className="w-6 h-6" />
          <h3 className="font-bold text-lg">Datos del Titular / Infractor</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
            <input 
              {...register('titular_nombre')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.titular_nombre && <p className="text-xs text-red-500 font-medium">{errors.titular_nombre.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">DNI / CUIT</label>
              <input 
                {...register('titular_dni')}
                placeholder="Sin puntos"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
              {errors.titular_dni && <p className="text-xs text-red-500 font-medium">{errors.titular_dni.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Domicilio</label>
              <input 
                {...register('titular_domicilio')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
              {errors.titular_domicilio && <p className="text-xs text-red-500 font-medium">{errors.titular_domicilio.message}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineLocationMarker className="w-6 h-6" />
          <h3 className="font-bold text-lg">Información de la Retención</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Lugar de Retención</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                {...register('lugar_retencion')}
                placeholder="Calle, intersección o coordenadas"
                className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddress(); } }}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={isSearching}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiOutlineSearch className="w-4 h-4" />
                )}
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {errors.lugar_retencion && <p className="text-xs text-red-500 font-medium">{errors.lugar_retencion.message}</p>}
          </div>

          <MapaSelector
            onLocationChange={handleLocationChange}
            initialPosition={
              coords.latitud ? { lat: coords.latitud, lng: coords.longitud } : null
            }
          />
          {/* Dirección seleccionada */}
          {watch('lugar_retencion') && (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Dirección seleccionada:</span> {watch('lugar_retencion')}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Motivo de Retención</label>
            <textarea 
              {...register('motivo_retencion')}
              rows={3}
              placeholder="Ej: Falta de seguro, licencia vencida, alcoholemia positiva..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.motivo_retencion && <p className="text-xs text-red-500 font-medium">{errors.motivo_retencion.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Observaciones Generales (Opcional)</label>
            <textarea 
              {...register('observaciones')}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </section>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Los datos ingresados están siendo guardados automáticamente como borrador localmente. 
          Podrás recuperar el formulario si cierras la ventana antes de finalizar.
        </p>
      </div>
    </form>
  );
};

export default FormularioNuevaRetencion;
