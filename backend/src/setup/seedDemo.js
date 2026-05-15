import db from '../models/index.js';
import logger from '../utils/logger.js';

const { Institucion, Usuario } = db;

const USERS = [
  {
    email: 'admin@sigevir.demo',
    password: 'admin123',
    nombre_completo: 'Admin Demo',
    rol: 'ADMIN_GENERAL',
    institucion: { nombre: 'Municipalidad de Prueba', tipo: 'MUNICIPAL' },
  },
  {
    email: 'campo@sigevir.demo',
    password: 'campo123',
    nombre_completo: 'Oficial Perez',
    rol: 'AGENTE_CAMPO',
    institucion: { nombre: 'Policia de Cordoba', tipo: 'POLICIAL' },
  },
  {
    email: 'deposito@sigevir.demo',
    password: 'deposito123',
    nombre_completo: 'Juan Deposito',
    rol: 'DEPOSITO',
    institucion: { nombre: 'Deposito Municipal', tipo: 'MUNICIPAL' },
  },
  {
    email: 'fiscal@sigevir.demo',
    password: 'fiscal123',
    nombre_completo: 'Dra. Rodriguez',
    rol: 'FISCAL_JUEZ',
    institucion: { nombre: 'Fiscalia de Cordoba', tipo: 'JUDICIAL' },
  },
];

export const seedDemoData = async () => {
  try {
    for (const userData of USERS) {
      const [institucion] = await Institucion.findOrCreate({
        where: { nombre: userData.institucion.nombre },
        defaults: {
          tipo: userData.institucion.tipo,
        },
      });

      const [usuario, created] = await Usuario.findOrCreate({
        where: { email: userData.email },
        defaults: {
          nombre_completo: userData.nombre_completo,
          password_hash: userData.password,
          rol: userData.rol,
          institucion_id: institucion.id,
          activo: true,
        },
      });

      if (created) {
        logger.info('  Usuario creado: ' + userData.email + ' / ' + userData.password + ' (' + userData.rol + ')');
      }
    }
    logger.info('Datos de DEMO creados exitosamente.');
  } catch (error) {
    logger.error('Error al sembrar datos de DEMO:', error);
  }
};