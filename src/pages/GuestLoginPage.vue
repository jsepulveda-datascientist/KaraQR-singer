<template>
  <q-page class="flex flex-center login-page karaqr-page-bg">
    <!-- Mostrar prompt cuando no hay tenant configurado -->
    <NoTenantPrompt v-if="!isValidTenant" />
    
    <!-- Formulario de login cuando hay tenant válido -->
    <div v-else class="text-center full-width">
      <div class="text-h3 text-primary q-mb-md">
        🎤 KaraQR Singer
      </div>
      <div class="text-h6 q-mb-xl text-grey-7">
        Tu experiencia de karaoke está a punto de comenzar
      </div>
      
      <q-card class="login-card q-pa-lg" style="max-width: 450px; margin: 0 auto;">
        <q-card-section>
          <div class="text-h5 text-center q-mb-md text-primary">
            ✨ Crea tu perfil de cantante
          </div>
          <div class="text-center q-mb-xl text-grey-7">
            Elige tu nombre artístico y avatar para comenzar
          </div>
          
          <q-form @submit="handleLogin" class="q-gutter-lg">
            <!-- Nombre artístico -->
            <q-input
              v-model="loginForm.name"
              filled
              label="Tu nombre artístico"
              hint="¿Cómo quieres que te conozcan?"
              autofocus
              :rules="nameRules"
              counter
              maxlength="30"
            >
              <template v-slot:prepend>
                <q-icon name="mic" color="primary" />
              </template>
            </q-input>
            
            <!-- Selección de avatar -->
            <div class="avatar-selection">
              <div class="text-subtitle1 q-mb-md text-center text-grey-8">
                <q-icon name="face" class="q-mr-sm" />
                Elige tu avatar
                <span class="text-grey-5">(opcional)</span>
              </div>
              
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  v-for="(avatar, index) in avatarOptions"
                  :key="index"
                  round
                  size="xl"
                  :color="loginForm.avatar === avatar ? 'primary' : 'grey-3'"
                  :outline="loginForm.avatar !== avatar"
                  @click="selectAvatar(avatar)"
                  class="avatar-option"
                  :class="{ 'selected': loginForm.avatar === avatar }"
                >
                  <q-avatar size="50px">
                    <img :src="avatar" alt="Avatar" />
                  </q-avatar>
                  <q-tooltip v-if="loginForm.avatar !== avatar">
                    Seleccionar avatar
                  </q-tooltip>
                </q-btn>
              </div>
              
            </div>
            
            <!-- Botón de login -->
            <q-btn
              type="submit"
              color="primary"
              size="lg"
              label="Conectarse al Karaoke"
              class="full-width q-mt-xl btn-animated"
              :loading="loginLoading"
              :disable="!canSubmit"
              unelevated
              style="background: linear-gradient(135deg, #6366f1, #06b6d4) !important; color: white !important;"
            >
              <template v-slot:loading>
                <q-spinner-ios color="white" size="24px" />
              </template>
            </q-btn>
            
            <!-- Información de privacidad -->
            <div class="text-center q-mt-lg">
              <q-chip 
                color="grey-2" 
                text-color="grey-7" 
                icon="shield"
                dense
              >
                Tu información se mantiene local y privada
              </q-chip>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
      
      <!-- Información adicional -->
      <div class="q-mt-xl text-center" style="max-width: 600px; margin-left: auto; margin-right: auto;">
        <div class="text-h6 q-mb-md text-grey-7">¿Cómo funciona?</div>
        <div class="row q-gutter-md justify-center">
          <q-card flat bordered class="col-12 col-sm-auto" style="min-width: 150px;">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="qr_code_scanner" size="2em" color="primary" class="q-mb-sm" />
              <div class="text-subtitle2">1. Escanea</div>
              <div class="text-caption text-grey-6">Código QR del evento</div>
            </q-card-section>
          </q-card>
          
          <q-card flat bordered class="col-12 col-sm-auto" style="min-width: 150px;">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="person_add" size="2em" color="primary" class="q-mb-sm" />
              <div class="text-subtitle2">2. Regístrate</div>
              <div class="text-caption text-grey-6">Crea tu perfil</div>
            </q-card-section>
          </q-card>
          
          <q-card flat bordered class="col-12 col-sm-auto" style="min-width: 150px;">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="mic" size="2em" color="primary" class="q-mb-sm" />
              <div class="text-subtitle2">3. ¡Canta!</div>
              <div class="text-caption text-grey-6">Únete y disfruta</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import { authService } from '../services/authService'
import NoTenantPrompt from '../components/NoTenantPrompt.vue'

const router = useRouter()
const { tenantId, extractTenantFromRoute, navigateWithTenant, isValidTenant } = useTenant()
const { authenticate } = useUser()

// Estado del formulario
const loginForm = reactive({
  name: '',
  avatar: ''
})

const loginLoading = ref(false)

// Opciones de avatar
const avatarOptions = [
  'https://cdn.quasar.dev/img/avatar2.jpg',
  'https://cdn.quasar.dev/img/avatar3.jpg',
  'https://cdn.quasar.dev/img/avatar4.jpg',
  'https://cdn.quasar.dev/img/avatar5.jpg',
  'https://cdn.quasar.dev/img/avatar6.jpg',
  'https://cdn.quasar.dev/img/boy-avatar.png',
  'https://cdn.quasar.dev/img/avatar.png'
]

// Avatar por defecto si no se selecciona ninguno
const defaultAvatar = 'https://cdn.quasar.dev/img/avatar.png'

// Validaciones
const nameRules = [
  (val: string) => !!val || 'El nombre artístico es requerido',
  (val: string) => val.length >= 2 || 'Debe tener al menos 2 caracteres',
  (val: string) => val.length <= 30 || 'Máximo 30 caracteres'
]

const canSubmit = computed(() => {
  return loginForm.name.trim().length >= 2 && 
         loginForm.name.length <= 30
  // Ya no se requiere avatar
})

function selectAvatar(avatar: string) {
  loginForm.avatar = avatar
}

async function handleLogin() {
  // Validar nombre
  const nameValidation = nameRules.every(rule => rule(loginForm.name) === true)
  if (!nameValidation) return
  
  loginLoading.value = true
  
  try {
    // Simular proceso de login
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Usar avatar seleccionado o el por defecto si no hay selección
    const avatarToUse = loginForm.avatar || defaultAvatar
    
    // Autenticar usuario (ahora incluye conexión automática a reacciones)
    await authenticate(loginForm.name.trim(), avatarToUse, tenantId.value)
    
    // Redirigir al home después del login exitoso
    navigateWithTenant('/')
    
  } catch (error) {
    console.error('Error en el login:', error)
    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    loginLoading.value = false
  }
}

// Verificar tenant al montar el componente
onMounted(() => {
  extractTenantFromRoute()
  console.log('🔐 Login page - Tenant:', tenantId.value)
})
</script>

<style scoped>
.login-page {
  /* Background handled by global karaqr-page-bg system */
  min-height: 100vh;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #1e293b !important;
  transition: all 0.3s ease;
}

.login-card:hover {
  background: rgba(255, 255, 255, 0.98) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
}

.avatar-selection {
  padding: 16px 0;
}

.avatar-option {
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
}

.full-width {
  width: 100%;
}
</style>