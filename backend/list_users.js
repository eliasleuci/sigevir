import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fwuaoesbkawrzyokkzyt.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) { console.error('Error:', error); process.exit(1); }
  
  console.log(`\n📋 Usuarios en Supabase Auth (${data.users.length} total):\n`);
  data.users.forEach(u => {
    console.log(`  • ${u.email}`);
    console.log(`    ID: ${u.id}`);
    console.log(`    Confirmado: ${u.email_confirmed_at ? '✅' : '❌ No confirmado'}`);
    console.log(`    MFA: ${u.factors?.length > 0 ? '🔒 Tiene MFA' : '✅ Sin MFA'}`);
    console.log(`    Creado: ${new Date(u.created_at).toLocaleDateString('es-AR')}`);
    console.log('');
  });
  process.exit(0);
}

listUsers();
