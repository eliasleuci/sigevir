import { createClient } from '@supabase/supabase-js';
import db from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncFotos() {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');

    // List all folders in retenciones-fotos
    const { data: folders, error: folderError } = await supabase.storage.from('retenciones-fotos').list();
    if (folderError) throw folderError;

    for (const folder of folders) {
      if (folder.name === '.emptyFolderPlaceholder') continue;
      
      const retencionId = folder.name;
      console.log(`Processing folder: ${retencionId}`);

      // List files in folder
      const { data: files, error: fileError } = await supabase.storage.from('retenciones-fotos').list(retencionId);
      if (fileError) {
        console.error(`Error listing ${retencionId}:`, fileError);
        continue;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name === '.emptyFolderPlaceholder') continue;

        const filePath = `${retencionId}/${file.name}`;
        const { data: { publicUrl } } = supabase.storage.from('retenciones-fotos').getPublicUrl(filePath);

        // Check if exists
        const exists = await db.FotoRetencion.findOne({ where: { url_s3: publicUrl } });
        if (!exists) {
          await db.FotoRetencion.create({
            retencion_id: retencionId,
            url_s3: publicUrl,
            descripcion: `Foto ${i + 1}`,
            orden: i + 1
          });
          console.log(`Added photo for retencion ${retencionId}`);
        }
      }
    }

    console.log('Sync complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

syncFotos();
