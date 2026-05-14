import { AppError } from './errorHandler.js';

/**
 * Middleware para validación de roles (RBAC)
 * @param {String[]} allowedRoles - Lista de roles permitidos
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401, 'UNAUTHORIZED'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tiene permisos para realizar esta acción', 403, 'FORBIDDEN'));
    }

    next();
  };
};

/**
 * Middleware para multi-tenant (Filtrado por institución)
 * Inyecta automáticamente el filtro de institucion_id en las queries si el rol no es ADMIN_GENERAL
 */
export const tenantFilter = (req, res, next) => {
  if (!req.user) return next();

  // Si es Admin General, puede ver todo (no aplicar filtro)
  if (req.user.role === 'ADMIN_GENERAL') {
    req.tenantFilter = {};
    return next();
  }

  // Si tiene una institución asignada, forzar filtro
  if (req.user.institucion_id) {
    req.tenantFilter = { institucion_id: req.user.institucion_id };
  } else {
    // Si no es admin general y no tiene institución, restringir
    return next(new AppError('Usuario no asignado a ninguna institución', 403, 'FORBIDDEN_NO_TENANT'));
  }

  next();
};
