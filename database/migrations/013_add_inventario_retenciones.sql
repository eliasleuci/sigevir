-- ============================================================================
-- 013_add_inventario_retenciones.sql
-- Agrega columna inventario (JSONB) a retenciones
-- ============================================================================

ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS inventario JSONB DEFAULT '{}'::jsonb;

-- Comentario para documentacion
COMMENT ON COLUMN retenciones.inventario IS 'Inventario detallado de partes y estado del vehiculo (Auto/Moto) al ingresar al sistema o deposito';
