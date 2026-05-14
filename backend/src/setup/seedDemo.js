import db from '../models/index.js';
import logger from '../utils/logger.js';

const { Institucion, Usuario } = db;

export const seedDemoData = async () => {
  try {
    // 1. Crear Institución de prueba
    const [institucion] = await Institucion.findOrCreate({
      where: { nombre: 'Municipalidad de Prueba' },
      defaults: {
        tipo: 'MUNICIPAL',
        direccion: 'Calle Falsa 123',
        contacto_email: 'contacto@municipio.gov.ar',
        configuracion: { theme: 'default' }
      }
    });

    // 2. Crear Usuario Admin de prueba
    const [usuario, created] = await Usuario.findOrCreate({
      where: { email: 'admin@sigevir.com' },
      defaults: {
        nombre_completo: 'Administrador Demo',
        password_hash: 'admin123', // El hook beforeSave lo hasheará
        rol: 'ADMIN_GENERAL',
        institucion_id: institucion.id,
        activo: true
      }
    });

    if (created) {
      logger.info('✅ Datos de DEMO creados exitosamente.');
      logger.info('   📧 Email: admin@sigevir.com');
      logger.info('   🔑 Pass:  admin123');
    } else {
      logger.info('ℹ️ Datos de DEMO ya existen.');
    }
  } catch (error) {
    logger.error('❌ Error al sembrar datos de DEMO:', error);
  }
};
