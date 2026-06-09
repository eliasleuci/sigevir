import db from './src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

async function seedAdmin() {
  try {
    await db.sequelize.authenticate();
    
    // Primero buscar o crear la institucion base si no existe
    let institucion = await db.Institucion.findOne({ where: { id: '3e23f6e0-eeeb-477a-99a5-ecb93e49a074' } });
    if (!institucion) {
      institucion = await db.Institucion.create({
        id: '3e23f6e0-eeeb-477a-99a5-ecb93e49a074', // ID fijo por consistencia
        nombre: 'Dirección de Tránsito',
        tipo: 'MUNICIPAL',
        jurisdiccion: 'Sede Central',
        logo_url: 'https://via.placeholder.com/150',
        activo: true
      });
    }

    const adminEmail = 'contacto@sigevir.com.ar'.toLowerCase();
    
    // Buscar si ya existe el usuario
    let admin = await db.Usuario.findOne({ where: { email: adminEmail } });
    
    if (admin) {
      console.log(`El usuario ${adminEmail} ya existe. Actualizando permisos a admin total...`);
      await admin.update({
        rol: 'admin',
        activo: true,
        institucion_id: institucion.id
      });
    } else {
      console.log(`Creando administrador total: ${adminEmail}...`);
      admin = await db.Usuario.create({
        id: uuidv4(), // Usar un UUID genérico, si se loguea con Google se actualizará
        email: adminEmail,
        nombre_completo: 'Administrador Total SIGEVIR',
        rol: 'admin',
        activo: true,
        institucion_id: institucion.id,
        password_hash: 'NOPASSWORD_SUPABASE'
      });
    }

    console.log(`\n¡Éxito! La cuenta ${adminEmail} ha sido configurada en la base de datos como administrador total.`);
    process.exit(0);
  } catch (error) {
    console.error('Error configurando admin:', error);
    process.exit(1);
  }
}

seedAdmin();
