import { createClient, SupabaseClient } from '@supabase/supabase-js'
import config, { logger } from '../config'

/**
 * Servicio de Supabase para la aplicación KaraQR Singer
 * Proporciona acceso a la base de datos y autenticación
 */
export class SupabaseService {
  private client: SupabaseClient
  private static instance: SupabaseService

  constructor() {
    const supabaseUrl = config.supabase.url
    const supabaseKey = config.supabase.anonKey

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas')
    }

    logger.info('Inicializando Supabase client:', {
      url: supabaseUrl,
      hasKey: !!supabaseKey
    })

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  }

  /**
   * Obtener instancia singleton
   */
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  /**
   * Obtener el cliente de Supabase
   */
  getClient(): SupabaseClient {
    return this.client
  }

  /**
   * Verificar la conexión con Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      // Usar una consulta simple para verificar conectividad
      // Sin contar registros, solo verificar que la tabla existe y es accesible
      const { data, error } = await this.client
        .from('queue')
        .select('id')
        .limit(1)

      if (error) {
        logger.error('Error en test de conexión:', error)
        return false
      }

      logger.info('Conexión a Supabase exitosa:', {
        connected: true,
        recordsReturned: data ? data.length : 0
      })
      return true
    } catch (error) {
      logger.error('Error al conectar con Supabase:', error)
      return false
    }
  }

  /**
   * Obtener información de la sesión actual
   */
  async getSession() {
    const { data: { session }, error } = await this.client.auth.getSession()
    if (error) {
      logger.error('Error al obtener sesión:', error)
    }
    return session
  }

  /**
   * Iniciar sesión con Google OAuth
   */
  async signInWithGoogle(redirectTo?: string) {
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        logger.error('Error en login con Google:', error)
        throw error
      }

      logger.info('Inicio de sesión con Google iniciado:', data)
      return { data, error: null }
    } catch (error) {
      logger.error('Excepción en signInWithGoogle:', error)
      return { data: null, error }
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut() {
    try {
      const { error } = await this.client.auth.signOut()
      if (error) {
        logger.error('Error al cerrar sesión:', error)
        throw error
      }
      logger.info('Sesión cerrada exitosamente')
      return { error: null }
    } catch (error) {
      logger.error('Excepción en signOut:', error)
      return { error }
    }
  }

  /**
   * Obtener usuario actual de la sesión
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser()
      if (error) {
        logger.error('Error al obtener usuario:', error)
        return null
      }
      return user
    } catch (error) {
      logger.error('Excepción en getCurrentUser:', error)
      return null
    }
  }

  /**
   * Escuchar cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.client.auth.onAuthStateChange(callback)
  }
}

// Exportar instancia singleton
export const supabaseService = SupabaseService.getInstance()
export default supabaseService