import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiOutlineX, HiOutlinePhotograph, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineArrowLeft, HiOutlineCalendar } from 'react-icons/hi';
import imageCompression from 'browser-image-compression';
import { uploadDocumentoEgreso } from '../../api/uploadDocumentosEgreso';
import { toast } from 'react-toastify';

const MAX_SIZE = 5 * 1024 * 1024;
const formatBytes = (b) => { if (!b) return '0 B'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; };

const TIPOS_DOC = [
  { key: 'carnet', label: 'Carnet de Identidad' },
  { key: 'seguro', label: 'Seguro del Vehículo' },
  { key: 'titulo', label: 'Título de Propiedad' },
  { key: 'tarjeta_verde', label: 'Tarjeta Verde' },
];

const tramiteSchema = z.object({
  quien_retira: z.string().min(3, 'Nombre de quien retira requerido'),
  dni_quien_retira: z.string().min(6, 'DNI requerido'),
  razon_egreso: z.string().min(5, 'Especifica la razón del egreso'),
});

const DropzoneDoc = ({ tipo, label, fileData, onFile, onRemove, uploading }) => {
  const [error, setError] = useState(null);
  const onDrop = useCallback(async ([accepted]) => {
    setError(null);
    if (!accepted) return;
    if (accepted.size > MAX_SIZE) { setError('El archivo supera el tamaño máximo de 5 MB'); return; }
    let file = accepted;
    if (file.type.startsWith('image/')) {
      try { file = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }); } catch {}
    }
    onFile(tipo, file);
  }, [tipo, onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1, disabled: !!fileData || uploading, multiple: false
  });
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label} <span className="text-red-500">*</span></label>
      {fileData ? (
        <div className="relative p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
          {fileData.preview ? (
            <img src={fileData.preview} alt="" className="w-12 h-12 rounded-lg object-cover border border-green-200" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <HiOutlineDocumentText className="w-6 h-6 text-green-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{fileData.file.name}</p>
            <p className="text-[10px] text-gray-500">{formatBytes(fileData.file.size)}</p>
            {fileData.url && <p className="text-[10px] text-green-600 font-medium flex items-center gap-1"><HiOutlineCheckCircle className="w-3 h-3" />Subido</p>}
          </div>
          <button type="button" onClick={() => onRemove(tipo)} className="p-1 bg-white rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200">
            <HiOutlineX className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div {...getRootProps()} className={'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ' + (isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50')}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-1">
            <div className={'p-2 rounded-full ' + (isDragActive ? 'bg-blue-100' : 'bg-gray-100')}>
              <HiOutlineUpload className={'w-4 h-4 ' + (isDragActive ? 'text-blue-500' : 'text-gray-400')} />
            </div>
            <p className="text-[11px] font-medium text-gray-600">{isDragActive ? 'Suelta' : 'Arrastrá o click'}</p>
            <p className="text-[10px] text-gray-400">PDF, JPG, PNG - 5 MB máx</p>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

const FormularioTramite = ({ vehiculo, onSubmit, onBack, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(tramiteSchema) });
  const [documentos, setDocumentos] = useState({});
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const dias = Math.floor((new Date() - new Date(vehiculo.fecha_ingreso)) / (1000 * 60 * 60 * 24));

  const handleFile = (tipo, file) => {
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setDocumentos(prev => ({ ...prev, [tipo]: { file, preview, url: null } }));
  };
  const handleRemoveFile = (tipo) => {
    const prev = documentos[tipo];
    if (prev?.preview) URL.revokeObjectURL(prev.preview);
    setDocumentos(prev => { const copy = { ...prev }; delete copy[tipo]; return copy; });
  };

  const onFormSubmit = async (formData) => {
    const missingDocs = TIPOS_DOC.filter(t => !documentos[t.key]);
    if (missingDocs.length > 0) {
      toast.error('Debe adjuntar todos los documentos requeridos (' + missingDocs.map(d => d.label).join(', ') + ').');
      return;
    }

    setSubmitting(true);
    const resultados = {};
    const docsToUpload = TIPOS_DOC.filter(t => documentos[t.key]);
    setUploading(Object.fromEntries(docsToUpload.map(t => [t.key, true])));
    for (const { key } of docsToUpload) {
      try {
        const result = await uploadDocumentoEgreso(vehiculo.id, key, documentos[key].file);
        resultados[key] = result;
        setDocumentos(prev => ({ ...prev, [key]: { ...prev[key], url: result.url } }));
      } catch (err) { console.error('Error subiendo ' + key, err); }
      setUploading(prev => ({ ...prev, [key]: false }));
    }
    onSubmit({ ...formData, documentos_egreso: resultados });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
      <div className="p-6 sm:p-8 bg-gray-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight">Trámite de Retiro</h3>
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
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm font-black">{vehiculo.tipo_vehiculo?.charAt(0)}</div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase">Vehículo</p>
                <p className="text-lg font-black text-gray-900">{vehiculo.dominio} - {vehiculo.marca} {vehiculo.modelo}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Resolución Judicial</h4>
              <div className="flex items-start gap-3">
                <HiOutlineCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Fecha: {new Date(vehiculo.resolucion_judicial?.createdAt || vehiculo.Resolucion?.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">"{vehiculo.resolucion_judicial?.observaciones || vehiculo.Resolucion?.observaciones || 'Sin observaciones'}"</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <HiOutlineExclamation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-medium leading-relaxed">Completá los datos de quien retira y cargá la documentación presentada. Las imágenes se comprimen automáticamente.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Nombre Quien Retira</label>
                  <input {...register('quien_retira')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  {errors.quien_retira && <p className="text-xs text-red-500 font-medium">{errors.quien_retira.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">DNI Quien Retira</label>
                  <input {...register('dni_quien_retira')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  {errors.dni_quien_retira && <p className="text-xs text-red-500 font-medium">{errors.dni_quien_retira.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Razón de Egreso</label>
                <select {...register('razon_egreso')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white">
                  <option value="">Seleccionar...</option>
                  <option value="RESTITUCION">Restitución al Titular</option>
                  <option value="SUBASTA">Subastado</option>
                  <option value="COMPACTACION">Enviado a Compactación</option>
                  <option value="TRASLADO">Traslado a otra sede</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">Documentación Recibida</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TIPOS_DOC.map(t => (
                  <DropzoneDoc key={t.key} tipo={t.key} label={t.label} fileData={documentos[t.key]} onFile={handleFile} onRemove={handleRemoveFile} uploading={uploading[t.key]} />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onBack} className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                <HiOutlineArrowLeft className="w-5 h-5" /> Volver
              </button>
              <button type="submit" disabled={loading || submitting || Object.values(uploading).some(Boolean)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Procesando...' : 'Iniciar Trámite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioTramite;
