import { useState, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

/**
 * FotoPerfilUploader
 * Permite subir una foto de perfil REAL (no un avatar de galería).
 * Convive con AvatarPicker — el usuario puede usar cualquier método.
 * Al subir una foto real, anula el avatar_url previo y actualiza foto_perfil_url.
 */
const FotoPerfilUploader = () => {
  const { perfil, actualizarPerfil, user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const fotoActual = preview || perfil?.foto_perfil_url || perfil?.avatar_url;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    // Mostrar preview local inmediato antes de subir
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const path = `${user.id}/perfil.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Actualizar foto_perfil_url y limpiar avatar_url
      const result = await actualizarPerfil({
        foto_perfil_url: urlData.publicUrl,
        avatar_url: null,
      });

      if (!result?.success) throw new Error(result?.error || 'Error al guardar');

      toast.success('✅ Foto de perfil actualizada');
    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      toast.error('Error al subir la foto. Intenta de nuevo.');
      setPreview(null); // revertir preview
    } finally {
      setUploading(false);
      // limpiar input para permitir re-selección del mismo archivo
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Vista previa circular */}
      <div className="relative group">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center">
          {fotoActual ? (
            <img
              src={fotoActual}
              alt="Foto de perfil"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-4xl select-none">👤</span>
          )}
        </div>

        {/* Overlay de upload al hover */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-not-allowed"
          title="Subir foto real"
        >
          {uploading ? (
            <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="foto-perfil-input"
      />

      <div className="text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : 'Subir foto real'}
        </button>
        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG o WEBP · Máx. 5MB</p>
      </div>
    </div>
  );
};

export default FotoPerfilUploader;
