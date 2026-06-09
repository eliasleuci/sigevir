import db from './src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

async function seedRoles() {
  try {
    await db.sequelize.authenticate();
    
    // Primero buscar o crear la institucion base si no existe
    let institucion = await db.Institucion.findOne({ where: { id: '3e23f6e0-eeeb-477a-99a5-ecb93e49a074' } });
    if (!institucion) {
      institucion = await db.Institucion.create({
        id: '3e23f6e0-eeeb-477a-99a5-ecb93e49a074',
        nombre: 'Dirección de Tránsito',
        tipo: 'MUNICIPAL',
        jurisdiccion: 'Sede Central',
        logo_url: 'https://via.placeholder.com/150',
        activo: true
      });
    }

    const testUsers = [
      { email: 'juez@sigevir.com.ar', rol: 'fiscal_juez', nombre: 'Juez de Faltas' },
      { email: 'agente@sigevir.com.ar', rol: 'agente_campo', nombre: 'Agente de Tránsito' },
      { email: 'deposito@sigevir.com.ar', rol: 'deposito', nombre: 'Encargado de Depósito' }
    ];

    console.log('Iniciando creación de usuarios de prueba...');

    for (const u of testUsers) {
      let user = await db.Usuario.findOne({ where: { email: u.email } });
      if (user) {
        console.log(`El usuario ${u.email} ya existe. Actualizando rol a ${u.rol}...`);
        await user.update({ rol: u.rol, activo: true, institucion_id: institucion.id });
      } else {
        console.log(`Creando usuario de prueba: ${u.email} (${u.rol})...`);
        await db.Usuario.create({
          id: uuidv4(),
          email: u.email,
          nombre_completo: u.nombre,
          rol: u.rol,
          activo: true,
          institucion_id: institucion.id,
          password_hash: 'NOPASSWORD_SUPABASE'
        });
      }
    }

    console.log(`\n¡Éxito! Los usuarios de prueba han sido creados en la base de datos.`);
    process.exit(0);
  } catch (error) {
    console.error('Error configurando usuarios de prueba:', error);
    process.exit(1);
  }
}

seedRoles();
