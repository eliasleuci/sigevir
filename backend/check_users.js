import db from './src/models/index.js';

async function checkUsers() {
  try {
    await db.sequelize.authenticate();
    const users = await db.Usuario.findAll({
      attributes: ['email', 'rol', 'institucion_id', 'activo']
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
