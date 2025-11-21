<template>
  <q-page class="karaqr-page-bg">
    <!-- Contenido principal -->
    
    <!-- Mostrar prompt cuando no hay tenant configurado -->
    <NoTenantPrompt v-if="!isValidTenant" />
    
    <!-- Contenido normal cuando hay tenant válido -->
    <div v-else class="page-content">
    <!-- Pantalla de confirmación -->
    <div v-if="showConfirmation" class="text-center confirmation-screen">
      <div class="success-header q-mb-md">
        <div class="success-icon">✓</div>
        <div class="text-h4 text-white">¡Tu solicitud fue enviada!</div>
        <div class="text-subtitle1 text-white opacity-80">Prepárate para brillar en el escenario</div>
      </div>
      
      <q-card class="confirmation-card shimmer-card" elevated>
        <q-card-section class="card-header">
          <div class="text-h6 text-center q-mb-md">🎵 Tu selección musical</div>
        </q-card-section>
        
        <q-card-section class="song-details">
          <q-list class="selection-list">
            <q-item class="selection-item interactive-element">
              <q-item-section avatar>
                <div class="status-indicator online">
                  <q-icon name="person" color="primary" size="md" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-primary">Cantante</q-item-label>
                <q-item-label caption class="text-subtitle2">{{ submittedSong?.name }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item class="selection-item interactive-element">
              <q-item-section avatar>
                <div class="status-indicator singing">
                  <q-icon name="music_note" color="secondary" size="md" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-secondary">Canción</q-item-label>
                <q-item-label caption class="text-subtitle2">{{ submittedSong?.title }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item class="selection-item interactive-element">
              <q-item-section avatar>
                <div class="status-indicator online">
                  <q-icon name="album" color="accent" size="md" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-accent">Artista</q-item-label>
                <q-item-label caption class="text-subtitle2">{{ submittedSong?.artist }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item v-if="submittedSong?.youtubeLink" class="selection-item interactive-element">
              <q-item-section avatar>
                <div class="status-indicator singing">
                  <q-icon name="smart_display" color="red" size="md" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-red">Video de YouTube</q-item-label>
                <q-item-label caption class="text-blue">
                  <a :href="submittedSong?.youtubeLink" target="_blank" class="youtube-link">
                    {{ submittedSong?.youtubeLink }}
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          
          <div class="action-buttons q-mt-xl">
            <q-btn
              color="primary"
              size="lg"
              icon="mic"
              label="Anotar otra canción"
              class="btn-animated full-width q-mb-md glow-effect"
              @click="resetForm"
            />
            <q-btn
              color="grey-6"
              size="md"
              label="Volver al inicio"
              class="btn-animated full-width"
              outline
              @click="navigateWithTenant('/')"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Formulario original -->
    <div v-else class="form-container">
      <div class="page-title q-mb-xl">
        <div class="title-content">
          <q-icon name="mic" class="title-icon-inline" />
          <div class="title-text">
            <div class="text-h4 gradient-text">
              Elige tu karaoke favorito
            </div>
            <div class="text-subtitle1 text-grey-6">
              Completa el formulario y únete a la diversión
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección de anotación rápida -->
      <q-card class="form-card shimmer-card" elevated>
        <q-card-section class="form-section">
          <q-form @submit.prevent="addSong" class="song-form">
            <div class="form-field">
              <q-input
                v-model="newSong.singer"
                filled
                label="Tu nombre artístico"
                hint="Tu nombre registrado en el sistema"
                :rules="[val => !!val || 'El nombre es requerido']"
                readonly
                :disable="true"
                class="interactive-element"
              >
                <template v-slot:prepend>
                  <q-icon name="person" class="field-icon" />
                </template>
              </q-input>
            </div>
            
            <div class="form-field">
              <q-input
                v-model="newSong.title"
                filled
                label="Título de la canción"
                hint="El nombre de la canción que quieres interpretar"
                :rules="[val => !!val || 'El título es requerido']"
                class="interactive-element"
              >
                <template v-slot:prepend>
                  <q-icon name="music_note" class="field-icon" />
                </template>
              </q-input>
            </div>
            
            <div class="form-field">
              <q-input
                v-model="newSong.artist"
                filled
                label="Artista original"
                hint="Intérprete original de la canción"
                :rules="[val => !!val || 'El artista es requerido']"
                class="interactive-element"
              >
                <template v-slot:prepend>
                  <q-icon name="album" class="field-icon" />
                </template>
              </q-input>
            </div>
            
            <div class="form-field">
              <q-input
                v-model="newSong.youtubeLink"
                filled
                label="Link de YouTube (opcional)"
                hint="Comparte tu versión karaoke preferida"
                type="url"
                class="interactive-element"
              >
                <template v-slot:prepend>
                  <q-icon name="smart_display" class="field-icon" />
                </template>
              </q-input>
            </div>
            
            <div class="submit-section q-mt-xl">
              <q-btn
                type="submit"
                color="primary"
                size="xl"
                icon="mic"
                label="Anotarme en la cola"
                class="btn-animated full-width submit-btn glow-effect"
                :loading="loading"
                :disable="loading"
              >
                <template v-slot:loading>
                  <q-spinner-ios color="white" size="24px" />
                </template>
              </q-btn>
            </div>
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

<style scoped>
/* Estilos específicos para AnotarsePage */
.enhanced-page {
  /* Background handled by global karaqr-page-bg system */
  min-height: 100vh;
  position: relative;
}

/* Padding principal unificado */
.karaqr-page-bg {
  padding: 2rem 1rem;
}

.page-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

/* Pantalla de confirmación */
.confirmation-screen {
  animation: page-slide-in 0.6s ease-out;
}

.success-header {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.success-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: inline-block;
  animation: success-bounce 0.8s ease-out;
}

@keyframes success-bounce {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(-10deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.confirmation-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1);
}

.card-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05));
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.selection-list {
  padding: 1rem 0;
}

.selection-item {
  background: rgba(248, 250, 252, 0.8);
  margin: 8px 0;
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

.selection-item:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(4px);
}

.youtube-link {
  color: #06b6d4;
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;
}

.youtube-link:hover {
  color: #0891b2;
  text-decoration: underline;
}

/* Formulario principal */
.form-container {
  animation: page-slide-in 0.5s ease-out;
}

.page-title {
  text-align: left;
  position: relative;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: flex-start;
}

.title-icon-inline {
  font-size: 3rem !important;
  color: #6366f1 !important;
  flex-shrink: 0;
}

.title-text {
  flex: 1;
}

.title-text .text-h4 {
  margin-bottom: 0.5rem;
  font-weight: 700;
}

/* Responsivo para móviles */
@media (max-width: 600px) {
  .title-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .title-icon-inline {
    font-size: 2.5rem !important;
  }
}

/* Mantener compatibilidad con ícono antiguo */
.title-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
  animation: singing-pulse 3s ease-in-out infinite;
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 80px rgba(99, 102, 241, 0.15);
}

.form-section {
  padding: 2rem;
}

.song-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  position: relative;
}

.field-icon {
  color: #6366f1;
  animation: pulse-music 3s ease-in-out infinite;
}

.form-field .q-field {
  transition: all 0.3s ease;
}

.form-field .q-field:focus-within {
  transform: translateY(-2px);
}

.submit-section {
  padding-top: 1rem;
}

.submit-btn {
  font-size: 1.1rem;
  font-weight: 700;
  height: 60px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border: none;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
}

.submit-btn:active {
  transform: translateY(0) scale(0.98);
}

.action-buttons .q-btn {
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-buttons .q-btn:hover {
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .page-content {
    max-width: 100%;
    padding: 0 8px;
  }
  
  .success-header {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .submit-btn {
    height: 56px;
    font-size: 1rem;
  }
  
  .title-icon {
    font-size: 3rem;
  }
}

/* Animación para el ícono del título */
@keyframes singing-pulse {
  0%, 100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
  }
  50% { 
    transform: scale(1.1);
    filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.5));
  }
}
</style>