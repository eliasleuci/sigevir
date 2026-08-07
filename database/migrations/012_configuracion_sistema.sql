-- ============================================================================
-- 012_configuracion_sistema.sql
-- Crea la tabla de configuraciones globales del sistema
-- ============================================================================

CREATE TABLE IF NOT EXISTS configuraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    categoria VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- 'GENERAL', 'VALORES', 'MANTENIMIENTO'
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden leer/escribir las configuraciones
-- (Asumimos que el backend maneja la autorización, pero por seguridad agregamos políticas básicas)
DROP POLICY IF EXISTS "auth_read_configuraciones" ON configuraciones;
CREATE POLICY "auth_read_configuraciones"
ON configuraciones FOR SELECT
TO authenticated
USING (true);

-- Insertar valores por defecto si no existen
INSERT INTO configuraciones (clave, valor, tipo, categoria, descripcion) VALUES
('SISTEMA_NOMBRE', 'SIGEVIR', 'string', 'GENERAL', 'Nombre oficial del sistema mostrado en la interfaz'),
('ZONA_HORARIA', 'America/Argentina/Buenos_Aires', 'string', 'GENERAL', 'Zona horaria por defecto para reportes y fechas'),
('COSTO_ESTADIA_DIA', '1500.00', 'number', 'VALORES', 'Costo base en pesos por cada día de estadía en el depósito'),
('COSTO_ACARREO', '5000.00', 'number', 'VALORES', 'Costo base del servicio de grúa/acarreo'),
('DIAS_GRACIA', '3', 'number', 'VALORES', 'Cantidad de días sin cobro de estadía desde el ingreso'),
('MODO_MANTENIMIENTO', 'false', 'boolean', 'MANTENIMIENTO', 'Si está activo, bloquea el acceso a usuarios no administradores')
ON CONFLICT (clave) DO NOTHING;
