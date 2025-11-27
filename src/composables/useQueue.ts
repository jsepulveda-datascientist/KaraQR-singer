import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { queueService } from '../services/queueService'
import { useTenant } from './useTenant'
import { useUser } from './useUser'
import type { SongRequest } from '../types/queue'

export function useQueue() {
  const $q = useQuasar()
  const { tenantId, requireTenant } = useTenant()
  const { userName } = useUser()
  
  const loading = ref(false)
  const showConfirmation = ref(false)
  const submittedSong = ref<SongRequest | null>(null)

  /**
   * Agregar canción a la fila con confirmación previa
   */
  async function addToQueue(song: { title: string; artist: string; youtubeLink?: string }) {
    return new Promise<boolean>((resolve) => {
      // Validar que existe tenant antes de enviar
      if (!requireTenant()) {
        $q.notify({
          type: 'warning',
          message: 'No hay local configurado',
          caption: 'Escanea el QR del establecimiento primero',
          icon: 'qr_code_scanner',
          position: 'top'
        })
        resolve(false)
        return
      }

      // Mostrar dialog de confirmación
      $q.dialog({
        title: '🎤 ¿Anotarte para cantar?',
        message: `<div style="text-align: left;">
          <p><strong>Canción:</strong> ${song.title}</p>
          <p><strong>Artista:</strong> ${song.artist}</p>
          <p><strong>Cantante:</strong> ${userName.value}</p>
        </div>`,
        html: true,
        ok: {
          label: 'Sí, anotarme',
          color: 'primary',
          icon: 'mic'
        },
        cancel: {
          label: 'Cancelar',
          color: 'grey-7',
          flat: true
        }
      }).onOk(async () => {
        await submitToQueue(song)
        resolve(true)
      }).onCancel(() => {
        resolve(false)
      })
    })
  }

  /**
   * Enviar canción a la fila
   */
  async function submitToQueue(song: { title: string; artist: string; youtubeLink?: string }) {
    loading.value = true
    
    try {
      // Validar tenant nuevamente antes de enviar
      if (!tenantId.value) {
        throw new Error('No hay tenant configurado')
      }

      // Preparar datos de la solicitud
      const songRequest: SongRequest = {
        name: userName.value,
        title: song.title,
        artist: song.artist,
        youtubeLink: song.youtubeLink || undefined
      }
      
      console.log('🎵 Enviando solicitud de canción para tenant:', tenantId.value, songRequest)
      
      // Enviar a la API
      await queueService.addSongToQueue(songRequest)
      
      // Guardar para mostrar en confirmación
      submittedSong.value = songRequest
      
      // Mostrar notificación de éxito
      $q.notify({
        type: 'positive',
        message: '¡Canción agregada exitosamente!',
        caption: 'Te notificaremos cuando sea tu turno',
        icon: 'mic',
        position: 'top'
      })
      
      // Mostrar confirmación
      showConfirmation.value = true
      
      console.log('✅ Canción enviada exitosamente')
    } catch (error: any) {
      console.error('❌ Error al enviar canción:', error)
      
      // Mostrar notificación de error
      $q.notify({
        type: 'negative',
        message: 'Error al enviar canción',
        caption: error.message || 'Inténtalo de nuevo',
        icon: 'error',
        position: 'top'
      })
      
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Resetear estado de confirmación
   */
  function resetConfirmation() {
    showConfirmation.value = false
    submittedSong.value = null
  }

  return {
    loading,
    showConfirmation,
    submittedSong,
    addToQueue,
    submitToQueue,
    resetConfirmation
  }
}
