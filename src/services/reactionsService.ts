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

  constructor() {
    logger.info('Inicializando ReactionsService')
  }

  /**
   * Configurar el tenant y conectar al canal de broadcast
   */
  async connect(tenantId: string): Promise<void> {
    try {
      this.tenantId = tenantId
      
      // Verificar conexión a Supabase primero
      logger.info('Verificando conexión a Supabase...')
      const supabaseConnected = await supabaseService.testConnection()
      if (!supabaseConnected) {
        throw new Error('No se puede conectar a Supabase')
      }
      logger.info('✅ Conexión a Supabase verificada')
      
      // Desconectar canal anterior si existe
      if (this.channel) {
        await this.disconnect()
      }

      // Crear canal específico para el tenant
      const channelName = `reactions_${tenantId}`
      logger.info(`Conectando al canal de reacciones: ${channelName}`)

      this.channel = supabaseService.getClient()
        .channel(channelName, {
          config: {
            broadcast: { 
              self: true, // Cambiar a true para recibir confirmaciones
              ack: true   // Habilitar acknowledgments
            }
          }
        })

      // Configurar el canal
      this.channel
        .on('broadcast', { event: 'reaction' }, (payload: any) => {
          logger.log('📢 Reacción recibida:', payload)
          // Este callback se puede usar para actualizar la UI en tiempo real
        })
        .on('broadcast', { event: 'comment' }, (payload: any) => {
          logger.log('📢 Comentario recibido:', payload)
        })

      // Suscribirse al canal y esperar la confirmación
      return new Promise((resolve, reject) => {
        this.channel.subscribe((status: string) => {
          logger.info(`Estado del canal de reacciones: ${status}`)
          
          if (status === 'SUBSCRIBED') {
            this.isConnected = true
            logger.info('✅ Canal de reacciones conectado exitosamente')
            resolve()
          } else if (status === 'CHANNEL_ERROR') {
            this.isConnected = false
            reject(new Error('Error al suscribirse al canal'))
          } else if (status === 'TIMED_OUT') {
            this.isConnected = false
            reject(new Error('Timeout al conectar con el canal'))
          } else if (status === 'CLOSED') {
            this.isConnected = false
            reject(new Error('Canal cerrado inesperadamente'))
          }
        })
        
        // Timeout de seguridad
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Timeout: No se pudo conectar al canal en 10 segundos'))
          }
        }, 10000)
      })

    } catch (error) {
      logger.error('Error al conectar canal de reacciones:', error)
      this.isConnected = false
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
      
      if (!this.isConnected || !this.channel) {
        throw new Error('No conectado al canal de reacciones')
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
      if (!this.isConnected || !this.channel) {
        throw new Error('No conectado al canal de reacciones')
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
      if (this.channel) {
        logger.info('Desconectando del canal de reacciones')
        await this.channel.unsubscribe()
        this.channel = null
        this.isConnected = false
      }
    } catch (error) {
      logger.error('Error al desconectar canal de reacciones:', error)
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
      amazing: '😍'
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
}

// Instancia singleton
export const reactionsService = new ReactionsService()
export default reactionsService