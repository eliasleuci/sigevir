-- ============================================================
-- SIGEVIR - Migracion: Agregar coordenadas geograficas a retenciones
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase o en PostgreSQL
-- ============================================================

ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 7);
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS longitud DECIMAL(10, 7);

COMMENT ON COLUMN retenciones.latitud IS 'Latitud del lugar de retencion (Google Maps)';
COMMENT ON COLUMN retenciones.longitud IS 'Longitud del lugar de retencion (Google Maps)';
