import { supabase } from '../config/supabase';

const BUCKET = 'documentos-egreso';

export type TipoDocumento = 'carnet' | 'seguro' | 'titulo' | 'tarjeta_verde';

export interface DocumentoEgreso {
  url: string;
  nombre: string;
  tipo: string;
}

export const uploadDocumentoEgreso = async (
  depositoId: string,
  tipo: TipoDocumento,
  file: File
): Promise<DocumentoEgreso> => {
  const ext = file.name.split('.').pop();
  const fileName = [tipo, Date.now(), Math.random().toString(36).substring(2, 8)].join("_") + "." + ext;
  const filePath = depositoId + '/' + fileName;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true });
  if (error) throw error;

  const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return {
    url: publicUrl,
    nombre: file.name,
    tipo: file.type,
  };
};