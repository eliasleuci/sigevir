import db from './src/models/index.js';

async function seedDemo() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado a la BD. Creando Retención de Demo Completa...');

    // 1. Usar IDs conocidos y válidos de Supabase Auth
    const institucion_id = '3e23f6e0-eeeb-477a-99a5-ecb93e49a074';
    const agente_id = '40e03d39-aa66-4c47-b421-4ae2639a7b5b';

    const demoDomain = `DEMO${Math.floor(Math.random() * 1000)}`;

    // 2. Crear Retención
    const retencion = await db.Retencion.create({
      nro_expediente: `DEMO-2026-${Math.floor(Math.random() * 10000)}`,
      dominio: demoDomain,
      tipo_vehiculo: 'MOTO',
      marca: 'HONDA',
      modelo: 'WAVE 110S',
      color: 'NEGRO',
      nro_motor: 'MOT123456789',
      nro_cuadro: 'CUA987654321',
      motivo_retencion: 'Falta de casco y seguro vencido',
      observaciones: 'Vehículo en buen estado general. Espejo derecho roto.',
      calle_direccion: 'Av. Colón 1500',
      localidad: 'Córdoba Capital',
      provincia: 'Córdoba',
      estado_actual: 'EN_DEPOSITO',
      institucion_id: institucion_id,
      agente_id: agente_id,
      pdf_url: 'https://fwuaoesbkawrzyokkzyt.supabase.co/storage/v1/object/public/actas/demo_pdf.pdf',
      qr_url: 'https://fwuaoesbkawrzyokkzyt.supabase.co/storage/v1/object/public/actas/demo_qr.png'
    });
    console.log('✅ Retención creada:', retencion.nro_expediente);

    // 3. Crear Status Logs (Simulando la línea de tiempo)
    await db.VehicleStatusLog.create({
      retencion_id: retencion.id,
      estado: 'RETENIDO',
      usuario_id: agente_id,
      observaciones: 'Retención inicial en vía pública',
      timestamp: new Date(Date.now() - 86400000 * 2) // Hace 2 días
    });
    await db.VehicleStatusLog.create({
      retencion_id: retencion.id,
      estado: 'EN_DEPOSITO',
      usuario_id: agente_id,
      observaciones: 'Vehículo ingresado al depósito municipal',
      timestamp: new Date(Date.now() - 86400000 * 1) // Hace 1 día
    });
    console.log('✅ Status Logs (Timeline) creados');

    // 4. Crear Fotos de la Retención
    await db.FotoRetencion.create({
      retencion_id: retencion.id,
      url_s3: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tipo_foto: 'FRONTAL',
      descripcion: 'Vista frontal al momento de la retención'
    });
    await db.FotoRetencion.create({
      retencion_id: retencion.id,
      url_s3: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      tipo_foto: 'LATERAL',
      descripcion: 'Vista lateral izquierda mostrando daños menores'
    });
    console.log('✅ Fotos creadas');

    // 5. Crear Ingreso a Depósito
    await db.Deposito.create({
      retencion_id: retencion.id,
      institucion_id: institucion_id,
      responsable_id: agente_id,
      sector: 'Sector A',
      fila: 'Fila 3',
      espacio: 'Espacio 12',
      observaciones_ingreso: 'Ingresa sin llave, traba manubrio activada.',
      fecha_ingreso: new Date(Date.now() - 86400000 * 1)
    });
    console.log('✅ Ingreso a depósito registrado');

    // 6. Crear Resolución Judicial
    await db.ResolucionJudicial.create({
      retencion_id: retencion.id,
      usuario_judicial_id: agente_id,
      tipo: 'LIBERACION',
      juzgado_interviniente: 'Juzgado de Faltas N° 2',
      nro_resolucion: 'RES-JF2-2026-405',
      estado_resolucion: 'PENDIENTE_PAGO',
      monto_multa: 45000.00,
      observaciones: 'Se solicita al titular presentar seguro al día y abonar multa para liberación.',
      fecha_resolucion: new Date(),
      fecha_emision: new Date()
    });
    console.log('✅ Resolución Judicial creada');

    // 7. Crear Historial de Movimientos
    await db.HistorialMovimiento.create({
      retencion_id: retencion.id,
      tipo_movimiento: 'INGRESO',
      ubicacion_origen: 'Vía Pública (Av. Colón 1500)',
      ubicacion_destino: 'Depósito Municipal (Sector A)',
      responsable_traslado: 'Grúa Municipal 04',
      usuario_id: agente_id,
      observaciones: 'Traslado sin inconvenientes',
      fecha_movimiento: new Date(Date.now() - 86400000 * 1)
    });
    console.log('✅ Historial de movimientos registrado');

    console.log('\\n🎉 ¡Retención de Demo completamente generada con éxito!');
    console.log('👉 Podés buscarla en el sistema con el dominio: DEMO123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando la demo:', error);
    process.exit(1);
  }
}

seedDemo();
