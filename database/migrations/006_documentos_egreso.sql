-- 006_documentos_egreso.sql
-- Agrega columnas para gestión de egreso de vehículos
ALTER TABLE depositos ADD COLUMN IF NOT EXISTS documentos_egreso JSONB DEFAULT '{}'::jsonb;
ALTER TABLE depositos ADD COLUMN IF NOT EXISTS quien_retira VARCHAR(255);
ALTER TABLE depositos ADD COLUMN IF NOT EXISTS dni_quien_retira VARCHAR(50);
