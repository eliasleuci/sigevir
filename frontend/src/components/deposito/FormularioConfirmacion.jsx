import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineMap, HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineCamera } from 'react-icons/hi';
import CargaFotos from '../registro/CargaFotos';

const ingresoSchema = z.object({
  sector: z.string().min(1, 'Sector requerido'),
  fila: z.string().min(1, 'Fila requerida'),
  espacio: z.string().min(1, 'Número de espacio requerido'),
  inventario_json: z.string().optional(),
  observaciones_ingreso: z.string().optional(),
});

const FormularioConfirmacion = ({ vehiculo, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ingresoSchema)
  });
  const [fotosIngreso, setFotosIngreso] = useState([]);

  const handleFinalSubmit = (data) => {
    onSubmit({ ...data, fotos: fotosIngreso });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Resumen del Vehículo */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <HiOutlineClipboardList className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Datos del Acta</h3>
              <p className="text-xs text-gray-500 font-medium">Expediente: {vehiculo.nro_expediente}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dominio</p>
              <p className="text-xl font-black text-gray-900 uppercase">{vehiculo.dominio}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marca</p>
                <p className="text-sm font-bold text-gray-700">{vehiculo.marca}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modelo</p>
                <p className="text-sm font-bold text-gray-700">{vehiculo.modelo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <h4 className="text-amber-800 font-bold text-sm mb-2">Instrucciones de Ingreso</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            Verifica que el estado físico del vehículo coincida con las fotos del acta antes de confirmar. 
            Si hay daños nuevos, regístralos en las observaciones.
          </p>
        </div>
      </div>

      {/* Formulario de Ubicación e Inventario */}
      <div className="lg:col-span-2 space-y-8">
        <form id="form-ingreso" onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <HiOutlineMap className="w-6 h-6" />
              <h3 className="font-bold text-lg">Ubicación en Depósito</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Sector</label>
                <input 
                  {...register('sector')}
                  placeholder="Ej: A, B, Norte"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all uppercase"
                />
                {errors.sector && <p className="text-xs text-red-500 font-medium">{errors.sector.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Fila</label>
                <input 
                  {...register('fila')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all uppercase"
                />
                {errors.fila && <p className="text-xs text-red-500 font-medium">{errors.fila.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Espacio / Nro.</label>
                <input 
                  {...register('espacio')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all uppercase"
                />
                {errors.espacio && <p className="text-xs text-red-500 font-medium">{errors.espacio.message}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <HiOutlineViewGrid className="w-6 h-6" />
              <h3 className="font-bold text-lg">Inventario y Estado de Ingreso</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Observaciones al Ingreso</label>
                <textarea 
                  {...register('observaciones_ingreso')}
                  rows={3}
                  placeholder="Describe si hay daños visibles, faltantes de piezas o el estado general al recibirlo..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <HiOutlineCamera className="w-5 h-5 text-gray-400" />
                  Fotos de Recepción (Opcional)
                </label>
                <CargaFotos fotos={fotosIngreso} setFotos={setFotosIngreso} minFotos={0} />
              </div>
            </div>
          </section>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Confirmando Ingreso...' : 'Confirmar Ingreso a Depósito'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioConfirmacion;
