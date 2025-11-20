/**
 * Tipos adicionales para el sistema de reacciones
 */

export interface ReactionStats {
  love: number
  fire: number
  clap: number
  music: number
  amazing: number
}

export interface PerformanceInfo {
  id?: string
  title: string
  artist: string
  singer: string
  status: 'waiting' | 'performing' | 'done'
  startTime?: number
  tenantId: string
}

export interface ReactionEvent {
  id: string
  type: 'reaction' | 'comment'
  data: any
  timestamp: number
  userId?: string
  userName?: string
  tenantId: string
}

export interface BroadcastChannel {
  name: string
  tenantId: string
  isConnected: boolean
  subscribers: number
}