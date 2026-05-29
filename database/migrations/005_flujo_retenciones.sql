-- ════════════════════════════════════════════════════════════════════════════
-- SIGEVIR — Migración 005: Flujo de Retenciones
-- Ejecutar en Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Tabla principal: retenciones ──────────────────────────────────────────
-- Borramos la tabla vieja si existe, porque le faltan columnas (ej: nro_expediente)
DROP TABLE IF EXISTS public.retenciones CASCADE;
DROP TABLE IF EXISTS public.retencion_fotos CASCADE;
DROP TABLE IF EXISTS public.movimientos_deposito CASCADE;
DROP TABLE IF EXISTS public.resoluciones_judiciales CASCADE;

CREATE TABLE public.retenciones (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_expediente   TEXT        NOT NULL UNIQUE,
  
  -- Datos del vehículo
  dominio          TEXT        NOT NULL,
  tipo_vehiculo    TEXT        NOT NULL,
  marca            TEXT,
  modelo           TEXT,
  color            TEXT,
  nro_motor        TEXT,
  nro_cuadro       TEXT,
  
  -- Datos del titular/conductor
  titular_nombre   TEXT,
  titular_dni      TEXT,
  titular_domicilio TEXT,
  
  -- Datos del evento
  motivo_retencion TEXT        NOT NULL,
  lugar_retencion  TEXT        NOT NULL,
  latitud          DECIMAL(10, 7),
  longitud         DECIMAL(10, 7),
  observaciones    TEXT,
  
  -- Metadatos del sistema
  estado           TEXT        NOT NULL DEFAULT 'PENDIENTE_INGRESO'
                   CHECK (estado IN ('PENDIENTE_INGRESO', 'EN_DEPOSITO', 'LIBERADO', 'DEVUELTO', 'SUBASTA', 'COMPACTACION')),
  agente_id        UUID        REFERENCES auth.users(id),
  qr_url           TEXT,
  pdf_url          TEXT,
  fotos            jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint: must have exactly 4 fotos
ALTER TABLE public.retenciones ADD CONSTRAINT fotos_cuatro CHECK (jsonb_array_length(fotos) = 4);


CREATE INDEX IF NOT EXISTS idx_retenciones_nro ON public.retenciones(nro_expediente);
CREATE INDEX IF NOT EXISTS idx_retenciones_dominio ON public.retenciones(dominio);
CREATE INDEX IF NOT EXISTS idx_retenciones_estado ON public.retenciones(estado);

-- ── 2. Evidencia fotográfica ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.retencion_fotos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  retencion_id     UUID        NOT NULL REFERENCES public.retenciones(id) ON DELETE CASCADE,
  foto_url         TEXT        NOT NULL,
  tipo             TEXT,       -- 'FRENTE', 'TRASERA', 'LATERAL', 'DAÑOS', etc.
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Movimientos de Depósito (Trazabilidad) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.movimientos_deposito (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  retencion_id     UUID        NOT NULL REFERENCES public.retenciones(id) ON DELETE CASCADE,
  tipo_movimiento  TEXT        NOT NULL CHECK (tipo_movimiento IN ('INGRESO', 'EGRESO')),
  usuario_id       UUID        REFERENCES auth.users(id),
  observaciones    TEXT,
  fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Resoluciones Judiciales / Administrativas ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.resoluciones_judiciales (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  retencion_id     UUID        NOT NULL REFERENCES public.retenciones(id) ON DELETE CASCADE,
  tipo_resolucion  TEXT        NOT NULL CHECK (tipo_resolucion IN ('LIBERACION', 'INFRACCION', 'SUBASTA', 'COMPACTACION', 'OTRO')),
  descripcion      TEXT        NOT NULL,
  magistrado_id    UUID        REFERENCES auth.users(id),
  fecha_resolucion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archivo_url      TEXT        -- PDF de la orden judicial firmado
);

-- ── 5. Buckets de Storage (Crear si no existen) ─────────────────────────────
-- (Para subir fotos y actas en pdf)
INSERT INTO storage.buckets (id, name, public) VALUES ('evidencia', 'evidencia', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('retenciones-fotos', 'retenciones-fotos', true) ON CONFLICT DO NOTHING;

-- ── 6. ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────────

ALTER TABLE public.retenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retencion_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_deposito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resoluciones_judiciales ENABLE ROW LEVEL SECURITY;

-- Retenciones: 
-- Admin y Fiscales ven todas. Depósito ve todas. Agentes de campo ven las suyas o las de su jurisdicción (simplificado a ver todas para el MVP)
CREATE POLICY "lectura_retenciones_global" ON public.retenciones FOR SELECT USING (true);
CREATE POLICY "insercion_retenciones" ON public.retenciones FOR INSERT WITH CHECK (true);
CREATE POLICY "actualizacion_retenciones" ON public.retenciones FOR UPDATE USING (true);

-- Fotos
CREATE POLICY "lectura_fotos" ON public.retencion_fotos FOR SELECT USING (true);
CREATE POLICY "insercion_fotos" ON public.retencion_fotos FOR INSERT WITH CHECK (true);

-- Movimientos
CREATE POLICY "lectura_movimientos" ON public.movimientos_deposito FOR SELECT USING (true);
CREATE POLICY "insercion_movimientos" ON public.movimientos_deposito FOR INSERT WITH CHECK (true);

-- Resoluciones
CREATE POLICY "lectura_resoluciones" ON public.resoluciones_judiciales FOR SELECT USING (true);
CREATE POLICY "insercion_resoluciones" ON public.resoluciones_judiciales FOR INSERT WITH CHECK (true);

-- (Nota: Para un entorno de producción estricto, las políticas "USING (true)" deben reemplazarse por verificaciones de roles (es_admin(), es_fiscal(), etc.) según las necesidades exactas).
