-- ============================================================================
-- 014_add_tipo_iluminacion.sql
-- Agrega columna tipo_iluminacion a la tabla retenciones
-- ============================================================================

ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS tipo_iluminacion TEXT;

COMMENT ON COLUMN retenciones.tipo_iluminacion IS 'Tipo de iluminacion en el lugar del hecho (NATURAL/ARTIFICIAL)';
