import { supabase } from '../config/supabase';

/**
 * Upload an array of files to the `retenciones-fotos` bucket, using the retención ID as folder.
 * Returns an array of public URLs.
 */
export const uploadFotos = async (retencionId: string, files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const filePath = `${retencionId}/${file.name}`;
    const { error } = await supabase.storage
      .from('retenciones-fotos')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { publicUrl } = supabase.storage.from('retenciones-fotos').getPublicUrl(filePath);
    urls.push(publicUrl);
  }
  // Update the retención row with the array of URLs
  const { error: errUpd } = await supabase
    .from('retenciones')
    .update({ fotos: urls })
    .eq('id', retencionId);
  if (errUpd) throw errUpd;
  return urls;
};
