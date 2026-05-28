import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getSupabaseToken() {
  try {
    // Supabase guarda la sesión con esta clave por defecto
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
    if (projectRef) {
      const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.access_token || null;
      }
    }
    // Fallback: buscar en sigevir_session (mock mode)
    const raw = localStorage.getItem('sigevir_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

function isDemoMode() {
  try {
    const raw = localStorage.getItem('sigevir_session');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.mock === true;
  } catch {
    return false;
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getSupabaseToken();
    const demo = isDemoMode();
    if (demo) {
      config.headers['X-Demo-Mode'] = 'true';
      try {
        const raw = localStorage.getItem('sigevir-auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.email) config.headers['X-Demo-User-Email'] = parsed.email;
        }
      } catch {}
    }
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try { localStorage.removeItem('sigevir_session'); } catch {}
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
