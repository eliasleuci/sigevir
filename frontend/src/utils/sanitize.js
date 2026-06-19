/**
 * Sanitizar inputs del usuario en el frontend.
 * Complementa la sanitización del backend.
 */

// Eliminar caracteres peligrosos para HTML/JS
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// Sanitizar un objeto completo (para forms)
export const sanitizeForm = (data) => {
  const result = {};
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (typeof val === 'string') {
      result[key] = sanitizeText(val);
    } else if (typeof val === 'object' && val !== null) {
      result[key] = sanitizeForm(val);
    } else {
      result[key] = val;
    }
  });
  return result;
};

// Validar que un email tiene formato correcto
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

// Validar fortaleza de contraseña
export const validatePassword = (password) => {
  return {
    longitud:    password.length >= 12,
    mayuscula:   /[A-Z]/.test(password),
    minuscula:   /[a-z]/.test(password),
    numero:      /[0-9]/.test(password),
    simbolo:     /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    valida:      password.length >= 12 &&
                 /[A-Z]/.test(password) &&
                 /[0-9]/.test(password),
  };
};
