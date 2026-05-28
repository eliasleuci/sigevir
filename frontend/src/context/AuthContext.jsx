import { createContext, useState, useEffect, useCallback } from 'react'
import { supabase, SUPABASE_READY, getUserByEmail } from '../config/supabase'
import { getPrimaryHostedDomain } from '../utils/emailDomains'

export const AuthContext = createContext()

// ── Clave para localStorage ────────────────────────────────────────────────────
const LS_KEY = 'sigevir_session'

// ── Helper para guardar/leer sesión ───────────────────────────────────────────
const saveSession = (userData) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(userData))
  } catch (e) {
    console.error('Error guardando sesión:', e)
  }
}

const loadSession = () => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    localStorage.removeItem(LS_KEY)
    return null
  }
}

const clearSession = () => {
  try {
    localStorage.removeItem(LS_KEY)
  } catch (e) {}
}

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Inicializar: recuperar sesión guardada ─────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      if (!SUPABASE_READY) {
        // Modo mock: recuperar del localStorage
        const saved = loadSession()
        if (saved) {
          setUser(saved)
          setPerfil(saved)
        }
        setLoading(false)
        return
      }

      // Modo Supabase: verificar sesión activa
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await cargarPerfil(session.user.id)
        }
      } catch (e) {
        console.error('Error iniciando auth:', e)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listener de cambios de sesión (solo con Supabase)
    if (SUPABASE_READY) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user)
            await cargarPerfil(session.user.id)
          } else {
            setUser(null)
            setPerfil(null)
          }
        }
      )
      return () => subscription.unsubscribe()
    }
  }, [])

  const cargarPerfil = useCallback(async (userId) => {
    if (!SUPABASE_READY) return
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout cargando perfil')), 5000)
      );
      const queryPromise = supabase
        .from('perfiles')
        .select('*, tipos_personal(*)')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if (error) throw error
      setPerfil(data)
    } catch (e) {
      console.error('Error cargando perfil:', e)
    }
  }, [])

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // ─── MODO MOCK (sin Supabase) ──────────────────────────────────────────
    if (!SUPABASE_READY) {
      const found = getUserByEmail(email.trim())

      if (!found) {
        return { success: false, error: 'Email no encontrado. Verificá el email ingresado.' }
      }

      if (found.password_mock !== password) {
        return { success: false, error: 'Contraseña incorrecta.' }
      }

      if (!found.activo) {
        return { success: false, error: 'Usuario inactivo. Contactá al administrador.' }
      }

      // Login exitoso en modo mock
      const sessionData = {
        id:              found.id,
        email:           found.email,
        nombre_completo: found.nombre_completo,
        rol:             found.rol,       // SIEMPRE minúscula
        tipo_personal:   found.tipo_personal,
        institucion:     found.institucion,
        cargo:           found.cargo,
        dni:             found.dni,
        activo:          found.activo,
        mock:            true,
      }

      saveSession(sessionData)
      setUser(sessionData)
      setPerfil(sessionData)

      return { success: true, user: sessionData }
    }

    // ─── MODO SUPABASE ────────────────────────────────────────────────────
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    email.trim(),
        password: password,
      })
      if (error) throw error

      // Verificar si el perfil está aprobado por el admin
      const { data: profileData } = await supabase
        .from('perfiles')
        .select('activo, rol, tipo_personal_id')
        .eq('id', data.user.id)
        .single()

      const pendingApproval = !profileData?.activo

      return { success: true, user: data.user, pendingApproval }
    } catch (err) {
      let msg = 'Error al iniciar sesión'
      if (err.message.includes('Invalid login')) msg = 'Email o contraseña incorrectos'
      if (err.message.includes('Email not confirmed')) msg = 'Confirmá tu email primero'
      return { success: false, error: msg }
    }
  }, [])

  // ── LOGIN CON GOOGLE ───────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    if (!SUPABASE_READY) {
      return { success: false, error: 'Google OAuth requiere Supabase configurado. Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' }
    }
    try {
      const hostedDomain = getPrimaryHostedDomain()
      const queryParams = hostedDomain ? { hd: hostedDomain } : {}
      const redirectTo = `${window.location.origin}/auth/callback`

      console.log('loginWithGoogle: redirectTo =', redirectTo, 'hd =', hostedDomain)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams,
          skipBrowserRedirect: false,
        },
      })
      console.log('loginWithGoogle: response =', data, 'error =', error)
      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('loginWithGoogle: error =', err)
      return { success: false, error: err.message }
    }
  }, [])

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    clearSession()
    setUser(null)
    setPerfil(null)

    if (SUPABASE_READY) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error('Error en logout:', e)
      }
    }
  }, [])

  // ── REGISTRAR USUARIO ──────────────────────────────────────────────────────
  const register = useCallback(async ({
    email, password, nombre_completo, dni,
    telefono, cargo, institucion, tipo_personal
  }) => {
    // Validar que el tipo_personal tenga un rol válido
    const ROLES_VALIDOS = ['admin', 'agente_campo', 'deposito', 'fiscal_juez']
    if (!ROLES_VALIDOS.includes(tipo_personal?.rol)) {
      return { success: false, error: 'Tipo de personal inválido' }
    }

    // ─── MODO MOCK ────────────────────────────────────────────────────────
    if (!SUPABASE_READY) {
      const newUser = {
        id:              `mock-${Date.now()}`,
        email:           email.trim(),
        password_mock:   password,
        nombre_completo,
        dni,
        telefono,
        cargo,
        institucion,
        rol:             tipo_personal.rol,  // minúscula, asignado automáticamente
        tipo_personal,
        activo:          true,
        mock:            true,
        created_at:      new Date().toISOString(),
      }

      const sessionData = { ...newUser }
      saveSession(sessionData)
      setUser(sessionData)
      setPerfil(sessionData)

      return { success: true, user: newUser, mock: true }
    }

    // ─── MODO SUPABASE ────────────────────────────────────────────────────
    try {
      const { data, error } = await supabase.auth.signUp({
        email:    email.trim(),
        password: password,
        options: {
          data: {
            nombre_completo,
            dni,
            telefono,
            cargo,
            institucion,
            rol:             tipo_personal.rol,  // minúscula siempre
            tipo_personal_id: tipo_personal.id,
          }
        }
      })
      if (error) throw error
      return { success: true, user: data.user, needsVerification: !data.session }
    } catch (err) {
      let msg = 'Error al registrarse'
      if (err.message.includes('already registered')) msg = 'Este email ya está registrado'
      if (err.message.includes('weak')) msg = 'La contraseña es muy débil'
      return { success: false, error: msg }
    }
  }, [])

  // ── Verificar si el usuario tiene cierto rol ───────────────────────────────
  const hasRole = useCallback((...roles) => {
    const currentRol = perfil?.rol || user?.rol
    return roles.includes(currentRol)
  }, [perfil, user])

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    user,
    perfil,
    loading,
    isAuthenticated:  !!(user),
    rol:              perfil?.rol || user?.rol || null,
    supabaseReady:    SUPABASE_READY,
    isMock:           !SUPABASE_READY,
    isAdmin:          hasRole('admin'),
    isAgenteCampo:    hasRole('agente_campo'),
    isDeposito:       hasRole('deposito'),
    isFiscalJuez:     hasRole('fiscal_juez'),
    hasRole,
    login,
    loginWithGoogle,
    loginGoogle: loginWithGoogle,
    logout,
    register,
    cargarPerfil,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
