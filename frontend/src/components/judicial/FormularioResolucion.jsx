import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineUpload, HiOutlineDocumentDownload, HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaGavel } from 'react-icons/fa';

const resolucionSchema = z.object({
  tipo: z.enum(['LIBERACION', 'SUBASTA', 'COMPACTACION', 'TRASLADO', 'OTRO']),
  observaciones: z.string().min(10, 'La fundamentación debe tener al menos 10 caracteres'),
  documento_id: z.string().optional() // ID del documento subido a S3 si existe
});

const FormularioResolucion = ({ onSubmit, loading, vehiculo }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resolucionSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 flex gap-6 items-center">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-amber-600 shadow-xl shadow-amber-200/50">
          <HiOutlineExclamationCircle className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-black text-amber-900 tracking-tight uppercase leading-none">Advertencia Legal</h4>
          <p className="text-sm text-amber-800 mt-2 font-medium opacity-80 leading-relaxed">
            Está por emitir una resolución para el dominio <span className="font-black underline">{vehiculo.dominio}</span> (Exp. {vehiculo.nro_expediente}). 
            Esta acción cambiará el estado del vehículo y notificará al personal del depósito.
          </p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Resolución</label>
            <select 
              {...register('tipo')}
              className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-gray-100 text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              <option value="LIBERACION">Orden de Liberación / Restitución</option>
              <option value="SUBASTA">Orden de Subasta Pública</option>
              <option value="COMPACTACION">Orden de Compactación / Desguace</option>
              <option value="TRASLADO">Orden de Traslado / Redistribución</option>
              <option value="OTRO">Otra Decisión Judicial</option>
            </select>
            {errors.tipo && <p className="text-xs text-red-500 font-bold mt-1 ml-4">{errors.tipo.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Adjuntar Documento Firmado (Opcional)</label>
            <div className="relative group">
              <input type="file" className="hidden" id="pdf-upload" />
              <label 
                htmlFor="pdf-upload"
                className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-gray-100 border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all text-gray-500 font-bold text-sm"
              >
                <HiOutlineUpload className="w-6 h-6 group-hover:text-blue-600" />
                Subir PDF / Imagen
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fundamentos y Observaciones</label>
          <textarea 
            {...register('observaciones')}
            rows={5}
            placeholder="Escriba aquí los fundamentos legales de la resolución..."
            className="w-full px-8 py-6 rounded-[32px] bg-gray-50 border-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-medium italic"
          />
          {errors.observaciones && <p className="text-xs text-red-500 font-bold mt-1 ml-4">{errors.observaciones.message}</p>}
        </div>

        <div className="bg-gray-900 p-10 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
              <HiOutlineDocumentText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Responsable Legal</p>
              <p className="text-lg font-bold">Juzgado de Faltas Nro. 1</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 md:px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Firmando...' : 'Firmar y Emitir Resolución'}
              <FaGavel className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default FormularioResolucion;
