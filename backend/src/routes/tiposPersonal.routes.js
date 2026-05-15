import { Router } from 'express';
import { authenticate, authorize } from '../middleware/supabaseAuth.js';
import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
// GET /api/tipos-personal  →  Pública (cualquier usuario autenticado)
// Retorna todos los tipos activos para el select del formulario de registro
// ──────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .select('id, nombre, rol_asignado, descripcion, activo')
      .eq('activo', true)
      .order('id', { ascending: true });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Error al obtener tipos_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/tipos-personal/all  →  Admin: ver todos incluidos inactivos
// ──────────────────────────────────────────────────────────────
router.get('/all', authenticate, authorize('ADMIN_GENERAL', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Error al obtener todos los tipos_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// PUT /api/tipos-personal/:id  →  Admin: editar tipo (descripcion, activo)
// El campo "rol_asignado" no se puede cambiar (lógica de negocio estricta)
// ──────────────────────────────────────────────────────────────
router.put('/:id', authenticate, authorize('ADMIN_GENERAL', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descripcion, activo } = req.body;

    // Solo se permiten editar descripcion y activo, no el rol_asignado
    const updatePayload = {};
    if (descripcion !== undefined) updatePayload.descripcion = descripcion;
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
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Error al actualizar tipo_personal: ${error?.message}`);
    next(error);
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/tipos-personal  →  Admin: crear nuevo tipo (uso futuro)
// ──────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('ADMIN_GENERAL', 'ADMIN_INSTITUCION'), async (req, res, next) => {
  try {
    const { nombre, rol_asignado, descripcion } = req.body;

    if (!nombre || !rol_asignado) {
      return res.status(400).json({ success: false, message: 'nombre y rol_asignado son requeridos' });
    }

    const rolesValidos = ['agente_campo', 'deposito', 'fiscal_juez', 'admin'];
    if (!rolesValidos.includes(rol_asignado)) {
      return res.status(400).json({ success: false, message: 'rol_asignado inválido' });
    }

    const { data, error } = await supabaseAdmin
      .from('tipos_personal')
      .insert({ nombre, rol_asignado, descripcion, activo: true })
      .select()
      .single();

    if (error) throw error;

    logger.info(`Admin ${req.user.email} creó tipo_personal: ${nombre} → ${rol_asignado}`);
    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error(`Error al crear tipo_personal: ${error?.message}`);
    next(error);
  }
});

export default router;
