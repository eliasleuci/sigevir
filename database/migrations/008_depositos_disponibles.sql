-- ============================================================================
-- 008_depositos_disponibles.sql
-- Ampliacion del esquema para la seleccion de depositos disponibles.
-- ============================================================================

-- Nueva tabla de depositos fisicos
CREATE TABLE IF NOT EXISTS depositos_instituciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institucion_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  latitud DECIMAL(10,7) NOT NULL,
  longitud DECIMAL(10,7) NOT NULL,
  capacidad_maxima INT NOT NULL DEFAULT 50,
  telefono_contacto TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar referencia al deposito elegido en la retencion
ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS deposito_institucion_id UUID
  REFERENCES depositos_instituciones(id);

-- Seeder de ejemplo (ajustar coordenadas reales de Cordoba)
INSERT INTO depositos_instituciones (institucion_id, nombre, direccion, latitud, longitud, capacidad_maxima)
SELECT
  (SELECT id FROM instituciones LIMIT 1),
  'Deposito Central Cordoba',
  'Av. Circunvalacion 1234, Cordoba',
  -31.4201, -64.1888,
  100
WHERE EXISTS (SELECT 1 FROM instituciones LIMIT 1)
ON CONFLICT DO NOTHING;

-- Agregar VEHICULO_EN_CAMINO al enum de notificaciones
ALTER TYPE "enum_notificaciones_tipo" ADD VALUE IF NOT EXISTS 'VEHICULO_EN_CAMINO';
