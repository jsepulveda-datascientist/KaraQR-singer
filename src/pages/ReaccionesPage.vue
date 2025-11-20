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
          <!-- Indicador de estado -->
          <q-chip color="positive" text-color="white" size="lg" class="q-mb-md">
            <q-icon name="mic" class="q-mr-sm" />
            🎤 CANTANDO AHORA
          </q-chip>
          
          <!-- Información de la canción -->
          <div class="text-h5 text-weight-bold q-mb-sm">
            {{ currentSong.title }}
          </div>
          <div class="text-subtitle1 text-grey-7 q-mb-sm" v-if="currentSong.artist">
            por {{ currentSong.artist }}
          </div>
          
          <!-- Nombre del cantante -->
          <q-chip color="primary" text-color="white" size="lg">
            🎤 {{ currentPerformance.name }}
          </q-chip>
          
          <!-- Indicador de YouTube -->
          <div v-if="hasYouTubeVideo" class="q-mt-sm">
            <q-chip color="red" text-color="white" icon="play_circle_filled">
              Video en reproducción
            </q-chip>
          </div>
        </div>
      </q-card-section>
      
      <!-- Si hay alguien llamado pero no performing -->
      <q-card-section v-else-if="calledPerformance && calledSong">
        <div class="text-center">
          <!-- Indicador de llamado -->
          <q-chip color="warning" text-color="white" size="lg" class="q-mb-md">
            <q-icon name="campaign" class="q-mr-sm" />
            ¡LLAMADO A ESCENA!
          </q-chip>
          
          <!-- Información de la canción -->
          <div class="text-h5 text-weight-bold q-mb-sm">
            {{ calledSong.title }}
          </div>
          <div class="text-subtitle1 text-grey-7 q-mb-sm" v-if="calledSong.artist">
            por {{ calledSong.artist }}
          </div>
          
          <!-- Nombre del cantante -->
          <q-chip color="orange" text-color="white" size="lg">
            🎤 {{ calledPerformance.name }}
          </q-chip>
          
          <div class="text-body2 q-mt-md text-grey-6">
            Esperando a que el cantante suba al escenario...
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
            :disable="!isConnected"
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
              :disable="!isConnected"
            >
              {{ comment }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Floating Action Button para reacción rápida -->
    <q-page-sticky 
      v-if="currentPerformance || calledPerformance" 
      position="bottom-right" 
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="favorite"
        color="red"
        @click="sendReaction('love')"
        class="pulse-heart"
        :disable="!isConnected"
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
const { tenantId, isValidTenant, requireTenant } = useTenant()
const { userName } = useUser()

// Estado reactivo
const isConnected = ref(false)
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

// Lifecycle hooks
onMounted(async () => {
  // Verificar estado de conexión inicial
  isConnected.value = reactionsService.isChannelConnected()
  console.log('🔗 Estado inicial de conexión:', isConnected.value)
  
  // Cargar performance actual
  await loadCurrentPerformance()
  
  // Configurar actualización periódica de la performance
  const performanceInterval = setInterval(loadCurrentPerformance, 5000) // Cada 5 segundos
  
  // Cleanup al desmontar
  onUnmounted(() => {
    clearInterval(performanceInterval)
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
</style>