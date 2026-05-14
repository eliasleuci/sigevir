import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';
import imageCompression from 'browser-image-compression';

const CargaFotos = ({ fotos, setFotos, maxFotos = 20, minFotos = 4 }) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (fotos.length + acceptedFiles.length > maxFotos) {
      alert(`Máximo ${maxFotos} fotos permitidas`);
      return;
    }

    setLoading(true);
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const compressed = await imageCompression(file, options);
          return {
            id: Math.random().toString(36).substr(2, 9),
            file: compressed,
            preview: URL.createObjectURL(compressed),
          };
        })
      );
      setFotos((prev) => [...prev, ...compressedFiles]);
    } catch (error) {
      console.error('Error comprimiendo imágenes:', error);
    } finally {
      setLoading(false);
    }
  }, [fotos, maxFotos, setFotos]);

  const removeFoto = (id) => {
    setFotos((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      // Limpiar URL de memoria
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: maxFotos - fotos.length,
  });

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <HiOutlineCloudUpload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-700">
            {isDragActive ? 'Suelta las fotos aquí' : 'Arrastra las fotos o haz click'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Mínimo {minFotos}, máximo {maxFotos} fotos (JPG, PNG)
          </p>
        </div>
        {loading && (
          <div className="mt-2 flex items-center gap-2 text-blue-600 font-medium">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Comprimiendo imágenes...
          </div>
        )}
      </div>

      {/* Grid de fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {fotos.map((foto, index) => (
          <div key={foto.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={foto.preview} 
              alt={`Foto ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <button 
                type="button"
                onClick={() => removeFoto(foto.id)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
              FOTO {index + 1}
            </div>
          </div>
        ))}
        
        {/* Placeholder if empty */}
        {fotos.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <HiOutlinePhotograph className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm font-medium">No hay fotos cargadas todavía</p>
          </div>
        )}
      </div>
      
      {fotos.length > 0 && fotos.length < minFotos && (
        <p className="text-sm text-amber-600 font-medium flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          Faltan {minFotos - fotos.length} fotos más para cumplir el mínimo requerido.
        </p>
      )}
    </div>
  );
};

export default CargaFotos;
