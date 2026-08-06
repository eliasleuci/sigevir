-- ============================================================================
-- 009_perfil_documentos.sql
-- Agrega campos de foto real y documento de identidad a la tabla perfiles.
-- ============================================================================

-- Nuevas columnas en la tabla perfiles
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS foto_perfil_url TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS documento_identidad_url TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS documento_identidad_tipo TEXT
  CHECK (documento_identidad_tipo IN ('DNI', 'PASAPORTE', 'CARNET'));
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS documentos_verificados BOOLEAN DEFAULT false;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS documentos_verificados_por UUID REFERENCES perfiles(id);
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS documentos_verificados_at TIMESTAMPTZ;

-- ============================================================================
-- STORAGE: Bucket privado para documentos de identidad
-- Ejecutar desde Supabase > Storage si el bucket no existe todavía.
-- Alternativa: crear el bucket manualmente desde el panel de Storage.
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'documentos-identidad',
  'documentos-identidad',
  false,           -- PRIVADO: acceso controlado por RLS
  ARRAY['image/jpeg','image/png','image/webp','application/pdf'],
  8388608          -- 8 MB
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLÍTICAS RLS para el bucket documentos-identidad
-- ============================================================================

-- Solo el propio usuario puede subir su documento
DROP POLICY IF EXISTS "usuario_sube_su_documento" ON storage.objects;
CREATE POLICY "usuario_sube_su_documento"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentos-identidad'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo el propio usuario y los admins pueden ver el documento
DROP POLICY IF EXISTS "usuario_o_admin_ve_documento" ON storage.objects;
CREATE POLICY "usuario_o_admin_ve_documento"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos-identidad'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
  )
);

-- Solo el propio usuario puede reemplazar su documento (UPDATE)
DROP POLICY IF EXISTS "usuario_reemplaza_su_documento" ON storage.objects;
CREATE POLICY "usuario_reemplaza_su_documento"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documentos-identidad'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
