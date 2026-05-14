import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

let sequelize;

if (process.env.DB_HOST === 'sqlite' || !process.env.DB_HOST) {
  logger.info('⚠️ DB_HOST no configurado o configurado como sqlite. Usando SQLite en memoria.');
  sequelize = new Sequelize('sqlite::memory:', {
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      timezone: '+00:00',
      logging: process.env.NODE_ENV === 'production' ? false : (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      dialectOptions: {
        useUTC: true,
        dateStrings: true,
        typeCast: true
      }
    }
  );
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`✅ Conexión establecida correctamente (${sequelize.getDialect()}).`);
    
    if (isDevelopment) {
      await sequelize.sync({ alter: true });
      logger.info('✅ Modelos sincronizados con la base de datos.');
      
      // Si estamos en SQLite (Modo Demo), sembrar datos iniciales
      if (sequelize.getDialect() === 'sqlite') {
        const { seedDemoData } = await import('../setup/seedDemo.js');
        await seedDemoData();
      }
    }
  } catch (error) {
    if (sequelize.getDialect() === 'postgres') {
      logger.error('❌ Error al conectar a PostgreSQL. Intentando fallback a SQLite en memoria...', error.message);
      
      // Fallback a SQLite
      sequelize = new Sequelize('sqlite::memory:', {
        logging: (msg) => logger.debug(msg),
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      });
      
      try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        
        // Importar dinámicamente el seeder para evitar dependencias circulares si las hubiera
        const { seedDemoData } = await import('../setup/seedDemo.js');
        await seedDemoData();
        
        logger.info('✅ Fallback a SQLite en memoria establecido correctamente para modo DEMO.');
      } catch (sqliteError) {
        logger.error('❌ Error crítico: Fallback a SQLite también falló.', sqliteError);
        process.exit(1);
      }
    } else {
      logger.error('❌ Error al conectar a la base de datos:', error);
      process.exit(1);
    }
  }
};

export default sequelize;
