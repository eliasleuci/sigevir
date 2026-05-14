import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineExternalLink, HiOutlineExclamation, HiOutlineCalendar } from 'react-icons/hi';

const egresoSchema = z.object({
  razon_egreso: z.string().min(5, 'Especifica la razón del egreso'),
  quien_retira: z.string().min(3, 'Nombre de quien retira requerido'),
  dni_quien_retira: z.string().min(7, 'DNI requerido'),
  observaciones_finales: z.string().optional(),
});

const FormularioEgreso = ({ vehiculo, onSubmit, loading, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(egresoSchema)
  });

  const dias = Math.floor((new Date() - new Date(vehiculo.fecha_ingreso)) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
      <div className="p-6 sm:p-8 bg-gray-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight">Registrar Egreso de Vehículo</h3>
          <p className="text-gray-400 text-sm font-medium">Expediente: {vehiculo.nro_expediente}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estadía Total</p>
          <p className="text-2xl font-black">{dias} Días</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm font-black">
                {vehiculo.tipo_vehiculo?.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase">Vehículo Registrado</p>
                <p className="text-lg font-black text-gray-900">{vehiculo.dominio} - {vehiculo.marca} {vehiculo.modelo}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Resolución Judicial</h4>
              <div className="flex items-start gap-3">
                <HiOutlineCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Fecha: {new Date(vehiculo.Resolucion?.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">"{vehiculo.Resolucion?.observaciones || 'Sin observaciones'}"</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Nombre Retira</label>
                  <input 
                    {...register('quien_retira')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  {errors.quien_retira && <p className="text-xs text-red-500 font-medium">{errors.quien_retira.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">DNI Retira</label>
                  <input 
                    {...register('dni_quien_retira')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  {errors.dni_quien_retira && <p className="text-xs text-red-500 font-medium">{errors.dni_quien_retira.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Razón de Egreso</label>
                <select 
                  {...register('razon_egreso')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  <option value="RESTITUCION">Restitución al Titular</option>
                  <option value="SUBASTA">Subastado</option>
                  <option value="COMPACTACION">Enviado a Compactación</option>
                  <option value="TRASLADO">Traslado a otra sede</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Observaciones Finales</label>
                <textarea 
                  {...register('observaciones_finales')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
              <HiOutlineExclamation className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                Esta acción es irreversible y marcará el vehículo como retirado del sistema SIGEVIR. 
                Asegúrate de haber verificado la identidad de quien retira.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Procesando...' : 'Confirmar Egreso'}
                <HiOutlineExternalLink className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioEgreso;
