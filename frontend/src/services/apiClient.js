import axios from 'axios';
import { supabase, SUPABASE_READY } from '../config/supabase';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function getSupabaseToken() {
  try {
    if (SUPABASE_READY && supabase) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        return session.access_token;
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
  async (config) => {
    const token = await getSupabaseToken();
    const demo = isDemoMode();
    if (demo) {
      config.headers['X-Demo-Mode'] = 'true';
      try {
        const raw = localStorage.getItem('sigevir_session');
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
