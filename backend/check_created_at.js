import db from './src/models/index.js';

async function checkCreatedAt() {
  try {
    await db.sequelize.authenticate();
    const [cols] = await db.sequelize.query(
      "SELECT column_name, column_default FROM information_schema.columns WHERE table_name='retenciones' AND column_name='created_at'"
    );
    console.log('created_at details:', cols);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkCreatedAt();
