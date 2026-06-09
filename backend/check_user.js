import db from './src/models/index.js';

async function checkUser() {
  try {
    await db.sequelize.authenticate();
    const userId = '40e03d39-aa66-4c47-b421-4ae2639a7b5b';
    const user = await db.Usuario.findByPk(userId);
    console.log('User found:', user ? user.toJSON() : 'No user found');
    
    // Also check if there's any user in the db
    const anyUser = await db.Usuario.findOne();
    console.log('Any user found:', anyUser ? anyUser.toJSON() : 'No users in DB');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkUser();
