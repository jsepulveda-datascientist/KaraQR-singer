/**
 * Tipos para el sistema de cola de KaraQR con Supabase
 * Basados en el esquema SQL de la tabla 'queue'
 */

// Status posibles de una entrada en la cola
export type QueueStatus = 'waiting' | 'called' | 'performing' | 'done'

/**
 * Interfaz para las entradas de la cola de karaoke
 */
export interface QueueEntry {
  id: number; // serial primary key en PostgreSQL
  tenant_id: string; // Campo requerido para multi-tenant
  name: string; // Nombre del cantante (requerido)
  title_raw: string; // Título completo de la canción (requerido)
  youtube_url?: string; // URL de YouTube (opcional)
  status: QueueStatus; // Estado de la entrada
  created_at: string; // timestamp con zona horaria
  updated_at?: string; // timestamp de última actualización
}

/**
 * Datos del formulario de solicitud del cantante
 */
export interface SongRequest {
  name: string;      // Nombre del cantante
  title: string;     // Título de la canción
  artist: string;    // Nombre del artista
  youtubeLink?: string; // URL de YouTube (opcional)
}

/**
 * Respuesta del servicio de cola
 */
export interface QueueResponse {
  data: QueueEntry[];
  total: number;
}

/**
 * Estadísticas de la cola
 */
export interface QueueStats {
  waiting: number;
  called: number;
  performing: number;
  done: number;
  total: number;
}