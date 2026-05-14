const ERROR_MESSAGES = {
  400: 'Datos inválidos. Verificá la información ingresada.',
  401: 'Sesión expirada. Iniciá sesión nuevamente.',
  403: 'No tenés permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Conflicto: el recurso ya existe (ej: dominio duplicado).',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiadas solicitudes. Intentá de nuevo en unos segundos.',
  500: 'Error del servidor. Intentá de nuevo más tarde.',
  502: 'El servicio no está disponible temporalmente.',
  503: 'El servicio está en mantenimiento. Intentá más tarde.',
};

const DEFAULT_MESSAGE = 'Ocurrió un error inesperado.';

export const getErrorMessage = (error) => {
  if (!error) return DEFAULT_MESSAGE;

  const status = error.response?.status;
  const serverMessage = error.response?.data?.error?.message || error.response?.data?.message;

  if (serverMessage) return serverMessage;
  if (status && ERROR_MESSAGES[status]) return ERROR_MESSAGES[status];

  if (error.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el servidor. Verificá tu conexión a internet.';
  }

  if (error.code === 'ERR_CANCELED') {
    return 'La solicitud fue cancelada.';
  }

  return error.message || DEFAULT_MESSAGE;
};

export const getErrorCode = (error) => {
  return error?.response?.data?.error?.code || error?.response?.status || 'UNKNOWN';
};

export const isAuthError = (error) => {
  return error?.response?.status === 401;
};

export const isForbidden = (error) => {
  return error?.response?.status === 403;
};

export const isNotFound = (error) => {
  return error?.response?.status === 404;
};

export const isNetworkError = (error) => {
  return error?.code === 'ERR_NETWORK';
};
