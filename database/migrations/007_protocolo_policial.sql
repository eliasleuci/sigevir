-- ============================================================================
-- 007_protocolo_policial.sql
-- Ampliación del esquema para cubrir el protocolo policial de accidentes
-- de tránsito de la Policía de Córdoba.
-- ============================================================================

-- Nueva tabla de personas involucradas
CREATE TABLE IF NOT EXISTS personas_involucradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retencion_id UUID NOT NULL REFERENCES retenciones(id) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('CONDUCTOR','ACOMPANANTE','PEATON','TESTIGO','OTRO')),
  nombre_completo TEXT NOT NULL,
  edad INT,
  dni TEXT,
  domicilio TEXT,
  telefono TEXT,
  es_lesionado BOOLEAN DEFAULT false,
  tipo_lesion TEXT,
  nosocomio_traslado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personas_retencion ON personas_involucradas(retencion_id);

-- ── Datos del procedimiento policial ────────────────────────────────────────
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS numero_comision TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS numero_movil TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS colaboracion_especial JSONB DEFAULT '[]';
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS coopera_policia_judicial BOOLEAN;

-- ── Consigna (policía que queda en el lugar) ────────────────────────────────
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS queda_consigna BOOLEAN DEFAULT false;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS consigna_nombre TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS consigna_cargo TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS consigna_dependencia TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS consigna_telefono TEXT;

-- ── Traslado del vehículo ───────────────────────────────────────────────────
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS tipo_traslado TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS grua_dominio TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS grua_empresa TEXT;

-- ── Declaración en unidad judicial ──────────────────────────────────────────
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS hora_hecho TIMESTAMPTZ;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS numero_hecho TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS mecanica_hecho TEXT;

-- ── Entorno del lugar ───────────────────────────────────────────────────────
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS tiene_camaras_privadas BOOLEAN;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS tiene_carteles_nomenclatura BOOLEAN;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS tiene_reductores_velocidad BOOLEAN;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS estado_iluminacion TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS estado_calzada TEXT;

-- ── Documentos adicionales ──────────────────────────────────────────────────
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS croquis_url TEXT;
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS acta_inspeccion_url TEXT;
