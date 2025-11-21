import { supabaseService } from './supabaseService'
import { logger } from '../config'

/**
 * Tipos para el sistema de reacciones
 */
export interface Reaction {
  type: 'love' | 'fire' | 'clap' | 'music' | 'amazing' | 'rock' | 'guitar' | 'electric' | 'loud' | 'cool' | 'wow' | 'mindblown' | 'praise'
  emoji: string
  userId?: string
  userName?: string
  timestamp: number
  tenantId: string
}

export interface Comment {
  text: string
  userId?: string
  userName?: string
  timestamp: number
  tenantId: string
}

export interface ReactionMessage {
  type: 'reaction' | 'comment'
  data: Reaction | Comment
  tenantId: string
}

/**
 * Servicio para manejar reacciones en tiempo real usando Supabase Broadcast
 */
export class ReactionsService {
  private tenantId: string = ''
  private channel: any = null
  private isConnected: boolean = false
  
  // Sistema de reconexión
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private baseReconnectDelay = 1000 // 1 segundo base
  private reconnectTimeout: any = null
  private isReconnecting = false
  
  // Límites de rate para evitar spam
  private lastConnectionAttempt = 0
  private minConnectionInterval = 5000 // 5 segundos mínimo entre reconexiones
  
  // Monitoreo de conexión
  private heartbeatInterval: any = null
  private heartbeatIntervalMs = 30000 // 30 segundos
  private connectionStartTime = 0
  
  // Control de estado
  private isDisconnecting = false

  constructor() {
    logger.info('Inicializando ReactionsService')
    this.setupConnectionMonitoring()
  }

  /**
   * Configurar el tenant y conectar al canal de broadcast
   */
  async connect(tenantId: string): Promise<void> {
    try {
      // Control de rate limiting
      const now = Date.now()
      if (now - this.lastConnectionAttempt < this.minConnectionInterval) {
        const waitTime = this.minConnectionInterval - (now - this.lastConnectionAttempt)
        logger.warn(`⏱️ Rate limit: esperando ${waitTime}ms antes de reconectar`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
      this.lastConnectionAttempt = Date.now()
      
      this.tenantId = tenantId
      this.connectionStartTime = Date.now()
      
      // Verificar conexión a Supabase primero
      logger.info('🔍 Verificando conexión a Supabase...')
      const supabaseConnected = await supabaseService.testConnection()
      if (!supabaseConnected) {
        throw new Error('No se puede conectar a Supabase')
      }
      logger.info('✅ Conexión a Supabase verificada')
      
      // Desconectar canal anterior si existe (con timeout)
      if (this.channel && !this.isDisconnecting) {
        await Promise.race([
          this.disconnect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout en disconnect')), 5000))
        ])
      }

      // Crear canal específico para el tenant con configuración optimizada
      const channelName = `reactions_${tenantId}`
      logger.info(`🔗 Creando canal: ${channelName}`)

      this.channel = supabaseService.getClient()
        .channel(channelName, {
          config: {
            broadcast: { 
              self: false, // Cambiar a false para evitar loops
              ack: false   // Deshabilitar para reducir overhead
            }
          }
        })

      // Configurar el canal con handlers más robustos
      this.channel
        .on('broadcast', { event: 'reaction' }, (payload: any) => {
          logger.log('📢 Reacción recibida:', payload)
        })
        .on('broadcast', { event: 'comment' }, (payload: any) => {
          logger.log('📢 Comentario recibido:', payload)
        })
        .on('broadcast', { event: 'heartbeat' }, () => {
          // Heartbeat silencioso
        })

      // Suscribirse al canal con timeout más robusto
      return new Promise((resolve, reject) => {
        let isResolved = false
        
        // Timeout más agresivo para producción
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true
            this.isConnected = false
            logger.error('⏰ Timeout: No se pudo conectar al canal en 15 segundos')
            reject(new Error('Timeout de conexión'))
          }
        }, 15000)
        
        this.channel.subscribe((status: string) => {
          logger.info(`🔗 Estado del canal de reacciones: ${status}`)
          
          if (status === 'SUBSCRIBED' && !isResolved) {
            isResolved = true
            clearTimeout(timeout)
            this.isConnected = true
            this.reconnectAttempts = 0 // Reset contador
            this.clearReconnectTimeout()
            this.startHeartbeat()
            logger.info('✅ Canal de reacciones conectado exitosamente')
            resolve()
          } else if (status === 'CHANNEL_ERROR' && !isResolved) {
            isResolved = true
            clearTimeout(timeout)
            this.isConnected = false
            const errorMsg = 'Error al suscribirse al canal'
            logger.error(`❌ ${errorMsg}`)
            reject(new Error(errorMsg))
          } else if (status === 'TIMED_OUT' && !isResolved) {
            isResolved = true
            clearTimeout(timeout)
            this.isConnected = false
            const errorMsg = 'Timeout al conectar con el canal'
            logger.error(`⏰ ${errorMsg}`)
            reject(new Error(errorMsg))
          } else if (status === 'CLOSED') {
            this.isConnected = false
            logger.warn(`❌ Error de conexión: ${status}`)
            // Solo programar reconexión si no estamos desconectando intencionalmente
            if (!this.isDisconnecting) {
              this.scheduleReconnect()
            }
          }
        })
      })

    } catch (error) {
      logger.error('❌ Error al conectar canal de reacciones:', error)
      this.isConnected = false
      // Solo programar reconexión si hay tenantId válido y no estamos desconectando
      if (this.tenantId && !this.isDisconnecting) {
        this.scheduleReconnect()
      }
      throw error
    }
  }

  /**
   * Enviar una reacción al canal de broadcast
   */
  async sendReaction(
    reactionType: Reaction['type'],
    userName: string = 'Anónimo'
  ): Promise<void> {
    try {
      console.log('📍 reactionsService.sendReaction llamada:', { 
        reactionType, 
        userName, 
        isConnected: this.isConnected, 
        tenantId: this.tenantId,
        hasChannel: !!this.channel 
      })
      
      // Verificar conexión y reconectar si es necesario
      if (!this.isConnected || !this.channel) {
        logger.warn('⚠️ No conectado, intentando reconectar...')
        if (this.tenantId) {
          await this.forceReconnect()
        } else {
          throw new Error('No hay tenantId configurado para reconectar')
        }
      }

      const reaction: Reaction = {
        type: reactionType,
        emoji: this.getEmojiForReaction(reactionType),
        userName,
        timestamp: Date.now(),
        tenantId: this.tenantId
      }

      logger.log('📤 Enviando reacción:', reaction)

      const { error } = await this.channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: {
          type: 'reaction',
          data: reaction,
          tenantId: this.tenantId
        }
      })

      if (error) {
        logger.error('Error al enviar reacción:', error)
        // Marcar como desconectado para triggers reconexón
        this.isConnected = false
        this.scheduleReconnect()
        throw error
      }

      logger.log('✅ Reacción enviada exitosamente')
    } catch (error) {
      logger.error('💥 Error al enviar reacción:', error)
      throw new Error(`Error al enviar reacción: ${error}`)
    }
  }

  /**
   * Enviar un comentario al canal de broadcast
   */
  async sendComment(
    text: string,
    userName: string = 'Anónimo'
  ): Promise<void> {
    try {
      // Verificar conexión y reconectar si es necesario
      if (!this.isConnected || !this.channel) {
        logger.warn('⚠️ No conectado, intentando reconectar...')
        if (this.tenantId) {
          await this.forceReconnect()
        } else {
          throw new Error('No hay tenantId configurado para reconectar')
        }
      }

      const comment: Comment = {
        text: text.trim(),
        userName,
        timestamp: Date.now(),
        tenantId: this.tenantId
      }

      logger.log('📤 Enviando comentario:', comment)

      const { error } = await this.channel.send({
        type: 'broadcast',
        event: 'comment',
        payload: {
          type: 'comment',
          data: comment,
          tenantId: this.tenantId
        }
      })

      if (error) {
        logger.error('Error al enviar comentario:', error)
        // Marcar como desconectado para trigger reconexón
        this.isConnected = false
        this.scheduleReconnect()
        throw error
      }

      logger.log('✅ Comentario enviado exitosamente')
    } catch (error) {
      logger.error('💥 Error al enviar comentario:', error)
      throw new Error(`Error al enviar comentario: ${error}`)
    }
  }

  /**
   * Desconectar del canal de reacciones
   */
  async disconnect(): Promise<void> {
    try {
      this.isDisconnecting = true
      this.clearReconnectTimeout()
      this.stopHeartbeat()
      
      if (this.channel) {
        logger.info('🔌 Desconectando del canal de reacciones')
        
        try {
          await Promise.race([
            this.channel.unsubscribe(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout en unsubscribe')), 5000)
            )
          ])
          logger.info('✅ Canal desconectado')
        } catch (unsubError) {
          logger.warn('⚠️ Error al desuscribirse del canal:', unsubError)
        }
        
        this.channel = null
        this.isConnected = false
      }
    } catch (error) {
      logger.error('❌ Error al desconectar canal de reacciones:', error)
    } finally {
      this.isDisconnecting = false
    }
  }

  /**
   * Configurar monitoreo de conexión con heartbeat
   */
  private setupConnectionMonitoring(): void {
    // Monitorear eventos de red del navegador
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        logger.info('🌐 Conexión de red restaurada')
        if (!this.isConnected && this.tenantId) {
          this.forceReconnect().catch(err => 
            logger.error('Error al reconectar después de restaurar red:', err)
          )
        }
      })
      
      window.addEventListener('offline', () => {
        logger.warn('🌐 Conexión de red perdida')
        this.isConnected = false
        this.stopHeartbeat()
      })
    }
  }

  /**
   * Iniciar heartbeat para monitorear conexión
   */
  private startHeartbeat(): void {
    this.stopHeartbeat() // Limpiar cualquier heartbeat anterior
    
    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected && this.channel) {
        try {
          // Enviar ping silencioso para verificar conexión
          const { error } = await this.channel.send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: { 
              type: 'ping',
              timestamp: Date.now(),
              tenantId: this.tenantId
            }
          })
          
          if (error) {
            logger.warn('⚠️ Heartbeat falló, marcando como desconectado')
            this.isConnected = false
            this.scheduleReconnect()
          }
        } catch (error) {
          logger.warn('⚠️ Error en heartbeat:', error)
          this.isConnected = false
          this.scheduleReconnect()
        }
      }
    }, this.heartbeatIntervalMs)
  }

  /**
   * Detener heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Obtener emoji para tipo de reacción
   */
  private getEmojiForReaction(type: Reaction['type']): string {
    const emojiMap: Record<Reaction['type'], string> = {
      love: '❤️',
      fire: '🔥',
      clap: '👏',
      music: '🎵',
      amazing: '😍',
      rock: '🤘',
      guitar: '🎸',
      electric: '⚡',
      loud: '🔊',
      cool: '😎',
      wow: '🎆',
      mindblown: '🤩',
      praise: '🙌'
    }
    return emojiMap[type] || '👍'
  }

  /**
   * Verificar estado de conexión
   */
  isChannelConnected(): boolean {
    return this.isConnected
  }

  /**
   * Probar la conexión con Supabase
   */
  async testConnection(): Promise<boolean> {
    return await supabaseService.testConnection()
  }

  /**
   * Obtener información del canal actual
   */
  getChannelInfo() {
    return {
      tenantId: this.tenantId,
      isConnected: this.isConnected,
      channelName: this.tenantId ? `reactions_${this.tenantId}` : null
    }
  }

  /**
   * Configurar tenant sin conectar (para casos donde se necesite la info del tenant)
   */
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId
  }

  /**
   * Programar reconexión automática con backoff exponencial
   */
  private scheduleReconnect(): void {
    // No reconectar si estamos desconectando intencionalmente
    if (this.isDisconnecting) {
      logger.info('🚫 No se programa reconexión: desconexión intencional')
      return
    }
    
    // No reconectar si ya se agotaron los intentos
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('🚫 Se agotaron los intentos de reconexión')
      return
    }
    
    // No reconectar si ya hay una reconexión en progreso
    if (this.isReconnecting) {
      logger.warn('🔄 Ya hay una reconexión en progreso, saltando...')
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++
    
    // Backoff exponencial con jitter: 1s, 2s, 4s, 8s, 16s
    const baseDelay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    // Agregar jitter para evitar thundering herd
    const jitter = Math.random() * 1000
    const delay = Math.min(baseDelay + jitter, 30000) // Máximo 30 segundos
    
    logger.info(`🔄 Programando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${Math.round(delay)}ms`)
    
    this.reconnectTimeout = setTimeout(async () => {
      try {
        logger.info(`🔄 Intentando reconectar (intento ${this.reconnectAttempts})...`)
        await this.connect(this.tenantId)
        this.isReconnecting = false
        logger.info('✅ Reconexión exitosa')
      } catch (error) {
        logger.error(`❌ Fallo en reconexión ${this.reconnectAttempts}:`, { 
          success: false, 
          message: `Error de conexión: ${error}` 
        })
        this.isReconnecting = false
        
        // Solo continuar reconectando si no hemos alcanzado el límite
        if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isDisconnecting) {
          this.scheduleReconnect()
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          logger.error('🚫 Límite de reconexiones alcanzado. Deteniendo intentos.')
        }
      }
    }, delay)
  }

  /**
   * Limpiar timeout de reconexión
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
      this.isReconnecting = false
    }
  }

  /**
   * Forzar reconexón manual
   */
  async forceReconnect(): Promise<void> {
    logger.info('🔄 Forzando reconexón manual...')
    this.clearReconnectTimeout()
    
    if (this.tenantId) {
      // No resetear reconnectAttempts para mantener el backoff en caso de fallos
      try {
        await this.connect(this.tenantId)
        logger.info('✅ Reconexón manual exitosa')
      } catch (error) {
        logger.error('❌ Error en reconexón manual:', error)
        this.scheduleReconnect() // Volver al sistema automático
        throw error
      }
    } else {
      throw new Error('No hay tenantId configurado para reconectar')
    }
  }

  /**
   * Resetear completamente el sistema de reconexión
   */
  resetReconnectionSystem(): void {
    logger.info('🔄 Reseteando sistema de reconexión...')
    this.reconnectAttempts = 0
    this.clearReconnectTimeout()
    this.stopHeartbeat()
    this.isReconnecting = false
  }

  /**
   * Obtener estadísticas de conexión para debugging
   */
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      tenantId: this.tenantId,
      hasChannel: !!this.channel,
      hasHeartbeat: !!this.heartbeatInterval
    }
  }
}

// Instancia singleton
export const reactionsService = new ReactionsService()
export default reactionsService