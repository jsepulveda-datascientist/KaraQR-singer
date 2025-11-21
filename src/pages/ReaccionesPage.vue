<template src="../templates/pages/ReaccionesPage.html"></template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import { reactionsService } from '../services/reactionsService'
import { queueService } from '../services/queueService'
import type { Reaction } from '../services/reactionsService'
import type { QueueEntry } from '../types/queue'
import NoTenantPrompt from '../components/NoTenantPrompt.vue'

interface Performance {
  id?: string | number
  name: string
  title_raw?: string
  youtube_url?: string
  status: string
}

interface ReactionButton {
  emoji: string
  type: Reaction['type']
  color: string
  count: number
}

// Composables y servicios
const $q = useQuasar()
const { tenantId, isValidTenant, requireTenant, navigateWithTenant } = useTenant()
const { userName, user, checkSession, getSessionInfo } = useUser()

// Estado reactivo
const isConnected = ref(false)

// Verificación periódica de sesión
let sessionCheckInterval: any = null
const currentPerformance = ref<Performance | null>(null)
const calledPerformance = ref<Performance | null>(null)

const reactions = ref<ReactionButton[]>([
  { emoji: '❤️', type: 'love', color: 'pink-3', count: 0 },
  { emoji: '👏', type: 'clap', color: 'green-3', count: 0 },
  { emoji: '🤘', type: 'rock', color: 'red-3', count: 0 },
  { emoji: '🤩', type: 'mindblown', color: 'deep-purple-3', count: 0 },
  { emoji: '🔥', type: 'fire', color: 'orange-3', count: 0 },
  { emoji: '🎸', type: 'guitar', color: 'purple-3', count: 0 },
  { emoji: '⚡', type: 'electric', color: 'yellow-3', count: 0 },
  { emoji: '🎵', type: 'music', color: 'blue-3', count: 0 },
  { emoji: '🔊', type: 'loud', color: 'teal-3', count: 0 },
  { emoji: '😎', type: 'cool', color: 'indigo-3', count: 0 },
  { emoji: '🙌', type: 'praise', color: 'cyan-3', count: 0 }
])

const quickComments = ref([
  '¡Increíble!',
  '¡Bravo!',
  '¡Qué voz!',
  '¡Más fuerte!',
  '¡Espectacular!',
  '¡Idolo!',
  '¡Idola!',
  '¡Grande Maestro!'
])

const recentReaction = ref('')

// Computed para obtener datos parseados de la performance actual
const currentSong = computed(() => {
  if (!currentPerformance.value) return null
  return queueService.parseTitle(currentPerformance.value.title_raw)
})

const calledSong = computed(() => {
  if (!calledPerformance.value) return null
  return queueService.parseTitle(calledPerformance.value.title_raw)
})

const hasYouTubeVideo = computed(() => {
  if (!currentPerformance.value) return false
  return queueService.hasYouTubeVideo(currentPerformance.value as QueueEntry)
})

/**
 * Cargar datos del cantante actual desde la cola
 */
async function loadCurrentPerformance() {
  try {
    if (!tenantId.value) {
      console.warn('No hay tenant configurado')
      return
    }

    // Configurar el tenant en el servicio de cola
    queueService.setTenantId(tenantId.value)
    
    // Obtener cantante actual (performing)
    const current = await queueService.getCurrentPerformer()
    if (current) {
      currentPerformance.value = current as Performance
      console.log('🎤 Cantante actual cargado:', current.name)
    } else {
      // Si no hay cantante performing, verificar si hay alguien llamado
      const called = await queueService.getCalledPerformer()
      if (called) {
        calledPerformance.value = called as Performance
        currentPerformance.value = null
        console.log('🔔 Cantante llamado cargado:', called.name)
      } else {
        currentPerformance.value = null
        calledPerformance.value = null
        console.log('❌ No hay cantante actual ni llamado')
      }
    }
  } catch (error) {
    console.error('Error al cargar performance actual:', error)
    currentPerformance.value = null
    calledPerformance.value = null
  }
}

/**
 * Enviar una reacción
 */
async function sendReaction(type: Reaction['type']) {
  try {
    console.log('🚀 sendReaction llamada:', { type, userName: userName.value, isConnected: isConnected.value })
    
    if (!isConnected.value) {
      throw new Error('No conectado al sistema de reacciones')
    }

    // Verificar estado de sesión antes de enviar
    if (!user.value.isAuthenticated) {
      console.warn('⚠️ Usuario no autenticado al enviar reacción, verificando sesión...')
      checkSession()
      
      if (!user.value.isAuthenticated) {
        throw new Error('Debes iniciar sesión para enviar reacciones')
      }
    }

    // Enviar reacción via broadcast
    console.log('📤 Enviando reacción con userName:', userName.value)
    await reactionsService.sendReaction(type, userName.value)
    
    // Actualizar contador local
    const reaction = reactions.value.find(r => r.type === type)
    if (reaction) {
      reaction.count++
    }
    
    // Efecto visual
    recentReaction.value = type
    setTimeout(() => {
      recentReaction.value = ''
    }, 1000)
    
    // Notificación de éxito
    $q.notify({
      type: 'positive',
      message: `${getReactionEmoji(type)} Reacción enviada`,
      timeout: 1000,
      position: 'bottom'
    })
    
  } catch (error: any) {
    console.error('Error al enviar reacción:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar reacción',
      caption: error.message,
      icon: 'error',
      position: 'top'
    })
  }
}

/**
 * Enviar un comentario rápido
 */
async function sendComment(comment: string) {
  try {
    console.log('💬 sendComment llamada:', { comment, userName: userName.value, isConnected: isConnected.value })
    
    if (!isConnected.value) {
      throw new Error('No conectado al sistema de reacciones')
    }

    // Verificar estado de sesión antes de enviar
    if (!user.value.isAuthenticated) {
      console.warn('⚠️ Usuario no autenticado al enviar comentario, verificando sesión...')
      checkSession()
      
      if (!user.value.isAuthenticated) {
        throw new Error('Debes iniciar sesión para enviar comentarios')
      }
    }

    console.log('📤 Enviando comentario con userName:', userName.value)
    await reactionsService.sendComment(comment, userName.value)
    
    $q.notify({
      type: 'positive',
      message: '💬 Comentario enviado',
      timeout: 1000,
      position: 'bottom'
    })
    
  } catch (error: any) {
    console.error('Error al enviar comentario:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar comentario',
      caption: error.message,
      icon: 'error',
      position: 'top'
    })
  }
}

function getReactionEmoji(type: string): string {
  const reaction = reactions.value.find(r => r.type === type)
  return reaction ? reaction.emoji : '👍'
}

/**
 * Redirigir a la página principal para iniciar sesión
 */
function redirectToHome() {
  navigateWithTenant('/')
}

// Lifecycle hooks
onMounted(async () => {
  console.log('🚀 ReaccionesPage montada, inicializando...')
  
  // Verificar estado de conexión inicial
  isConnected.value = reactionsService.isChannelConnected()
  console.log('🔗 Estado inicial de conexión:', isConnected.value)
  
  // Verificar estado de sesión inicial
  const sessionInfo = getSessionInfo()
  console.log('👤 Estado inicial de sesión:', sessionInfo)
  
  // Cargar performance actual
  await loadCurrentPerformance()
  
  // Configurar actualización periódica de la performance
  const performanceInterval = setInterval(loadCurrentPerformance, 5000) // Cada 5 segundos
  
  // Configurar verificación periódica de sesión (cada 15 segundos)
  sessionCheckInterval = setInterval(() => {
    console.log('🔄 Verificando estado de sesión...')
    checkSession()
  }, 15000)
  
  // Cleanup al desmontar
  onUnmounted(() => {
    console.log('🔄 Limpiando ReaccionesPage...')
    clearInterval(performanceInterval)
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval)
    }
  })
})

onUnmounted(() => {
  // La desconexión se maneja automáticamente en el logout
  console.log('🔗 Saliendo de página de reacciones')
})
</script>

<style src="../styles/pages/ReaccionesPage.scss" scoped></style>