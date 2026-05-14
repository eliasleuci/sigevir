export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDNI = (dni) => {
  if (!dni) return '';
  const clean = dni.toString().replace(/\./g, '');
  if (clean.length < 7) return clean;
  return clean.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
};

export const formatCuit = (cuit) => {
  if (!cuit) return '';
  const clean = cuit.toString().replace(/[-\s]/g, '');
  if (clean.length !== 11) return clean;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const clean = phone.toString().replace(/[\s\-()]/g, '');
  if (clean.length === 10) {
    return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 4)}) ${clean.slice(4, 7)}-${clean.slice(7)}`;
  }
  return clean;
};

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str || '';
  return str.substring(0, maxLength) + '...';
};
