export const isValidDominio = (dominio) => {
  if (!dominio) return false;
  const d = dominio.toUpperCase().replace(/\s/g, '');
  // Formato antiguo: ABC123 (3 letras + 3 números)
  // Formato nuevo: AB123CD (2 letras + 3 números + 2 letras)
  const regex = /^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/;
  return regex.test(d);
};

export const isValidDNI = (dni) => {
  if (!dni) return false;
  const clean = dni.replace(/\./g, '');
  return /^\d{7,8}$/.test(clean);
};

export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^\+?\d{7,15}$/.test(clean);
};

export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const isValidCuit = (cuit) => {
  if (!cuit) return false;
  const clean = cuit.replace(/[-\s]/g, '');
  if (!/^\d{11}$/.test(clean)) return false;
  const digits = clean.split('').map(Number);
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * multipliers[i];
  const check = (11 - (sum % 11)) % 11;
  return check === digits[10];
};
