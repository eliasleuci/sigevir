import { Router } from 'express';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
// GET /api/tipos-personal  →  Pública (cualquier usuario autenticado)
// ──────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .select('*')
      .eq('activo', true)
      .order('id', { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map(t => ({
      ...t,
      rol_asignado: t.rol_asignado || t.rol
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    logger.error(`Error al obtener tipos_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/tipos-personal/all  →  Admin: ver todos incluidos inactivos
// ──────────────────────────────────────────────────────────────
router.get('/all', authenticate, authorize('admin', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map(t => ({
      ...t,
      rol_asignado: t.rol_asignado || t.rol
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    logger.error(`Error al obtener todos los tipos_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// PUT /api/tipos-personal/:id  →  Admin: editar tipo (nombre, rol, descripcion, dominio_email, activo)
// ──────────────────────────────────────────────────────────────
router.put('/:id', authenticate, authorize('admin', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, rol_asignado, rol, descripcion, dominio_email, activo } = req.body;

    const updatePayload = {};
    if (nombre !== undefined) updatePayload.nombre = nombre;
    if (rol_asignado || rol) updatePayload.rol = rol || rol_asignado;
    if (descripcion !== undefined) updatePayload.descripcion = descripcion;
    if (dominio_email !== undefined) updatePayload.dominio_email = dominio_email ? dominio_email.trim().toLowerCase() : null;
    if (activo !== undefined) updatePayload.activo = Boolean(activo);

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
    }

    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info(`Admin ${req.user.email} actualizó tipo_personal id=${id}`);
    res.status(200).json({ success: true, data: { ...data, rol_asignado: data.rol } });
  } catch (error) {
    logger.error(`Error al actualizar tipo_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/tipos-personal  →  Admin: crear nuevo tipo
// ──────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { nombre, rol_asignado, rol, descripcion, dominio_email } = req.body;
    const targetRol = rol || rol_asignado;

    if (!nombre || !targetRol) {
      return res.status(400).json({ success: false, message: 'nombre y rol_asignado son requeridos' });
    }

    const rolesValidos = ['agente_campo', 'deposito', 'fiscal_juez', 'admin'];
    if (!rolesValidos.includes(targetRol)) {
      return res.status(400).json({ success: false, message: 'rol_asignado inválido' });
    }

    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .insert({
        nombre,
        rol: targetRol,
        descripcion,
        dominio_email: dominio_email ? dominio_email.trim().toLowerCase() : null,
        activo: true
      })
      .select()
      .single();

    if (error) throw error;

    logger.info(`Admin ${req.user.email} creó tipo_personal: ${nombre} → ${targetRol}`);
    res.status(201).json({ success: true, data: { ...data, rol_asignado: data.rol } });
  } catch (error) {
    logger.error(`Error al crear tipo_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/tipos-personal/:id  →  Admin: eliminar tipo
// ──────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('admin', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    logger.info(`Admin ${req.user.email} eliminó tipo_personal id=${id}`);
    res.status(200).json({ success: true, message: 'Tipo de personal eliminado correctamente', data });
  } catch (error) {
    logger.error(`Error al eliminar tipo_personal: ${error?.message}`);
    next(error);
  }
});

export default router;

