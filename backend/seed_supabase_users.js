import { supabaseAdmin, isSupabaseConfigured } from './src/config/supabase.js';
import db from './src/models/index.js';

async function seedSupabaseUsers() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase no está configurado correctamente. Revisa tu .env');
    process.exit(1);
  }

  try {
    await db.sequelize.authenticate();

    // 1. Institucion
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
      { email: 'admin@prueba.com', rol: 'admin', nombre: 'Admin Prueba' },
      { email: 'juez@prueba.com', rol: 'fiscal_juez', nombre: 'Juez Prueba' },
      { email: 'agente@prueba.com', rol: 'agente_campo', nombre: 'Agente Prueba' },
      { email: 'deposito@prueba.com', rol: 'deposito', nombre: 'Deposito Prueba' }
    ];

    for (const u of testUsers) {
      console.log(`\nProcesando: ${u.email}...`);

      // 2. Buscar en Supabase
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      let supUser = users?.find(x => x.email === u.email);

      if (supUser) {
        console.log(`Eliminando usuario existente en Supabase: ${supUser.id}`);
        await supabaseAdmin.auth.admin.deleteUser(supUser.id);
      }

      // 3. Crear en Supabase con email autoconfirmado
      console.log(`Creando en Supabase Auth con password "prueba123"...`);
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: 'prueba123',
        email_confirm: true,
        user_metadata: {
          nombre_completo: u.nombre,
          rol: u.rol,
          institucion_id: institucion.id
        }
      });

      if (error) {
        console.error(`Error creando ${u.email} en Supabase:`, error.message);
        continue;
      }

      const newId = data.user.id;

      // 4. Eliminar si existe en local DB (para recrear limpio con nuevo ID)
      await db.Usuario.destroy({ where: { email: u.email }, force: true });

      // 5. Insertar en local DB
      console.log(`Creando en Base de Datos local...`);
      await db.Usuario.create({
        id: newId,
        email: u.email,
        nombre_completo: u.nombre,
        rol: u.rol,
        activo: true,
        institucion_id: institucion.id,
        password_hash: 'NOPASSWORD_SUPABASE' // Supabase valida el password
      });

      console.log(`✅ ¡${u.email} creado exitosamente!`);
    }

    console.log('\n¡Todos los usuarios han sido creados!');
    process.exit(0);
  } catch (error) {
    console.error('Error catastrófico:', error);
    process.exit(1);
  }
}

seedSupabaseUsers();
