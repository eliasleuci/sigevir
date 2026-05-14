import React from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineCalendar, HiOutlineIdentification, HiOutlineHashtag, HiOutlineTruck } from 'react-icons/hi';

const FormularioBusquedaAvanzada = ({ onSearch, onClear, loading }) => {
  const { register, handleSubmit, reset } = useForm();

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-8 animate-in slide-in-from-top-8 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <HiOutlineAdjustments className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Filtros de Búsqueda Avanzada</h3>
        </div>
        <button 
          type="button"
          onClick={() => { reset(); onClear(); }}
          className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest self-start sm:self-auto"
        >
          Limpiar Filtros
        </button>
      </div>

      <form onSubmit={handleSubmit(onSearch)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dominio / Patente</label>
            <div className="relative">
              <HiOutlineTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                {...register('dominio')}
                placeholder="PATENTE"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-black text-gray-900 uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nro. de Motor o Cuadro</label>
            <div className="relative">
              <HiOutlineHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                {...register('nro_identificacion')}
                placeholder="MOTOR / CHASIS"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DNI / CUIT Titular</label>
            <div className="relative">
              <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                {...register('titular_dni')}
                placeholder="DNI SIN PUNTOS"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado del Vehículo</label>
            <select 
              {...register('estado')}
              className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 bg-white"
            >
              <option value="">TODOS LOS ESTADOS</option>
              <option value="RETENIDO_EN_TRANSITO">RETENIDO EN TRÁNSITO</option>
              <option value="EN_DEPOSITO">EN DEPÓSITO</option>
              <option value="RESOLUCION_PENDIENTE">RESOLUCIÓN PENDIENTE</option>
              <option value="LIBERADO">LIBERADO / EGRESADO</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Desde</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  type="date"
                  {...register('fecha_desde')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Hasta</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  type="date"
                  {...register('fecha_hasta')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <HiOutlineSearch className="w-7 h-7" />
                  Ejecutar Búsqueda Avanzada
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormularioBusquedaAvanzada;
