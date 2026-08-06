import db from './src/models/index.js';

async function test() {
  try {
    await db.sequelize.query(`
      INSERT INTO auth.users (id, instance_id, email, raw_user_meta_data)
      VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'eliaslafuente@gmail.com', '{"full_name":"Elias L"}'::jsonb)
      RETURNING id, email;
    `);
    console.log('✅ Inserción de prueba en auth.users exitosa.');
  } catch (err) {
    console.error('❌ Error insertando en auth.users:', err.message);
  }
  process.exit(0);
}
test();
