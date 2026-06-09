import db from './src/models/index.js';

async function syncUser() {
  try {
    await db.sequelize.authenticate();
    const userId = '40e03d39-aa66-4c47-b421-4ae2639a7b5b';
    
    await db.Usuario.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        email: 'test_user_sync@sigevir.demo',
        nombre_completo: 'Test User Sync',
        rol: 'admin',
        institucion_id: '3e23f6e0-eeeb-477a-99a5-ecb93e49a074',
        activo: true,
        password_hash: 'mocked'
      }
    });
    
    console.log('User synced to DB successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

syncUser();
