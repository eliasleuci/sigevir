import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function emptyBucket() {
  try {
    const { data: folders, error: folderError } = await supabase.storage.from('retenciones-fotos').list();
    if (folderError) throw folderError;

    for (const folder of folders) {
      if (folder.name === '.emptyFolderPlaceholder') continue;
      
      const { data: files, error: fileError } = await supabase.storage.from('retenciones-fotos').list(folder.name);
      if (fileError) continue;

      if (files.length > 0) {
        const filePaths = files.map(f => `${folder.name}/${f.name}`);
        await supabase.storage.from('retenciones-fotos').remove(filePaths);
      }
      
      // Remove the folder placeholder if any
      await supabase.storage.from('retenciones-fotos').remove([folder.name]);
    }
    console.log('Bucket emptied successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

emptyBucket();
