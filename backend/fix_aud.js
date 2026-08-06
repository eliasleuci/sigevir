import db from './src/models/index.js';
async function fix() {
  try {
    await db.sequelize.query(`
      UPDATE auth.users SET aud = 'authenticated' WHERE email = 'eliaslafuente@gmail.com' AND aud IS NULL;
    `);
    console.log('✅ Fix aplicado en auth.users.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
fix();
