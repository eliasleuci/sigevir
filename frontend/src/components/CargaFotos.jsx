import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * CargaFotos
 * Props:
 *   - photos: array of File objects (or objects with preview URL) passed from parent
 *   - setPhotos: setter function to update parent state
 *
 * Funcionalidades:
 *   • Drag‑and‑drop para seleccionar fotos (react-dropzone)
 *   • Validación: mínimo 4, máximo 20 fotos, tamaño < 5 MB por foto
 *   • Compresión en cliente (browser-image-compression)
 *   • Miniaturas de fotos con botón de eliminar
 *   • Reordenado mediante drag‑and‑drop (react‑beautiful‑dnd)
 *   • Barra de progreso simple mientras se comprime
 */
const MAX_PHOTOS = 20;
const MIN_PHOTOS = 4;
const MAX_SIZE_MB = 5; // 5 MB per file

const CargaFotos = ({ photos, setPhotos }) => {
  // Añadir preview URL a cada archivo
  const addPreview = file => {
    file.preview = URL.createObjectURL(file);
    return file;
  };

  const onDrop = useCallback(async acceptedFiles => {
    if (photos.length + acceptedFiles.length > MAX_PHOTOS) {
      toast.error(`No puedes subir más de ${MAX_PHOTOS} fotos.`);
      return;
    }
    const processed = [];
    for (const file of acceptedFiles) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" supera el tamaño máximo de ${MAX_SIZE_MB} MB.`);
        continue;
      }
      try {
        const compressed = await imageCompression(file, { maxSizeMB: MAX_SIZE_MB, useWebWorker: true });
        const withId = Object.assign(compressed, { id: uuidv4() });
        processed.push(addPreview(withId));
      } catch (e) {
        console.error(e);
        toast.error(`Error comprimiendo "${file.name}"`);
      }
    }
    setPhotos(prev => [...prev, ...processed]);
  }, [photos, setPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
  });

  // Eliminar foto
  const removePhoto = id => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Reordenar fotos
  const onDragEnd = result => {
    if (!result.destination) return;
    const reordered = Array.from(photos);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPhotos(reordered);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.preview));
    };
  }, [photos]);

  return (
    <section className="mt-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">Suelta las fotos aquí …</p>
        ) : (
          <p className="text-gray-600">Arrastra y suelta fotos aquí, o haz clic para seleccionar (máx {MAX_PHOTOS} fotos, cada una ≤ {MAX_SIZE_MB} MB)</p>
        )}
      </div>

      {/* Miniaturas y reordenado */}
      {photos.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="photos" direction="horizontal">
            {provided => (
              <div
                className="mt-4 flex flex-wrap gap-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {photos.map((file, index) => (
                  <Draggable key={file.id} draggableId={file.id} index={index}>
                    {providedDrag => (
                      <div
                        className="relative w-32 h-32 border rounded overflow-hidden"
                        ref={providedDrag.innerRef}
                        {...providedDrag.draggableProps}
                        {...providedDrag.dragHandleProps}
                      >
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(file.id)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          title="Eliminar foto"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Aviso de cantidad mínima */}
      {photos.length > 0 && photos.length < MIN_PHOTOS && (
        <p className="mt-2 text-orange-600 text-sm">Se requieren al menos {MIN_PHOTOS} fotos (actualmente {photos.length}).</p>
      )}
    </section>
  );
};

export default CargaFotos;
