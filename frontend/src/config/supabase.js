import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || ''
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// ── Verificar si Supabase está configurado ────────────────────────────────────
export const SUPABASE_READY = !!(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.includes('supabase.co') &&
  supabaseKey.startsWith('eyJ')
)

// ── Cliente real (solo si está configurado) ───────────────────────────────────
export const supabase = SUPABASE_READY
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ── Tipos de personal hardcodeados (mock) ─────────────────────────────────────
// Usados mientras Supabase no esté configurado
// Cuando se conecte Supabase, estos datos vienen de la BD automáticamente
export const TIPOS_PERSONAL_MOCK = [
  { id: 'tp-1', nombre: 'Policía',                 descripcion: 'Personal policial de campo',          rol: 'agente_campo', color: '#2E75B6', icono: '👮', orden: 1, activo: true },
  { id: 'tp-2', nombre: 'Inspector de tránsito',   descripcion: 'Inspector o agente de control vial',  rol: 'agente_campo', color: '#2E75B6', icono: '🚦', orden: 2, activo: true },
  { id: 'tp-3', nombre: 'Responsable de depósito', descripcion: 'Corralón o predio de retención',      rol: 'deposito',     color: '#1D9E75', icono: '🏭', orden: 3, activo: true },
  { id: 'tp-4', nombre: 'Juez',                    descripcion: 'Magistrado judicial',                  rol: 'fiscal_juez',  color: '#7F77DD', icono: '⚖️', orden: 4, activo: true },
  { id: 'tp-5', nombre: 'Fiscal',                  descripcion: 'Fiscal de instrucción o penal',       rol: 'fiscal_juez',  color: '#7F77DD', icono: '📋', orden: 5, activo: true },
  { id: 'tp-6', nombre: 'Secretario judicial',     descripcion: 'Secretaría del juzgado o fiscalía',   rol: 'fiscal_juez',  color: '#7F77DD', icono: '📝', orden: 6, activo: true },
  { id: 'tp-7', nombre: 'Administrador',           descripcion: 'Gestión completa del sistema',        rol: 'admin',        color: '#BA7517', icono: '⚙️', orden: 7, activo: true },
]

// ── Usuarios mock para login y panel admin (roles en minúscula siempre) ───────
export const USUARIOS_MOCK = [
  {
    id: 'u-admin',
    email: 'admin@sigevir.demo',
    password_mock: 'admin123',
    nombre_completo: 'Admin Demo',
    dni: '20.000.001',
    telefono: '351-100-0001',
    cargo: 'Administrador',
    institucion: 'SIGEVIR Central',
    rol: 'admin',
    tipo_personal: TIPOS_PERSONAL_MOCK[6],
    activo: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'u-campo',
    email: 'campo@sigevir.demo',
    password_mock: 'campo123',
    nombre_completo: 'Oficial Pérez',
    dni: '28.456.789',
    telefono: '351-200-0002',
    cargo: 'Oficial de campo',
    institucion: 'Policía Judicial Córdoba',
    rol: 'agente_campo',
    tipo_personal: TIPOS_PERSONAL_MOCK[0],
    activo: true,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'u-deposito',
    email: 'deposito@sigevir.demo',
    password_mock: 'deposito123',
    nombre_completo: 'Juan Depósito',
    dni: '25.678.901',
    telefono: '351-300-0003',
    cargo: 'Responsable de corralón',
    institucion: 'Corralón Municipal',
    rol: 'deposito',
    tipo_personal: TIPOS_PERSONAL_MOCK[2],
    activo: true,
    created_at: '2026-02-01T00:00:00Z'
  },
  {
    id: 'u-fiscal',
    email: 'fiscal@sigevir.demo',
    password_mock: 'fiscal123',
    nombre_completo: 'Dra. Rodríguez',
    dni: '22.345.678',
    telefono: '351-400-0004',
    cargo: 'Fiscal de instrucción',
    institucion: 'Fiscalía N°3',
    rol: 'fiscal_juez',
    tipo_personal: TIPOS_PERSONAL_MOCK[4],
    activo: true,
    created_at: '2026-02-15T00:00:00Z'
  },
]

// ── Helpers para obtener datos (Supabase o mock) ───────────────────────────────

export const getTiposPersonal = async () => {
  if (!SUPABASE_READY) return { data: TIPOS_PERSONAL_MOCK.filter(t => t.activo), error: null }
  const result = await supabase.from('tipos_personal').select('*').eq('activo', true).order('orden')
  return result
}

export const getUsuarios = async () => {
  if (!SUPABASE_READY) return { data: USUARIOS_MOCK, error: null }
  const result = await supabase.from('perfiles').select('*, tipos_personal(*)').order('created_at', { ascending: false })
  return result
}

export const getUserByEmail = (email) => {
  return USUARIOS_MOCK.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}
