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
   * Extraer datos del usuario desde la información de OAuth de Google
   * Google proporciona estos campos en user_metadata:
   * - name, full_name: Nombre completo del usuario
   * - avatar_url, picture: URL de la foto de perfil
   * - email: Correo electrónico
   */
  private extractUserFromOAuth(oauthUser: any): AuthUser {
    const metadata = oauthUser.user_metadata || {}
    
    // Log completo de todos los datos recibidos de Google
    console.log('📦 Datos completos de OAuth:', {
      id: oauthUser.id,
      email: oauthUser.email,
      user_metadata: metadata,
      identities: oauthUser.identities
    })
    
    // Intentar obtener el nombre en este orden de prioridad
    const name = metadata.name || 
                 metadata.full_name || 
                 metadata.given_name || 
                 oauthUser.email?.split('@')[0] || 
                 'Usuario'
    
    // Intentar obtener el avatar en este orden de prioridad
    // Google generalmente usa 'avatar_url' o 'picture'
    const avatar = metadata.avatar_url || 
                   metadata.picture || 
                   metadata.photo ||
                   (oauthUser.identities && oauthUser.identities[0]?.identity_data?.avatar_url) ||
                   (oauthUser.identities && oauthUser.identities[0]?.identity_data?.picture) ||
                   'https://cdn.quasar.dev/img/avatar.png'
    
    logger.info('👤 Datos extraídos de Google:', {
      name,
      email: oauthUser.email,
      avatar,
      hasCustomAvatar: !avatar.includes('quasar.dev'),
      metadata: metadata
    })
    
    return {
      id: oauthUser.id,
      email: oauthUser.email || null,
      name: name,
      avatar: avatar,
      provider: 'google',
      isAuthenticated: true
    }
  }
  
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
        // Usuario autenticado con OAuth - extraer datos de Google
        const authUser = this.extractUserFromOAuth(oauthUser)
        
        // Guardar en localStorage para consistencia
        localStorage.setItem('karaqr-user', JSON.stringify(authUser))
        
        logger.info('✅ Usuario OAuth recuperado:', {
          name: authUser.name,
          email: authUser.email,
          provider: authUser.provider
        })
        
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
        // Usuario se autenticó con OAuth - extraer datos de Google
        const authUser = this.extractUserFromOAuth(session.user)
        
        localStorage.setItem('karaqr-user', JSON.stringify(authUser))
        
        logger.info('✅ Usuario OAuth autenticado:', {
          name: authUser.name,
          email: authUser.email,
          hasAvatar: authUser.avatar !== 'https://cdn.quasar.dev/img/avatar.png'
        })
        
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
