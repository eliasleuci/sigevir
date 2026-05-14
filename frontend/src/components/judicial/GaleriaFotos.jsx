import React, { useState } from 'react';
import { HiOutlinePhotograph, HiOutlineX, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineZoomIn } from 'react-icons/hi';

const GaleriaFotos = ({ fotos = [] }) => {
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedFoto(fotos[index]);
  };

  const nextFoto = (e) => {
    e.stopPropagation();
    const next = (currentIndex + 1) % fotos.length;
    setCurrentIndex(next);
    setSelectedFoto(fotos[next]);
  };

  const prevFoto = (e) => {
    e.stopPropagation();
    const prev = (currentIndex - 1 + fotos.length) % fotos.length;
    setCurrentIndex(prev);
    setSelectedFoto(fotos[prev]);
  };

  if (fotos.length === 0) {
    return (
      <div className="py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <HiOutlinePhotograph className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-bold italic">No hay registros fotográficos disponibles para esta causa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((foto, index) => (
          <div 
            key={foto.id} 
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <img 
              src={foto.url} 
              alt={`Foto ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
              <HiOutlineZoomIn className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-widest">{foto.tipo?.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {selectedFoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedFoto(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <HiOutlineX className="w-10 h-10" />
          </button>

          <button 
            onClick={prevFoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <HiOutlineChevronLeft className="w-8 h-8" />
          </button>

          <button 
            onClick={nextFoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <HiOutlineChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-5xl w-full flex flex-col items-center">
            <img 
              src={selectedFoto.url} 
              alt="Foto ampliada" 
              className="max-h-[80vh] w-auto rounded-xl shadow-2xl object-contain animate-in zoom-in duration-300"
            />
            <div className="mt-6 text-center">
              <p className="text-white font-black text-xl uppercase tracking-tighter mb-1">
                {selectedFoto.tipo?.replace('_', ' ')}
              </p>
              <p className="text-white/60 text-sm">
                Registrada el {new Date(selectedFoto.createdAt).toLocaleString()} por {selectedFoto.Usuario?.nombre || 'Sistema'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaFotos;
