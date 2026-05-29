-- ════════════════════════════════════════════════════════════════════════════════
-- SIGEVIR — Tabla de dominios permitidos por rol
-- Permite al admin configurar qué dominios de email se mapean a qué roles
-- ════════════════════════════════════════════════════════════════════════════════
 
CREATE TABLE IF NOT EXISTS dominios_permitidos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dominio      TEXT        NOT NULL UNIQUE,
  rol          TEXT        NOT NULL 
               CHECK (rol IN ('agente_campo', 'deposito', 'fiscal_juez', 'admin')),
  descripcion  TEXT,
  activo       BOOLEAN     DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID        REFERENCES perfiles(id),
  
  -- Constraint: el dominio debe empezar con @
  CONSTRAINT dominio_valido CHECK (dominio LIKE '@%')
);
 
-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_dominios_rol    ON dominios_permitidos(rol) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_dominios_activo ON dominios_permitidos(activo);
CREATE INDEX IF NOT EXISTS idx_dominios_lookup ON dominios_permitidos(dominio) WHERE activo = true;
 
-- ══════════════════════════════════════════════════════════════════════════════
-- Datos de ejemplo: dominios iniciales
-- ══════════════════════════════════════════════════════════════════════════════
 
INSERT INTO dominios_permitidos (dominio, rol, descripcion) VALUES
  -- Policía / Agente de campo
  ('@policia.gob.ar',           'agente_campo', 'Policía de la Provincia de Córdoba'),
  ('@policiacordoba.gob.ar',    'agente_campo', 'Policía Judicial Córdoba Capital'),
  ('@transito.cordoba.gob.ar',  'agente_campo', 'Dirección de Tránsito Municipal'),
  
  -- Depósito / Corralón
  ('@corralon.cordoba.gob.ar',  'deposito',     'Corralón Municipal de Córdoba'),
  ('@depositomunicipal.gob.ar', 'deposito',     'Depósito de Vehículos'),
  
  -- Poder Judicial
  ('@justicia.gob.ar',          'fiscal_juez',  'Poder Judicial de Córdoba'),
  ('@pjcba.gov.ar',             'fiscal_juez',  'Poder Judicial - Dominio alternativo'),
  ('@fiscalia.gob.ar',          'fiscal_juez',  'Fiscalía General de la Provincia'),
  
  -- Administradores del sistema
  ('@sigevir.com.ar',            'admin',        'Administradores SIGEVIR')
ON CONFLICT (dominio) DO NOTHING;
 
-- ══════════════════════════════════════════════════════════════════════════════
-- Función auxiliar: obtener rol por email
-- ══════════════════════════════════════════════════════════════════════════════
 
CREATE OR REPLACE FUNCTION obtener_rol_por_email(email_usuario TEXT)
RETURNS TABLE(rol TEXT, dominio_encontrado TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
DECLARE
  dominio_extraido TEXT;
BEGIN
  -- Extraer el dominio del email (todo después del @)
  dominio_extraido := '@' || split_part(email_usuario, '@', 2);
  
  -- Buscar en la tabla de dominios permitidos
  RETURN QUERY
  SELECT 
    dp.rol,
    dp.dominio,
    dp.descripcion
  FROM dominios_permitidos dp
  WHERE dp.dominio = dominio_extraido 
    AND dp.activo = true
  LIMIT 1;
END;
$$;
 
-- ══════════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════════════════════════
 
ALTER TABLE dominios_permitidos ENABLE ROW LEVEL SECURITY;
 
-- Todos pueden leer dominios activos (para validar emails al registrarse)
DROP POLICY IF EXISTS "dominios_lectura_publica" ON dominios_permitidos;
CREATE POLICY "dominios_lectura_publica"
  ON dominios_permitidos FOR SELECT
  USING (activo = true);
 
-- Solo admin puede crear/modificar/eliminar dominios
DROP POLICY IF EXISTS "admin_gestiona_dominios" ON dominios_permitidos;
CREATE POLICY "admin_gestiona_dominios"
  ON dominios_permitidos FOR ALL
  USING (es_admin());
 
-- ══════════════════════════════════════════════════════════════════════════════
-- Trigger: registrar quién creó el dominio
-- ══════════════════════════════════════════════════════════════════════════════
 
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;
 
DROP TRIGGER IF EXISTS trigger_set_created_by ON dominios_permitidos;
CREATE TRIGGER trigger_set_created_by
  BEFORE INSERT ON dominios_permitidos
  FOR EACH ROW EXECUTE FUNCTION set_created_by();
 
-- ══════════════════════════════════════════════════════════════════════════════
-- Consultas de ejemplo para probar
-- ══════════════════════════════════════════════════════════════════════════════
 
-- Ver todos los dominios agrupados por rol
-- SELECT rol, COUNT(*) as cantidad, array_agg(dominio ORDER BY dominio) as dominios
-- FROM dominios_permitidos
-- WHERE activo = true
-- GROUP BY rol
-- ORDER BY rol;
 
-- Probar la función de validación
-- SELECT * FROM obtener_rol_por_email('juan@policia.gob.ar');
-- SELECT * FROM obtener_rol_por_email('maria@gmail.com');  -- No debería devolver nada
