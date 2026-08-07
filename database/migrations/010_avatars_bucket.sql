-- ============================================================================
-- 010_avatars_bucket.sql
-- Crea el bucket público "avatars" para las fotos de perfil de los usuarios
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'avatars',
  'avatars',
  true,            -- PÚBLICO: acceso de lectura sin restricciones
  ARRAY['image/jpeg','image/png','image/webp'],
  5242880          -- 5 MB
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLÍTICAS RLS para el bucket avatars
-- ============================================================================

-- Cualquier persona puede ver los avatars (bucket público)
DROP POLICY IF EXISTS "public_ver_avatars" ON storage.objects;
CREATE POLICY "public_ver_avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Solo el propio usuario puede subir su avatar
DROP POLICY IF EXISTS "usuario_sube_su_avatar" ON storage.objects;
CREATE POLICY "usuario_sube_su_avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo el propio usuario puede actualizar/reemplazar su avatar
DROP POLICY IF EXISTS "usuario_reemplaza_su_avatar" ON storage.objects;
CREATE POLICY "usuario_reemplaza_su_avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo el propio usuario puede eliminar su avatar
DROP POLICY IF EXISTS "usuario_elimina_su_avatar" ON storage.objects;
CREATE POLICY "usuario_elimina_su_avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
