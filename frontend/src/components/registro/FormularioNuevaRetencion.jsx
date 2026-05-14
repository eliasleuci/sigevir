import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { retencionSchema } from '../../schemas/retencion.schema';
import { HiOutlineInformationCircle, HiOutlineUser, HiOutlineTruck, HiOutlineLocationMarker } from 'react-icons/hi';

const FormularioNuevaRetencion = ({ onSubmit, loading, initialData = {} }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    reset
  } = useForm({
    resolver: zodResolver(retencionSchema),
    defaultValues: initialData
  });

  // Guardado automático en borrador (localStorage)
  const formValues = watch();
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      localStorage.setItem('sigevir_borrador_retencion', JSON.stringify(formValues));
    }
  }, [formValues]);

  return (
    <form id="form-retencion" onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      {/* Sección 1: Datos del Vehículo */}
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

      {/* Sección 2: Datos del Titular/Infractor */}
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

      {/* Sección 3: Datos del Procedimiento */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineLocationMarker className="w-6 h-6" />
          <h3 className="font-bold text-lg">Información de la Retención</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Lugar de Retención</label>
            <input 
              {...register('lugar_retencion')}
              placeholder="Calle, intersección o coordenadas"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {errors.lugar_retencion && <p className="text-xs text-red-500 font-medium">{errors.lugar_retencion.message}</p>}
          </div>

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
