import db from '../models/index.js';
import logger from '../utils/logger.js';

class InstitucionService {
  async listarInstituciones(query = {}) {
    const { activa } = query;
    const where = {};
    if (activa !== undefined) {
      where.activa = activa === 'true';
    }

    const instituciones = await db.Institucion.findAll({
      where,
      order: [['nombre', 'ASC']]
    });

    return instituciones;
  }

  async obtenerInstitucion(id) {
    const institucion = await db.Institucion.findByPk(id);
    if (!institucion) throw new Error('Institución no encontrada');
    return institucion;
  }

  async crearInstitucion(data, usuarioAudit) {
    const { nombre, tipo, jurisdiccion, logo_url } = data;

    const institucion = await db.Institucion.create({
      nombre,
      tipo,
      jurisdiccion: jurisdiccion || null,
      logo_url: logo_url || null,
      activa: true
    });

    return institucion;
  }

  async editarInstitucion(id, data, usuarioAudit) {
    const institucion = await db.Institucion.findByPk(id);
    if (!institucion) throw new Error('Institución no encontrada');

    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.jurisdiccion !== undefined) updateData.jurisdiccion = data.jurisdiccion || null;
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url || null;
    if (data.activa !== undefined) updateData.activa = data.activa;

    await institucion.update(updateData);

    return institucion;
  }

  async eliminarInstitucion(id, usuarioAudit) {
    const institucion = await db.Institucion.findByPk(id);
    if (!institucion) throw new Error('Institución no encontrada');

    // Soft delete o desactivación (preferimos desactivación para que no rompa foreign keys)
    await institucion.update({ activa: false });

    return { message: 'Institución desactivada correctamente' };
  }
}

export default new InstitucionService();
