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
}

// Exportar instancia singleton
export const supabaseService = SupabaseService.getInstance()
export default supabaseService