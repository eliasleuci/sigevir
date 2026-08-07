-- ════════════════════════════════════════════════════════════════════════════
-- Script para generar una Retención de prueba compatible con tu BD actual
-- Ejecutar en Supabase -> SQL Editor
-- ════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  new_retencion_id UUID := gen_random_uuid();
  v_agente_id UUID;
  v_institucion_id UUID;
BEGIN
  -- Obtenemos un agente y una institución para cumplir con las referencias
  SELECT id INTO v_agente_id FROM auth.users LIMIT 1;
  IF v_agente_id IS NULL THEN
      v_agente_id := '00000000-0000-0000-0000-000000000001'::uuid; 
  END IF;

  -- Obtenemos una institución válida
  SELECT id INTO v_institucion_id FROM public.instituciones LIMIT 1;
  IF v_institucion_id IS NULL THEN
      -- Solo si la tabla está completamente vacía, creamos una de emergencia para no fallar
      v_institucion_id := gen_random_uuid();
      INSERT INTO public.instituciones (id, nombre, tipo, jurisdiccion, created_at, updated_at) 
      VALUES (v_institucion_id, 'Institución de Prueba', 'POLICIA', 'Jurisdicción Test', NOW(), NOW());
  END IF;

  -- Insertamos la retención con las columnas exactas del modelo Sequelize (Retencion.js)
  INSERT INTO public.retenciones (
    id, nro_expediente, dominio, tipo_vehiculo, marca, modelo, color, nro_motor, nro_cuadro,
    titular_nombre, titular_dni, titular_domicilio,
    institucion_id, agente_id, fecha_hora, provincia, localidad, calle_direccion,
    motivo_retencion, latitud, longitud, estado_actual,
    created_at, updated_at
  ) VALUES (
    new_retencion_id, 
    'EXP-' || to_char(NOW(), 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::text, 
    'AB123CD', 'AUTOMOVIL', 'Toyota', 'Corolla', 'Blanco', 'MTR-987654321', 'CDR-123456789',
    'Juan Pérez Test', '20123456', 'Av. Siempre Viva 742',
    v_institucion_id, v_agente_id, NOW(), 'Buenos Aires', 'CABA', 'Av. San Martín 1500',
    'Falta de documentación (VTV y Seguro)', -34.603722, -58.381592, 'RETENIDO',
    NOW(), NOW()
  );

  -- Insertamos fotos en la tabla fotos_retenciones
  INSERT INTO public.fotos_retenciones (id, retencion_id, url_s3, descripcion, orden, created_at) VALUES
  (gen_random_uuid(), new_retencion_id, 'https://fakeimg.pl/800x600/cccccc/909090?text=Frente', 'Frente', 1, NOW()),
  (gen_random_uuid(), new_retencion_id, 'https://fakeimg.pl/800x600/cccccc/909090?text=Trasera', 'Trasera', 2, NOW()),
  (gen_random_uuid(), new_retencion_id, 'https://fakeimg.pl/800x600/cccccc/909090?text=Lateral_Der', 'Lateral Derecho', 3, NOW()),
  (gen_random_uuid(), new_retencion_id, 'https://fakeimg.pl/800x600/cccccc/909090?text=Lateral_Izq', 'Lateral Izquierdo', 4, NOW());

  -- Registramos la auditoría de esta creación
  INSERT INTO public.audit_logs (accion, entidad, entidad_id, origen, detalle, usuario_nombre, usuario_email, created_at)
  VALUES (
    'RETENCION_CREADA',
    'RETENCION',
    new_retencion_id,
    'SCRIPT_PRUEBA',
    '{"dominio": "AB123CD", "marca": "Toyota", "motivo": "Falta de documentación (VTV y Seguro)"}'::jsonb,
    'Admin Sistema',
    'admin@sistema.local',
    NOW()
  );

END $$;
