import db from './src/models/index.js';

async function addPdfUrl() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    console.log('Adding pdf_url column to retenciones...');
    await db.sequelize.query('ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(255);');
    console.log('Column added.');
  } catch (error) {
    console.error('Error during ALTER TABLE:', error);
  } finally {
    process.exit(0);
  }
}

addPdfUrl();
