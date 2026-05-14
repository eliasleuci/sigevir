export const VEHICLE_STATES = {
  RETENIDO: 'Retenido',
  EN_DEPOSITO: 'En Depósito',
  RESOLUCION_PENDIENTE: 'Resolución Pendiente',
  LIBERADO: 'Liberado',
  SUBASTADO: 'Subastado',
  COMPACTADO: 'Compactado',
};

export const VEHICLE_STATE_COLORS = {
  RETENIDO: 'warning',
  EN_DEPOSITO: 'info',
  RESOLUCION_PENDIENTE: 'accent',
  LIBERADO: 'success',
  SUBASTADO: 'danger',
  COMPACTADO: 'danger',
};

export const RESOLUTION_TYPES = {
  LIBERACION: 'Liberación',
  SUBASTA: 'Subasta',
  COMPACTACION: 'Compactación',
};

export const USER_ROLES = {
  ADMIN_GENERAL: 'Admin General',
  ADMIN_INSTITUCION: 'Admin Institución',
  FISCAL_JUEZ: 'Fiscal / Juez',
  AGENTE_CAMPO: 'Agente de Campo',
  DEPOSITO: 'Depósito',
  CONTROLADOR: 'Controlador',
};

export const USER_ROLE_COLORS = {
  ADMIN_GENERAL: 'red',
  ADMIN_INSTITUCION: 'purple',
  FISCAL_JUEZ: 'blue',
  AGENTE_CAMPO: 'green',
  DEPOSITO: 'orange',
  CONTROLADOR: 'teal',
};

export const NOTIFICATION_TYPES = {
  NUEVA_RETENCION: 'Nueva Retención',
  CAMBIO_ESTADO: 'Cambio de Estado',
  INGRESO_DEPOSITO: 'Ingreso a Depósito',
  RESOLUCION_JUDICIAL: 'Resolución Judicial',
  ALERTA_TIEMPO: 'Alerta de Tiempo',
  DOC_DISPONIBLE: 'Documento Disponible',
};

export const ALERT_LEVELS = {
  AMARILLO: { label: 'Amarillo', days: 30, color: 'warning' },
  NARANJA: { label: 'Naranja', days: 60, color: 'orange' },
  ROJO: { label: 'Rojo', days: 90, color: 'danger' },
};

export const LIMITS = {
  MAX_FOTOS: 10,
  MAX_TAMANO_FOTO_MB: 5,
  MAX_ARCHIVO_MB: 10,
  MAX_DOMINIO_LENGTH: 9,
  MIN_DOMINIO_LENGTH: 6,
  PAGINACION_POR_DEFECTO: 10,
  DIAS_ALERTA_AMARILLO: 30,
  DIAS_ALERTA_NARANJA: 60,
  DIAS_ALERTA_ROJO: 90,
};

export const DEPOSITO_SECTORS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
];

export const VEHICLE_TYPES = [
  { value: 'AUTO', label: 'Automóvil' },
  { value: 'MOTO', label: 'Motocicleta' },
  { value: 'CAMION', label: 'Camión' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'UTILITARIO', label: 'Utilitario' },
  { value: 'OTRO', label: 'Otro' },
];

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  GOOGLE_SIGNIN: '/auth/google/signin',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  RECOVER_PASSWORD: '/auth/recover-password',
  RESET_PASSWORD: '/auth/reset-password',
  NOTIFICACIONES: '/notificaciones',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_CHECK_PERMANENCIAS: '/admin/check-permanencias',
};
