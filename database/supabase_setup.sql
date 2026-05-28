-- ════════════════════════════════════════════════════════════════════════════
-- SIGEVIR — Script de configuración Supabase
-- INSTRUCCIONES: Pegar en Supabase Dashboard → SQL Editor → Run
-- Ejecutar UNA SOLA VEZ al configurar el proyecto
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Tipos de personal ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tipos_personal (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  descripcion TEXT,
  rol         TEXT        NOT NULL
              CHECK (rol IN ('agente_campo','deposito','fiscal_juez','admin')),
  color       TEXT        DEFAULT '#2E75B6',
  icono       TEXT        DEFAULT '👤',
  activo      BOOLEAN     DEFAULT true,
  orden       INT         DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seeder: 7 tipos predefinidos (idempotente con ON CONFLICT)
INSERT INTO tipos_personal (nombre, descripcion, rol, color, icono, orden) VALUES
  ('Policía',                'Personal policial de campo',          'agente_campo', '#2E75B6', '👮', 1),
  ('Inspector de tránsito',  'Inspector o agente de control vial',  'agente_campo', '#2E75B6', '🚦', 2),
  ('Responsable de depósito','Corralón o predio de retención',      'deposito',     '#1D9E75', '🏭', 3),
  ('Juez',                   'Magistrado judicial',                  'fiscal_juez',  '#7F77DD', '⚖️', 4),
  ('Fiscal',                 'Fiscal de instrucción o penal',       'fiscal_juez',  '#7F77DD', '📋', 5),
  ('Secretario judicial',    'Secretaría del juzgado o fiscalía',   'fiscal_juez',  '#7F77DD', '📝', 6),
  ('Administrador',          'Gestión completa del sistema',        'admin',        '#BA7517', '⚙️', 7)
ON CONFLICT DO NOTHING;

-- ── 2. Perfiles de usuario (vinculados a Supabase Auth) ─────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre_completo  TEXT        NOT NULL,
  dni              TEXT,
  telefono         TEXT,
  cargo            TEXT,
  email            TEXT,
  institucion      TEXT,
  rol              TEXT        NOT NULL DEFAULT 'agente_campo'
                   CHECK (rol IN ('agente_campo','deposito','fiscal_juez','admin')),
  tipo_personal_id UUID        REFERENCES tipos_personal(id),
  activo           BOOLEAN     DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_perfiles_rol      ON perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_activo   ON perfiles(activo);
CREATE INDEX IF NOT EXISTS idx_perfiles_tipo     ON perfiles(tipo_personal_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_email    ON perfiles(email);

-- ── 3. Trigger: crear perfil automático al registrarse ──────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_role TEXT;
  v_active BOOLEAN;
BEGIN
  -- Determinar rol y si el dominio está permitido
  SELECT rol INTO v_role FROM obtener_rol_por_email(NEW.email) LIMIT 1;
  IF v_role IS NULL THEN
    v_role := COALESCE(NEW.raw_user_meta_data->>'rol', 'agente_campo');
    v_active := false; -- dominio no permitido, marcar como pendiente
  ELSE
    v_active := true;
  END IF;

  INSERT INTO public.perfiles (
    id, nombre_completo, dni, telefono,
    cargo, email, institucion, rol, tipo_personal_id, activo
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'dni',
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'cargo',
    NEW.email,
    NEW.raw_user_meta_data->>'institucion',
    v_role,
    NULLIF(NEW.raw_user_meta_data->>'tipo_personal_id', '')::UUID,
    v_active
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 4. Row Level Security (RLS) ─────────────────────────────────────────────

-- ── Función auxiliar para evitar bucle infinito en RLS ────────────────────────
CREATE OR REPLACE FUNCTION es_admin() RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

-- Tipos de personal: lectura pública de activos, escritura solo admin
ALTER TABLE tipos_personal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tipos_lectura_publica" ON tipos_personal;
CREATE POLICY "tipos_lectura_publica"
  ON tipos_personal FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "admin_gestiona_tipos" ON tipos_personal;
CREATE POLICY "admin_gestiona_tipos"
  ON tipos_personal FOR ALL
  USING (es_admin());

-- Perfiles: cada uno ve el suyo; admin ve todos
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ver_propio_perfil" ON perfiles;
CREATE POLICY "ver_propio_perfil"
  ON perfiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_gestiona_perfiles" ON perfiles;
CREATE POLICY "admin_gestiona_perfiles"
  ON perfiles FOR ALL
  USING (es_admin());

DROP POLICY IF EXISTS "usuario_actualiza_propio" ON perfiles;
CREATE POLICY "usuario_actualiza_propio"
  ON perfiles FOR UPDATE USING (auth.uid() = id);

-- ── 5. Verificación final ───────────────────────────────────────────────────
-- Ejecutar esto para verificar que todo quedó bien:
-- SELECT COUNT(*) FROM tipos_personal;  → debe dar 7
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';  → debe aparecer
