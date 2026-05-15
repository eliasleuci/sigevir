import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export const AuthContext = createContext();

const DEMO_USERS = [
  {
    id: 'demo-admin',
    email: 'admin@sigevir.demo',
    password: 'admin123',
    nombre_completo: 'Admin Demo',
    rol: 'ADMIN_GENERAL',
    role: 'ADMIN_GENERAL',
    nombre: 'Admin Demo',
    name: 'Admin Demo',
    institucion: 'Policía de Córdoba',
    institucion_id: 'demo-inst-001',
    Institucion: { nombre: 'Policía de Córdoba' },
    dni: '10.000.001',
    cargo: 'Administrador del Sistema',
    jurisdiccion: 'Córdoba',
    telefono: '+54 351 000 0001',
  },
  {
    id: 'demo-campo',
    email: 'campo@sigevir.demo',
    password: 'campo123',
    nombre_completo: 'Oficial Pérez',
    rol: 'AGENTE_CAMPO',
    role: 'AGENTE_CAMPO',
    nombre: 'Oficial Pérez',
    name: 'Oficial Pérez',
    institucion: 'Policía de Córdoba',
    institucion_id: 'demo-inst-001',
    Institucion: { nombre: 'Policía de Córdoba' },
    dni: '20.000.002',
    cargo: 'Oficial de Policía',
    jurisdiccion: 'Córdoba',
    telefono: '+54 351 000 0002',
  },
  {
    id: 'demo-deposito',
    email: 'deposito@sigevir.demo',
    password: 'deposito123',
    nombre_completo: 'Juan Depósito',
    rol: 'DEPOSITO',
    role: 'DEPOSITO',
    nombre: 'Juan Depósito',
    name: 'Juan Depósito',
    institucion: 'Depósito Municipal',
    institucion_id: 'demo-inst-002',
    Institucion: { nombre: 'Depósito Municipal' },
    dni: '30.000.003',
    cargo: 'Responsable de Depósito',
    jurisdiccion: 'Córdoba',
    telefono: '+54 351 000 0003',
  },
  {
    id: 'demo-fiscal',
    email: 'fiscal@sigevir.demo',
    password: 'fiscal123',
    nombre_completo: 'Dra. Rodríguez',
    rol: 'FISCAL_JUEZ',
    role: 'FISCAL_JUEZ',
    nombre: 'Dra. Rodríguez',
    name: 'Dra. Rodríguez',
    institucion: 'Fiscalía de Córdoba',
    institucion_id: 'demo-inst-003',
    Institucion: { nombre: 'Fiscalía de Córdoba' },
    dni: '40.000.004',
    cargo: 'Fiscal',
    jurisdiccion: 'Córdoba',
    telefono: '+54 351 000 0004',
  },
];

const activateDemoSession = (setUserFn, setPerfilFn, setTokenFn, setSessionFn, setIsDemoFn, userData) => {
  setIsDemoFn(true);
  setUserFn(userData);
  setPerfilFn({ id: userData.id, rol: userData.rol, nombre_completo: userData.nombre_completo });
  setTokenFn('demo-token');
  setSessionFn({ user: { id: userData.id, email: userData.email } });
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const cargarPerfil = useCallback(async (userId) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*, tipo_personal:tipos_personal_id(*)')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setPerfil(data);
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession);
        setToken(currentSession.access_token);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          ...currentSession.user.user_metadata,
        });
        const perfilData = await cargarPerfil(currentSession.user.id);
        if (perfilData) {
          setUser(prev => ({
            ...prev,
            rol: perfilData.rol,
            nombre: perfilData.nombre_completo,
            nombre_completo: perfilData.nombre_completo,
            institucion: perfilData.institucion,
            institucion_id: perfilData.institucion_id,
            dni: perfilData.dni,
          }));
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setToken(currentSession.access_token);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          ...currentSession.user.user_metadata,
        });
        const perfilData = await cargarPerfil(currentSession.user.id);
        if (perfilData) {
          setUser(prev => ({
            ...prev,
            rol: perfilData.rol,
            nombre: perfilData.nombre_completo,
            nombre_completo: perfilData.nombre_completo,
            institucion: perfilData.institucion,
            institucion_id: perfilData.institucion_id,
            dni: perfilData.dni,
          }));
        }
      } else {
        setSession(null);
        setToken(null);
        setUser(null);
        setPerfil(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [cargarPerfil]);

  const loginDemo = (role) => {
    const userData = DEMO_USERS.find(u => u.rol === role) || DEMO_USERS[0];
    activateDemoSession(setUser, setPerfil, setToken, setSession, setIsDemo, userData);
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured()) {
      const userData = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (userData) {
        activateDemoSession(setUser, setPerfil, setToken, setSession, setIsDemo, userData);
        return { success: true, data: { user: userData } };
      }
            const creds = DEMO_USERS.map(u => `${u.email} / ${u.password}`).join(', ');
      return { success: false, error: "Credenciales inválidas. Usa: " + creds };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginGoogle = async () => {
    if (!supabase) return { success: false, error: 'Supabase no configurado' };
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (formData) => {
    if (!supabase) return { success: false, error: 'Supabase no configurado' };
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre_completo,
            dni: formData.dni,
            telefono: formData.telefono,
            institucion: formData.institucion,
            jurisdiccion: formData.jurisdiccion,
            cargo: formData.cargo,
            tipo_personal_id: formData.tipo_personal_id,
          },
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!isDemo && supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setIsDemo(false);
    setSession(null);
    setToken(null);
    setUser(null);
    setPerfil(null);
  };

  const refreshSession = async () => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        session,
        token,
        isAuthenticated: isDemo || (!!session?.user && !!perfil),
        loading,
        login,
        loginGoogle,
        loginDemo,
        register,
        logout,
        refreshSession,
        cargarPerfil,
        role: perfil?.rol || user?.rol,
        isSupabaseConfigured: isSupabaseConfigured(),
        isDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
