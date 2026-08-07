-- ============================================================================
-- 011_instituciones_logos_bucket.sql
-- Crea el bucket público "instituciones-logos" para los logos institucionales
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'instituciones-logos',
  'instituciones-logos',
  true,            -- PÚBLICO: acceso de lectura sin restricciones
  ARRAY['image/jpeg','image/png','image/webp'],
  5242880          -- 5 MB
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLÍTICAS RLS para el bucket instituciones-logos
-- ============================================================================

-- Cualquier persona puede ver los logos (bucket público)
DROP POLICY IF EXISTS "public_ver_logos" ON storage.objects;
CREATE POLICY "public_ver_logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'instituciones-logos');

-- Solo usuarios autenticados (se asume administradores desde la UI) pueden subir logos
DROP POLICY IF EXISTS "auth_subir_logos" ON storage.objects;
CREATE POLICY "auth_subir_logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'instituciones-logos'
  AND auth.role() = 'authenticated'
);

-- Solo usuarios autenticados pueden actualizar/reemplazar logos
DROP POLICY IF EXISTS "auth_reemplazar_logos" ON storage.objects;
CREATE POLICY "auth_reemplazar_logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'instituciones-logos'
  AND auth.role() = 'authenticated'
);

-- Solo usuarios autenticados pueden eliminar logos
DROP POLICY IF EXISTS "auth_eliminar_logos" ON storage.objects;
CREATE POLICY "auth_eliminar_logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'instituciones-logos'
  AND auth.role() = 'authenticated'
);
