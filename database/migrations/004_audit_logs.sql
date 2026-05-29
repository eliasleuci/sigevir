-- ════════════════════════════════════════════════════════════════════════════
-- SIGEVIR — Migración 004: Tabla audit_logs
-- Ejecutar en Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Tabla principal de auditoría ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  usuario_email TEXT,
  usuario_nombre TEXT,
  accion       TEXT        NOT NULL,
  entidad      TEXT,        -- Ej: 'retencion', 'perfil', 'usuario'
  entidad_id   TEXT,        -- ID del registro afectado
  detalle      JSONB,       -- Datos adicionales del evento
  ip           TEXT,
  origen       TEXT         -- 'web', 'api', 'sistema'
);

-- ── 2. Índices ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_created   ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_accion    ON public.audit_logs(accion);
CREATE INDEX IF NOT EXISTS idx_audit_entidad   ON public.audit_logs(entidad);

-- ── 3. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer los logs
DROP POLICY IF EXISTS "admin_lee_audit" ON public.audit_logs;
CREATE POLICY "admin_lee_audit"
  ON public.audit_logs FOR SELECT
  USING (es_admin());

-- Inserción abierta (el sistema escribe desde el frontend con service role)
-- La escritura se hace desde el backend o funciones Supabase Edge
DROP POLICY IF EXISTS "sistema_inserta_audit" ON public.audit_logs;
CREATE POLICY "sistema_inserta_audit"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ── 4. Función trigger: loguear nuevos registros de perfiles ─────────────────
CREATE OR REPLACE FUNCTION public.log_perfil_creado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (
    usuario_id, usuario_email, usuario_nombre, accion, entidad, entidad_id, origen
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.nombre_completo,
    'REGISTRO_USUARIO',
    'perfil',
    NEW.id::TEXT,
    'web'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_perfil_creado ON public.perfiles;
CREATE TRIGGER on_perfil_creado
  AFTER INSERT ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.log_perfil_creado();

-- ── 5. Seed: importar usuarios ya registrados como eventos históricos ─────────
INSERT INTO public.audit_logs (usuario_id, usuario_email, usuario_nombre, accion, entidad, entidad_id, origen, created_at)
SELECT
  id,
  email,
  nombre_completo,
  'REGISTRO_USUARIO',
  'perfil',
  id::TEXT,
  'web',
  created_at
FROM public.perfiles
ON CONFLICT DO NOTHING;
