import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiOutlineX, HiOutlineDocument, HiOutlinePhotograph, HiOutlineDocumentText } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const FILE_ICONS = {
  image: HiOutlinePhotograph,
  pdf: HiOutlineDocumentText,
  default: HiOutlineDocument,
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUpload = ({
  onUpload,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  label = 'Arrastrá archivos o hacé clic para subir',
  helpText,
  disabled = false,
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles?.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors?.[0]?.code === 'file-too-large') {
        setError(`El archivo supera el tamaño máximo de ${formatBytes(maxSize)}`);
      } else if (rejection.errors?.[0]?.code === 'file-invalid-type') {
        setError('Tipo de archivo no soportado');
      } else {
        setError('Archivo inválido');
      }
      return;
    }

    const newFiles = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
    }));

    setFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles));

    if (onUpload) {
      onUpload(multiple ? [...files, ...newFiles] : newFiles);
    }
  }, [files, maxSize, multiple, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  });

  const removeFile = (id) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (onUpload) onUpload(updated);
      return updated;
    });
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) return FILE_ICONS.image;
    if (file.type === 'application/pdf') return FILE_ICONS.pdf;
    return FILE_ICONS.default;
  };

  const FileIcon = FILE_ICONS.default;

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <HiOutlineUpload className={`w-6 h-6 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
          <p className="text-xs text-gray-400">
            Tamaño máximo: {formatBytes(maxSize)}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((fileData) => {
              const Icon = getFileIcon(fileData.file) || FileIcon;
              return (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg"
                >
                  {fileData.preview ? (
                    <img src={fileData.preview} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{fileData.file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(fileData.file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(fileData.id)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <HiOutlineX className="w-4 h-4 text-gray-400" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
