import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Hook para acceder al contexto de autenticación.
 * Expone: user, perfil, loading, isAuthenticated, rol,
 *         isMock, supabaseReady, isAdmin, isAgenteCampo,
 *         isDeposito, isFiscalJuez, hasRole,
 *         login, loginWithGoogle, logout, register
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de <AuthProvider>. ' +
      'Verificá que App.jsx tenga <AuthProvider> como wrapper.'
    )
  }

  return context
}

export default useAuth
