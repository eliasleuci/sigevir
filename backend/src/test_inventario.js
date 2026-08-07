import db from './models/index.js';

async function testInventario() {
  console.log('Iniciando test de creación de inventario...');
  try {
    const inventarioMotoPrueba = {
      conjunto_general: {
        'Rueda delantera': { presente: true },
        'Manubrio': { presente: true },
        'Cachas': { presente: false } // Le faltan las cachas
      },
      cubiertas: {
        'Delantera': { presente: true, rodado: '17', estado: 'B' }
      }
    };

    console.log('⏳ Creando un vehículo de prueba con el siguiente Inventario:');
    console.log(JSON.stringify(inventarioMotoPrueba, null, 2));

    // Crear la retención directamente con el inventario
    const nuevaRetencion = await db.Retencion.create({
      numero_expediente: 'TEST-INV-001',
      dominio: 'MOT012',
      tipo_vehiculo: 'MOTO',
      marca: 'HONDA',
      modelo: 'TITAN',
      institucion_id: '3e23f6e0-eeeb-477a-99a5-ecb93e49a074', // Fallback uuid
      agente_id: '40e03d39-aa66-4c47-b421-4ae2639a7b5b', // Fallback uuid
      provincia: 'Cordoba',
      localidad: 'Cordoba',
      calle_direccion: 'Calle Falsa 123',
      motivo_retencion: 'Test Inventario Automático',
      estado_actual: 'RETENIDO',
      inventario: inventarioMotoPrueba
    });

    console.log(`✅ ¡Creado con éxito! ID de Retención: ${nuevaRetencion.id}`);

    // Volver a consultarlo desde cero para verificar que Supabase lo guardó correctamente
    const retencionRecuperada = await db.Retencion.findByPk(nuevaRetencion.id);
    
    console.log('\n======================================================');
    console.log('🎉 ¡TEST EXITOSO! Datos recuperados de Supabase:');
    console.log(JSON.stringify(retencionRecuperada.inventario, null, 2));
    console.log('======================================================');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    process.exit(0);
  }
}

testInventario();
