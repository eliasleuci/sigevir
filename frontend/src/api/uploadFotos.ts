import { supabase } from '../config/supabase';
import { toast } from 'react-toastify';

/**
 * Upload an array of files to the `retenciones-fotos` bucket, using the retención ID as folder.
 * Returns an array of public URLs.
 */
export const uploadFotos = async (retencionId: string, files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const uniqueId = crypto.randomUUID().split('-')[0];
    const extension = file.name.split('.').pop();
    const filePath = `${retencionId}/foto_${i + 1}_${uniqueId}.${extension}`;
    
    const { error } = await supabase.storage
      .from('retenciones-fotos')
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error('Error al subir una foto: ' + error.message);
      throw error;
    }
    const { publicUrl } = supabase.storage.from('retenciones-fotos').getPublicUrl(filePath).data;
    
    const { error: dbError } = await supabase
      .from('fotos_retenciones')
      .insert({
        id: crypto.randomUUID(),
        retencion_id: retencionId,
        url_s3: publicUrl,
        descripcion: `Foto ${urls.length + 1}`,
        orden: urls.length + 1,
        created_at: new Date().toISOString()
      });
      
    if (dbError) {
      console.error('Error insertando foto en base de datos:', dbError);
    }

    urls.push(publicUrl);
  }
  return urls;
};
