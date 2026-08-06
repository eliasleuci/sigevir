import { useState, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const TIPOS_DOCUMENTO = [
  { value: 'DNI', label: 'DNI (Documento Nacional de Identidad)' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'CARNET', label: 'Carnet profesional' },
];

/**
 * DocumentoIdentidadUploader
 * Permite al agente cargar su DNI / Pasaporte / Carnet al bucket PRIVADO.
 * Al subir un documento nuevo, documentos_verificados se resetea a false
 * requiriendo nueva validación manual del admin.
 */
const DocumentoIdentidadUploader = () => {
  const { perfil, actualizarPerfil, user } = useAuth();
  const [tipoDoc, setTipoDoc] = useState(perfil?.documento_identidad_tipo || 'DNI');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const yaSubio = !!perfil?.documento_identidad_url;
  const verificado = !!perfil?.documentos_verificados;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 8MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      // El path incluye el user.id como carpeta: la política RLS lo requiere
      const path = `${user.id}/documento.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos-identidad')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Guardamos el path relativo (bucket privado → no hay URL pública)
      const result = await actualizarPerfil({
        documento_identidad_url: path,
        documento_identidad_tipo: tipoDoc,
        documentos_verificados: false, // Requiere nueva verificación manual
      });

      if (!result?.success) throw new Error(result?.error || 'Error al guardar');

      toast.success('📄 Documento subido. Pendiente de verificación por el administrador.');
    } catch (error) {
      console.error('Error subiendo documento:', error);
      toast.error('Error al subir el documento. Intenta de nuevo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 p-5 border border-gray-200 rounded-2xl bg-gray-50">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
        <h4 className="text-sm font-bold text-gray-800">Documento de identidad</h4>
      </div>

      {/* Selector de tipo */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de documento</label>
        <select
          value={tipoDoc}
          onChange={(e) => setTipoDoc(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all"
        >
          {TIPOS_DOCUMENTO.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Estado actual del documento */}
      <div className="flex items-center gap-2 min-h-[28px]">
        {yaSubio ? (
          <>
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700 font-medium">
              {perfil?.documento_identidad_tipo || 'Documento'} cargado
            </span>
            {verificado ? (
              <span className="ml-1 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                ✓ Verificado
              </span>
            ) : (
              <span className="ml-1 inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                ⏳ Pendiente de verificación
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-400 italic">Sin documento cargado</span>
        )}
      </div>

      {/* Input oculto y botón */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="documento-identidad-input"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Subiendo...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {yaSubio ? 'Reemplazar documento' : 'Subir documento'}
          </>
        )}
      </button>
      <p className="text-xs text-center text-gray-400">JPG, PNG, WEBP o PDF · Máx. 8MB · Acceso privado</p>
    </div>
  );
};

export default DocumentoIdentidadUploader;
