import { QueueEntry, SongRequest, QueueResponse } from '../types/queue'
import { supabaseService } from './supabaseService'
import { logger } from '../config'

/**
 * Servicio para interactuar con la cola de Supabase
 * Basado en el QueueService de Angular pero adaptado para Vue + Supabase directo
 */
export class QueueService {
  private tenantId: string = ''

  constructor() {
    logger.info('Inicializando QueueService con Supabase')
  }

  /**
   * Agregar una nueva canción a la cola
   */
  async addSongToQueue(songRequest: SongRequest): Promise<QueueEntry> {
    try {
      // Validar que existe tenant
      if (!this.tenantId) {
        throw new Error('No hay tenant configurado. Escanea un QR válido primero.')
      }

      logger.log('📝 Agregando canción a la cola:', songRequest)
      
      // Crear objeto con campos mínimos requeridos por la BD
      const newEntry: any = {
        tenant_id: this.tenantId,
        name: songRequest.name.trim(),
        title_raw: `${songRequest.title.trim()} - ${songRequest.artist.trim()}`,
        status: 'waiting'
      }

      // Agregar YouTube URL si está presente
      if (songRequest.youtubeLink?.trim()) {
        newEntry.youtube_url = songRequest.youtubeLink.trim()
      }

      // Eliminar campos undefined o null
      Object.keys(newEntry).forEach(key => {
        if (newEntry[key] === undefined || newEntry[key] === null) {
          delete newEntry[key]
        }
      })

      logger.log('📤 Datos a enviar a Supabase para tenant:', this.tenantId, newEntry)

      const { data, error } = await supabaseService.getClient()
        .from('queue')
        .insert([newEntry])
        .select()
        .single()

      if (error) {
        logger.error('💥 Error de Supabase:', error)
        throw error
      }

      logger.log('🎉 Canción agregada exitosamente:', data)
      return data as QueueEntry
    } catch (error: any) {
      logger.error('💥 Error al agregar canción:', error)
      
      let errorMessage = 'Error desconocido'
      if (error.message) {
        errorMessage = error.message
      } else if (error.details) {
        errorMessage = error.details
      } else if (error.hint) {
        errorMessage = error.hint
      }
      
      throw new Error(`Error al agregar canción: ${errorMessage}`)
    }
  }

  /**
   * Obtener el estado actual de la cola
   */
  async getQueue(): Promise<QueueEntry[]> {
    try {
      if (!this.tenantId) {
        logger.warn('No hay tenant configurado para obtener la cola')
        return []
      }

      const { data, error } = await supabaseService.getClient()
        .from('queue')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: true })

      if (error) {
        logger.error('💥 Error al obtener cola:', error)
        throw error
      }

      logger.log('📋 Cola obtenida:', data)
      return data as QueueEntry[]
    } catch (error: any) {
      logger.error('💥 Error al obtener cola:', error)
      throw new Error('Error al obtener la cola')
    }
  }

  /**
   * Obtener la posición del cantante en la cola
   */
  async getPosition(singerName: string): Promise<{ position: number; total: number }> {
    try {
      const queue = await this.getQueue()
      const waitingQueue = queue.filter(entry => entry.status === 'waiting')
      const position = waitingQueue.findIndex(entry => 
        entry.name.toLowerCase() === singerName.toLowerCase()
      )
      
      return {
        position: position >= 0 ? position + 1 : -1,
        total: waitingQueue.length
      }
    } catch (error: any) {
      logger.error('💥 Error al obtener posición:', error)
      throw new Error('Error al obtener posición en la cola')
    }
  }

  /**
   * Configurar tenant ID
   */
  setTenantId(tenantId: string) {
    this.tenantId = tenantId
    logger.info('🏢 Tenant configurado:', tenantId)
  }

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return {
      tenantId: this.tenantId,
      hasConnection: true,
      service: 'supabase'
    }
  }

  /**
   * Probar la conexión con Supabase
   */
  async testConnection(): Promise<boolean> {
    return await supabaseService.testConnection()
  }

  /**
   * Obtener el cantante actual (performing)
   */
  async getCurrentPerformer(): Promise<QueueEntry | null> {
    try {
      if (!this.tenantId) {
        logger.warn('No hay tenant configurado para obtener cantante actual')
        return null
      }

      const { data, error } = await supabaseService.getClient()
        .from('queue')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('status', 'performing')
        .single()

      if (error) {
        // Si no hay datos (no hay nadie performing), no es un error real
        if (error.code === 'PGRST116') {
          logger.info('No hay cantante actual (performing)')
          return null
        }
        logger.error('Error al obtener cantante actual:', error)
        return null
      }

      logger.info('🎤 Cantante actual obtenido:', data?.name)
      return data as QueueEntry
    } catch (error: any) {
      logger.error('Error en getCurrentPerformer:', error)
      return null
    }
  }

  /**
   * Obtener el cantante llamado (called)
   */
  async getCalledPerformer(): Promise<QueueEntry | null> {
    try {
      if (!this.tenantId) {
        return null
      }

      const { data, error } = await supabaseService.getClient()
        .from('queue')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('status', 'called')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No hay nadie llamado
        }
        logger.error('Error al obtener cantante llamado:', error)
        return null
      }

      logger.info('🔔 Cantante llamado obtenido:', data?.name)
      return data as QueueEntry
    } catch (error: any) {
      logger.error('Error en getCalledPerformer:', error)
      return null
    }
  }

  /**
   * Parsear título de canción (artista - canción)
   */
  parseTitle(titleRaw?: string): { artist?: string; title: string } {
    if (!titleRaw) {
      return { title: 'Sin título' }
    }

    // Buscar patrón "Artista - Canción" o "Artista: Canción"
    const separators = [' - ', ' : ', ': ', ' – ']
    
    for (const separator of separators) {
      if (titleRaw.includes(separator)) {
        const parts = titleRaw.split(separator)
        if (parts.length >= 2) {
          return {
            artist: parts[0].trim(),
            title: parts.slice(1).join(separator).trim()
          }
        }
      }
    }

    // Si no hay separador, toda la cadena es el título
    return { title: titleRaw.trim() }
  }

  /**
   * Extraer ID de video de YouTube
   */
  extractYouTubeId(text?: string): string | null {
    if (!text) return null

    // Patrones para diferentes formatos de URL de YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  /**
   * Verificar si hay URL de YouTube en la entrada
   */
  hasYouTubeVideo(entry: QueueEntry): boolean {
    const title = entry.title_raw || (entry as any).song || (entry as any).title || ''
    const youtubeUrl = entry.youtube_url || (entry as any).youtubeUrl || ''
    
    return !!(this.extractYouTubeId(title) || this.extractYouTubeId(youtubeUrl))
  }
  async getQueueStats(): Promise<{
    waiting: number;
    called: number;
    performing: number;
    done: number;
    total: number;
  }> {
    try {
      const queue = await this.getQueue()
      return {
        waiting: queue.filter(e => e.status === 'waiting').length,
        called: queue.filter(e => e.status === 'called').length,
        performing: queue.filter(e => e.status === 'performing').length,
        done: queue.filter(e => e.status === 'done').length,
        total: queue.length
      }
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error)
      return { waiting: 0, called: 0, performing: 0, done: 0, total: 0 }
    }
  }
}

// Instancia singleton del servicio
export const queueService = new QueueService()
export default queueService