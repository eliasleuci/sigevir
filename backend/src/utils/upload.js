import multer from 'multer';
import { AppError } from '../middleware/errorHandler.js';

// Usamos almacenamiento en memoria porque las fotos se enviarán a un servicio como S3
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formato de archivo no soportado. Use JPG, PNG o WEBP.', 400), false);
  }
};

export const uploadFotos = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB por archivo
    files: 20 // Máximo 20 archivos por petición
  },
  fileFilter
});
