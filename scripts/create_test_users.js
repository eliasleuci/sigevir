import { supabaseAdmin } from '../backend/src/config/supabase.js';

// IDs de tipos de personal creados en la seed (asume que los IDs son 1-7)
const TIPOS = {
  agente_campo: 1, // Policía
  deposito: 3, // Responsable de depósito
  fiscal_juez: 4, // Juez (o Fiscal)
  admin: 7, // Administrador
};

const usuarios = [
  {
    email: 'agente@example.com',
    password: 'Password123!',
    nombre_completo: 'Agente Campo',
    tipo_personal_id: TIPOS.agente_campo,
  },
  {
    email: 'deposito@example.com',
    password: 'Password123!',
    nombre_completo: 'Responsable Depósito',
    tipo_personal_id: TIPOS.deposito,
  },
  {
    email: 'fiscal@example.com',
    password: 'Password123!',
    nombre_completo: 'Fiscal/Juez',
    tipo_personal_id: TIPOS.fiscal_juez,
  },
  {
    email: 'admin@example.com',
    password: 'Password123!',
    nombre_completo: 'Administrador',
    tipo_personal_id: TIPOS.admin,
  },
];

async function crearUsuario({ email, password, nombre_completo, tipo_personal_id }) {
  try {
    // Creamos el usuario en Supabase Auth con metadata que incluye tipo_personal_id
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      // metadata se usa en trigger para crear perfil
      user_metadata: {
        nombre_completo,
        tipo_personal_id,
      },
    });
    if (error) throw error;
    console.log(`✅ Usuario creado: ${email}`);
  } catch (err) {
    console.error(`❌ Error creando ${email}:`, err.message);
  }
}

async function main() {
  for (const u of usuarios) {
    await crearUsuario(u);
  }
  console.log('✅ Todos los usuarios de prueba fueron procesados');
}

main();
