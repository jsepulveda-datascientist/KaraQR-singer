<template>
  <q-page class="q-pa-md">
    <!-- Mostrar prompt cuando no hay tenant configurado -->
    <NoTenantPrompt v-if="!isValidTenant" />
    
    <!-- Contenido normal cuando hay tenant válido -->
    <div v-else>
      <div class="text-h4 q-mb-md text-center">
        ❤️ Reacciona
      </div>
    
    <!-- Presentación actual -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section class="q-pa-sm bg-grey-1">
        <div class="text-subtitle1 text-grey-8">
          <q-icon name="mic" class="q-mr-sm" />
          Presentación en vivo
        </div>
      </q-card-section>
      
      <q-card-section v-if="currentPerformance && currentSong">
        <div class="text-center">
          <!-- Presentación simplificada -->
          <div class="performance-live">
            <div class="text-h6 text-weight-bold text-positive q-mb-sm">
              🎤 {{ currentPerformance.name }}
            </div>
            <div class="text-body1 q-mb-sm">
              <q-icon name="music_note" color="primary" size="sm" class="q-mr-xs" />
                {{ currentSong.title }} - <span v-if="currentSong.artist">{{ currentSong.artist }}</span>
            </div>
            
          </div>
        </div>
      </q-card-section>
      
      <!-- Si hay alguien llamado pero no performing -->
      <q-card-section v-else-if="calledPerformance && calledSong">
        <div class="text-center">
          <!-- Presentación simplificada del llamado -->
          <div class="performance-called">
            <div class="text-h6 text-weight-bold text-orange q-mb-sm">
              <q-icon name="campaign" color="orange" size="sm" class="q-mb-sm" />
              {{ calledPerformance.name }}
            </div>
            <div class="text-body1 q-mb-sm">
              <q-icon name="music_note" color="orange" size="sm" class="q-mr-xs" />
                {{ calledSong.title }} - <span v-if="calledSong.artist">{{ calledSong.artist }}</span>
            </div>
          </div>
        </div>
      </q-card-section>
      
      <q-card-section v-else>
        <div class="text-center text-grey q-py-lg">
          <q-icon name="music_off" size="xl" />
          <div class="text-h6 q-mt-sm">No hay presentación en curso</div>
          <div>Las reacciones aparecerán cuando alguien esté cantando</div>
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Reacciones disponibles - siempre visibles -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section class="q-pa-sm bg-grey-1">
        <div class="text-subtitle1 text-grey-8">
          <q-icon name="favorite" class="q-mr-sm" />
          Envía tu reacción
        </div>
        <div class="text-caption text-grey-6">Apoya a los cantantes con tus emociones</div>
      </q-card-section>
      
      <q-card-section>
        <!-- Indicador de estado de sesión -->
        <div v-if="!user.isAuthenticated" class="q-mb-md">
          <q-banner class="bg-warning text-dark" rounded>
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            Sesión no detectada. Es posible que necesites 
            <q-btn flat color="primary" label="iniciar sesión" @click="redirectToHome" />
            para enviar reacciones.
          </q-banner>
        </div>
        
        <!-- Estado de conexión para debugging -->
        <div v-if="!isConnected" class="q-mb-md">
          <q-banner class="bg-negative text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="wifi_off" />
            </template>
            Sin conexión al sistema de reacciones. Verifica tu conexión a internet.
          </q-banner>
        </div>
        
        <!-- Botones de reacción -->
        <div class="row q-gutter-sm justify-start">
          <q-btn
            v-for="reaction in reactions"
            :key="reaction.emoji"
            :color="reaction.color"
            size="md"
            round
            @click="sendReaction(reaction.type)"
            :class="{ 'pulse': recentReaction === reaction.type }"
            :disable="!isConnected || !user.isAuthenticated"
            class="reaction-btn-circular"
            style="width: 45px; height: 45px; font-size: 18px;"
          >
            {{ reaction.emoji }}
          </q-btn>
        </div>
        
        <!-- Comentarios rápidos -->
        <div class="q-mt-lg">
          <div class="text-h6 q-mb-sm">💬 Comentarios rápidos</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="comment in quickComments"
              :key="comment"
              clickable
              color="secondary"
              text-color="white"
              @click="sendComment(comment)"
              :disable="!isConnected || !user.isAuthenticated"
            >
              {{ comment }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Botón para volver al home -->
    <div class="text-center q-mt-lg q-mb-xl">
      <q-btn
        color="primary"
        icon="home"
        label="Volver al inicio"
        size="lg"
        rounded
        @click="redirectToHome"
        class="home-btn"
      />
    </div>
    
    <!-- Floating Action Button para reacción rápida -->
    <q-page-sticky 
      v-if="(currentPerformance || calledPerformance) && user.isAuthenticated && isConnected" 
      position="bottom-right" 
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="favorite"
        color="red"
        @click="sendReaction('love')"
        class="pulse-heart"
      />
    </q-page-sticky>
    </div> <!-- Cierre del div v-else -->
  </q-page>
</template>

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

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reaction-btn-circular {
  transition: transform 0.2s;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  background-color: rgba(255, 255, 255, 0.9) !important;
}

.reaction-btn-circular:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}

.pulse {
  animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.performance-live {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #4caf50;
}

.performance-called {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #ff9800;
}

.home-btn {
  min-width: 160px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}
</style>