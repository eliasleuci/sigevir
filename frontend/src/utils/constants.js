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

export const ROLES = {
  agente_campo: 'Agente de Campo',
  deposito: 'Depósito',
  fiscal_juez: 'Fiscal / Juez',
  admin: 'Administrador',
};

export const ROLE_COLORS = {
  agente_campo: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  deposito: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  fiscal_juez: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  admin: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

export const ROLE_DESCRIPTIONS = {
  agente_campo: 'Registra vehículos retenidos en vía pública, carga documentación y genera actas.',
  deposito: 'Gestiona el ingreso, inventario y egreso de vehículos en el depósito.',
  fiscal_juez: 'Control judicial, emisión de resoluciones y trazabilidad legal completa.',
  admin: 'Administración total del sistema: usuarios, instituciones y configuración global.',
};

export const ROLE_PERMISSIONS = {
  agente_campo: [
    'Registrar retenciones',
    'Cargar datos del vehículo y conductor',
    'Cargar fotografías',
    'Generar PDF y QR',
    'Consultar retenciones propias',
    'Editar registros abiertos',
  ],
  deposito: [
    'Confirmar ingreso al depósito',
    'Registrar inventario y daños',
    'Registrar egreso',
    'Actualizar estado del vehículo',
    'Consultar vehículos de su institución',
  ],
  fiscal_juez: [
    'Ver historial completo',
    'Ver fotografías y documentos',
    'Emitir resoluciones judiciales',
    'Aprobar liberaciones',
    'Consultar trazabilidad completa',
    'Acceso multi-institucional',
  ],
  admin: [
    'Crear y gestionar usuarios',
    'Configurar instituciones',
    'Ver auditorías completas',
    'Configuración global del sistema',
    'Acceso total a todos los módulos',
  ],
};

export const TIPO_PERSONAL_MAP = {
  'Policía': 'agente_campo',
  'Inspector de tránsito': 'agente_campo',
  'Responsable de depósito': 'deposito',
  'Juez': 'fiscal_juez',
  'Fiscal': 'fiscal_juez',
  'Secretario judicial': 'fiscal_juez',
  'Administrador': 'admin',
};

export const TIPOS_PERSONAL_PUBLICOS = [
  { id: 1, nombre: 'Policía', rol: 'agente_campo' },
  { id: 2, nombre: 'Inspector de tránsito', rol: 'agente_campo' },
  { id: 3, nombre: 'Responsable de depósito', rol: 'deposito' },
  { id: 4, nombre: 'Juez', rol: 'fiscal_juez' },
  { id: 5, nombre: 'Fiscal', rol: 'fiscal_juez' },
  { id: 6, nombre: 'Secretario judicial', rol: 'fiscal_juez' },
];

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
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  RECOVER_PASSWORD: '/auth/recover-password',
  RESET_PASSWORD: '/auth/reset-password',
  NOTIFICACIONES: '/notificaciones',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_CHECK_PERMANENCIAS: '/admin/check-permanencias',
  TIPOS_PERSONAL: '/tipos-personal',
  TIPOS_PERSONAL_ALL: '/tipos-personal/all',
};
