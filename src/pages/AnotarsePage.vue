<template>
  <q-page class="q-pa-md">
    <!-- Mostrar prompt cuando no hay tenant configurado -->
    <NoTenantPrompt v-if="!isValidTenant" />
    
    <!-- Contenido normal cuando hay tenant válido -->
    <div v-else>
    <!-- Pantalla de confirmación -->
    <div v-if="showConfirmation" class="text-center">
      <div class="text-h4 q-mb-md text-green">
        ✓ ¡Tu solicitud fue enviada!
      </div>
      
      <q-card class="q-mb-md" elevated>
        <q-card-section class="bg-green-1">
          <div class="text-h6 text-center q-mb-md">🎵 Tu selección</div>
        </q-card-section>
        
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Cantante</q-item-label>
                <q-item-label caption>{{ submittedSong?.name }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-icon name="music_note" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Canción</q-item-label>
                <q-item-label caption>{{ submittedSong?.title }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section avatar>
                <q-icon name="album" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Artista</q-item-label>
                <q-item-label caption>{{ submittedSong?.artist }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="submittedSong?.youtubeLink">
              <q-item-section avatar>
                <q-icon name="smart_display" color="red" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Link de YouTube</q-item-label>
                <q-item-label caption class="text-blue">
                  <a :href="submittedSong?.youtubeLink" target="_blank" class="text-blue">
                    {{ submittedSong?.youtubeLink }}
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div class="q-mt-lg">
            <q-btn
              color="primary"
              size="lg"
              label="🎵 Anotar otra canción"
              class="full-width q-mb-sm"
              @click="resetForm"
            />
            <q-btn
              color="grey"
              size="md"
              label="Volver al inicio"
              class="full-width"
              outline
              @click="navigateWithTenant('/')"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Formulario original -->
    <div v-else>
      <div class="text-h4 q-mb-md text-center">
        Elije tu karaoke favorito
      </div>
      
      <!-- Sección de anotación rápida -->
      <q-card class="q-mb-md" elevated>
        <q-card-section>
          <q-form @submit.prevent="addSong" class="q-gutter-md">
            <q-input
              v-model="newSong.singer"
              filled
              label="Tu nombre"
              hint="Tu nombre artístico registrado"
              :rules="[val => !!val || 'El nombre es requerido']"
              readonly
              :disable="true"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
            
            <q-input
              v-model="newSong.title"
              filled
              label="Título de la canción"
              hint="El nombre de la canción que quieres cantar"
              :rules="[val => !!val || 'El título es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="music_note" />
              </template>
            </q-input>
            
            <q-input
              v-model="newSong.artist"
              filled
              label="Artista"
              hint="Intérprete original de la canción"
              :rules="[val => !!val || 'El artista es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="album" />
              </template>
            </q-input>
            
            <q-input
              v-model="newSong.youtubeLink"
              filled
              label="Link de YouTube (opcional)"
              hint="Elige tu versión de karaoke preferida"
              type="url"
            >
              <template v-slot:prepend>
                <q-icon name="smart_display" />
              </template>
            </q-input>
            
            <q-btn
              type="submit"
              color="primary"
              size="lg"
              label="🎤 Anotarme"
              class="full-width"
              :loading="loading"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
    </div> <!-- Cierre del div v-else -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { queueService } from '../services/queueService'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import type { SongRequest } from '../types/queue'
import NoTenantPrompt from '../components/NoTenantPrompt.vue'
import config from '../config'

const $q = useQuasar()
const { tenantId, extractTenantFromRoute, navigateWithTenant, isValidTenant, requireTenant } = useTenant()
const { userName, user, isAuthenticated } = useUser()
const loading = ref(false)
const showConfirmation = ref(false)
const submittedSong = ref<SongRequest | null>(null)

const newSong = ref({
  title: '',
  artist: '',
  singer: '',
  youtubeLink: ''
})

// Cargar el nombre del usuario desde el composable
onMounted(() => {
  // Extraer tenant de la URL
  extractTenantFromRoute()
  console.log('🏠 Tenant configurado en anotarse:', tenantId.value)
  console.log('🏠 isValidTenant:', isValidTenant.value)
  
  // Usar el nombre del usuario autenticado
  newSong.value.singer = userName.value
  console.log('👤 Usuario cargado:', userName.value)
  console.log('👤 Usuario autenticado:', isAuthenticated.value)
})

async function addSong() {
  console.log('🎯 addSong() llamada')
  console.log('🎯 tenantId.value:', tenantId.value)
  console.log('🎯 isValidTenant.value:', isValidTenant.value)
  
  // Validar que existe tenant antes de enviar
  if (!requireTenant()) {
    console.log('❌ Tenant requerido falló')
    
    $q.notify({
      type: 'warning',
      message: 'No hay local configurado',
      caption: 'Escanea el QR del establecimiento primero',
      icon: 'qr_code_scanner',
      position: 'top'
    })
    return
  }

  console.log('✅ Tenant validado, procediendo...')
  loading.value = true
  
  try {
    console.log('🎵 Enviando canción para tenant:', tenantId.value)
    
    // Preparar datos de la solicitud
    const songRequest: SongRequest = {
      name: newSong.value.singer,
      title: newSong.value.title,
      artist: newSong.value.artist,
      youtubeLink: newSong.value.youtubeLink || undefined
    }
    
    console.log('🎵 Enviando solicitud de canción:', songRequest)
    
    // Enviar a la API real
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
    
    // Mostrar pantalla de confirmación
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
  } finally {
    loading.value = false
  }
}

function resetForm() {
  // Limpiar formulario y volver a la pantalla principal
  showConfirmation.value = false
  submittedSong.value = null
  
  // Mantener el nombre del usuario al limpiar el formulario usando el composable
  newSong.value = {
    title: '',
    artist: '',
    singer: userName.value,
    youtubeLink: ''
  }
}


</script>