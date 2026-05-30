import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  HiOutlineUpload, HiOutlineX, HiOutlinePhotograph, HiOutlineDocumentText,
  HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineArrowLeft
} from 'react-icons/hi';
import imageCompression from 'browser-image-compression';
import { uploadDocumentoEgreso } from '../../api/uploadDocumentosEgreso';

const TIPOS_DOC = [
  { key: 'carnet', label: 'Carnet de Identidad', icon: HiOutlinePhotograph },
  { key: 'seguro', label: 'Seguro del Vehículo', icon: HiOutlineDocumentText },
  { key: 'titulo', label: 'Título de Propiedad', icon: HiOutlineDocumentText },
  { key: 'tarjeta_verde', label: 'Tarjeta Verde', icon: HiOutlinePhotograph },
];

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const MAX_SIZE = 5 * 1024 * 1024;

const DropzoneDoc = ({ tipo, label, fileData, onFile, onRemove, uploading }) => {
  const [error, setError] = useState(null);

  const onDrop = useCallback(async ([accepted]) => {
    setError(null);
    if (!accepted) return;
    if (accepted.size > MAX_SIZE) {
      setError('El archivo supera el tamaño máximo de 5 MB');
      return;
    }
    let file = accepted;
    if (file.type.startsWith('image/')) {
      try {
        file = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
      } catch { }
    }
    onFile(tipo, file);
  }, [tipo, onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: !!fileData || uploading,
    multiple: false,
  });

  const previewUrl = fileData?.preview;

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{label}</label>

      {fileData ? (
        <div className="relative p-4 bg-green-50 rounded-2xl border border-green-200 flex items-center gap-4">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-green-200" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center">
              <HiOutlineDocumentText className="w-8 h-8 text-green-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{fileData.file.name}</p>
            <p className="text-xs text-gray-500">{formatBytes(fileData.file.size)}</p>
            {uploading && <p className="text-xs text-blue-600 font-medium mt-1">Subiendo...</p>}
            {fileData.url && <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1"><HiOutlineCheckCircle className="w-3 h-3" />Subido</p>}
          </div>
          <button type="button" onClick={() => onRemove(tipo)}
            className="p-1.5 bg-white rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all shadow-sm border border-gray-200">
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div {...getRootProps()} className={
          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all '
          + (isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50')
        }>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className={'p-3 rounded-full ' + (isDragActive ? 'bg-blue-100' : 'bg-gray-100')}>
              <HiOutlineUpload className={'w-6 h-6 ' + (isDragActive ? 'text-blue-500' : 'text-gray-400')} />
            </div>
            <p className="text-sm font-medium text-gray-600">
              {isDragActive ? 'Suelta el archivo' : 'Arrastrá o hacé clic'}
            </p>
            <p className="text-xs text-gray-400">PDF, JPG, PNG - Máx 5 MB</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

const CargaDocumentosEgreso = ({ vehiculo, documentos, setDocumentos, onContinue, onBack, loading }) => {
  const [uploading, setUploading] = useState({});

  const handleFile = (tipo, file) => {
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setDocumentos(prev => ({ ...prev, [tipo]: { file, preview, url: null } }));
  };

  const handleRemove = (tipo) => {
    const prev = documentos[tipo];
    if (prev?.preview) URL.revokeObjectURL(prev.preview);
    setDocumentos(prev => {
      const copy = { ...prev };
      delete copy[tipo];
      return copy;
    });
  };

  const handleContinue = async () => {
    const docsToUpload = TIPOS_DOC.filter(t => documentos[t.key]);
    if (docsToUpload.length === 0) return;

    setUploading(Object.fromEntries(docsToUpload.map(t => [t.key, true])));

    const results = {};
    for (const { key } of docsToUpload) {
      try {
        const result = await uploadDocumentoEgreso(vehiculo.id, key, documentos[key].file);
        results[key] = result;
        setDocumentos(prev => ({ ...prev, [key]: { ...prev[key], url: result.url } }));
      } catch (err) {
        console.error('Error subiendo ' + key, err);
      }
      setUploading(prev => ({ ...prev, [key]: false }));
    }

    if (Object.keys(results).length > 0) {
      onContinue(results);
    }
  };

  const hasDocs = TIPOS_DOC.some(t => documentos[t.key]);
  const allUploaded = TIPOS_DOC.filter(t => documentos[t.key]).every(t => documentos[t.key]?.url);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
      <div className="p-6 sm:p-8 bg-gray-900 text-white">
        <h3 className="text-2xl font-black tracking-tight">Documentación de Egreso</h3>
        <p className="text-gray-400 text-sm font-medium mt-1">
          {vehiculo.dominio} - {vehiculo.nro_expediente}
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
          <HiOutlineExclamation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 font-medium leading-relaxed">
            Cargá la documentación presentada para el retiro del vehículo.
            Se aceptan fotos (JPG, PNG) y archivos PDF. Las imágenes se comprimirán automáticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIPOS_DOC.map(t => (
            <DropzoneDoc
              key={t.key}
              tipo={t.key}
              label={t.label}
              fileData={documentos[t.key]}
              onFile={handleFile}
              onRemove={handleRemove}
              uploading={uploading[t.key]}
            />
          ))}
        </div>

        {!hasDocs && (
          <div className="py-8 flex flex-col items-center text-gray-400">
            <HiOutlinePhotograph className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm font-medium">No hay documentos cargados</p>
            <p className="text-xs">Cargá al menos un documento para continuar</p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button type="button" onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
            <HiOutlineArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <button type="button" onClick={handleContinue} disabled={!hasDocs || loading || Object.values(uploading).some(Boolean)}
            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Subiendo documentos...' : 'Confirmar Egreso'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CargaDocumentosEgreso;

