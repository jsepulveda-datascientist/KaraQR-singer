import { supabaseService } from './supabaseService'
import { logger } from '../config'

export interface AuthUser {
  id: string
  email: string | null
  name: string
  avatar: string
  provider: 'google' | 'guest'
  isAuthenticated: boolean
}

/**
 * Servicio de autenticación para KaraQR Singer
 * Maneja tanto autenticación OAuth (Google) como invitados
 */
class AuthService {
  
  /**
   * Iniciar sesión con Google
   */
  async loginWithGoogle(): Promise<{ success: boolean; error?: any }> {
    try {
      logger.info('🔐 Iniciando login con Google...')
      
      const { data, error } = await supabaseService.signInWithGoogle()
      
      if (error) {
        logger.error('❌ Error en login con Google:', error)
        return { success: false, error }
      }

      logger.info('✅ Redirección a Google OAuth iniciada')
      return { success: true }
    } catch (error) {
      logger.error('❌ Excepción en loginWithGoogle:', error)
      return { success: false, error }
    }
  }

  /**
   * Iniciar sesión como invitado
   */
  async loginAsGuest(name: string, avatar: string): Promise<{ success: boolean; user?: AuthUser; error?: any }> {
    try {
      logger.info('🔐 Iniciando login como invitado:', { name })
      
      // Crear usuario invitado (sin autenticación de Supabase)
      const guestUser: AuthUser = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: null,
        name: name.trim(),
        avatar,
        provider: 'guest',
        isAuthenticated: true
      }

      // Guardar en localStorage para persistencia
      localStorage.setItem('karaqr-user', JSON.stringify(guestUser))
      
      logger.info('✅ Login como invitado exitoso:', guestUser)
      return { success: true, user: guestUser }
    } catch (error) {
      logger.error('❌ Error en login como invitado:', error)
      return { success: false, error }
    }
  }

  /**
   * Obtener usuario actual (desde sesión OAuth o localStorage)
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Primero intentar obtener usuario de OAuth
      const oauthUser = await supabaseService.getCurrentUser()
      
      if (oauthUser) {
        // Usuario autenticado con OAuth
        const authUser: AuthUser = {
          id: oauthUser.id,
          email: oauthUser.email || null,
          name: oauthUser.user_metadata?.full_name || oauthUser.email?.split('@')[0] || 'Usuario',
          avatar: oauthUser.user_metadata?.avatar_url || oauthUser.user_metadata?.picture || 'https://cdn.quasar.dev/img/avatar.png',
          provider: 'google',
          isAuthenticated: true
        }
        
        // Guardar en localStorage para consistencia
        localStorage.setItem('karaqr-user', JSON.stringify(authUser))
        
        return authUser
      }

      // Si no hay usuario OAuth, verificar localStorage (invitado)
      const savedUser = localStorage.getItem('karaqr-user')
      if (savedUser) {
        return JSON.parse(savedUser) as AuthUser
      }

      return null
    } catch (error) {
      logger.error('Error al obtener usuario actual:', error)
      return null
    }
  }

  /**
   * Cerrar sesión (OAuth o invitado)
   */
  async logout(): Promise<void> {
    try {
      logger.info('🔐 Cerrando sesión...')
      
      // Cerrar sesión de Supabase si existe
      await supabaseService.signOut()
      
      // Limpiar localStorage
      localStorage.removeItem('karaqr-user')
      
      logger.info('✅ Sesión cerrada exitosamente')
    } catch (error) {
      logger.error('❌ Error al cerrar sesión:', error)
      throw error
    }
  }

  /**
   * Verificar si hay una sesión activa
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null && user.isAuthenticated
  }

  /**
   * Escuchar cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabaseService.onAuthStateChange(async (event, session) => {
      logger.info('🔄 Cambio en estado de autenticación:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Usuario se autenticó con OAuth
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || null,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || 'https://cdn.quasar.dev/img/avatar.png',
          provider: 'google',
          isAuthenticated: true
        }
        
        localStorage.setItem('karaqr-user', JSON.stringify(authUser))
        callback(authUser)
      } else if (event === 'SIGNED_OUT') {
        // Usuario cerró sesión
        localStorage.removeItem('karaqr-user')
        callback(null)
      } else {
        // Verificar usuario actual
        const user = await this.getCurrentUser()
        callback(user)
      }
    })
  }
}

export const authService = new AuthService()
export default authService
