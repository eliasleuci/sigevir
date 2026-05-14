export const daysBetween = (a, b = new Date()) => {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diff = dateB.getTime() - dateA.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const relativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 10) return 'ahora';
  if (diffSec < 60) return `hace ${diffSec} seg`;
  if (diffMin === 1) return 'hace 1 min';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour === 1) return 'hace 1 hora';
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay === 1) return 'ayer';
  if (diffDay < 7) return `hace ${diffDay} días`;
  if (diffWeek === 1) return 'hace 1 semana';
  if (diffWeek < 5) return `hace ${diffWeek} semanas`;
  if (diffMonth < 12) return `hace ${diffMonth} meses`;

  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
};

export const getMonthRange = (date = new Date()) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end };
};

export const getYearRange = (date = new Date()) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const end = new Date(d.getFullYear(), 11, 31);
  return { start, end };
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (date) => {
  if (!date) return true;
  return new Date(date) < new Date();
};
