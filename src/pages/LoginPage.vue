<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center login-page karaqr-page-bg">
        <!-- Mostrar prompt cuando no hay tenant configurado -->
        <NoTenantPrompt v-if="!isValidTenant" />
        
        <!-- Opciones de login cuando hay tenant válido -->
        <div v-else class="text-center full-width">
      <div class="text-h3 text-primary q-mb-md">
        🎤 KaraQR Singer
      </div>
      <div class="text-h6 q-mb-xl text-grey-7">
        ¡Bienvenido! Elige cómo quieres continuar
      </div>
      
      <q-card class="login-card q-pa-lg" style="max-width: 500px; margin: 0 auto;">
        <q-card-section>
          <div class="text-h5 text-center q-mb-md text-primary">
            ✨ Iniciar Sesión
          </div>
          <div class="text-center q-mb-xl text-grey-7">
            Selecciona tu método de autenticación preferido
          </div>
          
          <div class="q-gutter-lg">
            <!-- Botón Google Login -->
            <q-btn
              size="xl"
              unelevated
              class="full-width google-btn"
              @click="handleGoogleLogin"
              :loading="googleLoading"
            >
              <div class="row items-center q-gutter-md full-width justify-center">
                <q-avatar size="32px">
                  <img src="https://www.google.com/favicon.ico" alt="Google" />
                </q-avatar>
                <span class="text-h6">Continuar con Google</span>
              </div>
              <template v-slot:loading>
                <q-spinner-ios color="grey-8" size="24px" />
              </template>
            </q-btn>
            
            <!-- Divider -->
            <div class="row items-center q-my-lg">
              <q-separator class="col" />
              <div class="col-auto q-px-md text-grey-6">o</div>
              <q-separator class="col" />
            </div>
            
            <!-- Botón Guest Login -->
            <q-btn
              size="xl"
              color="primary"
              unelevated
              class="full-width guest-btn"
              @click="handleGuestLogin"
              :loading="guestLoading"
              style="background: linear-gradient(135deg, #6366f1, #06b6d4) !important; color: white !important;"
            >
              <div class="row items-center q-gutter-md full-width justify-center">
                <q-icon name="person" size="32px" />
                <span class="text-h6">Continuar como Invitado</span>
              </div>
              <template v-slot:loading>
                <q-spinner-ios color="white" size="24px" />
              </template>
            </q-btn>
          </div>
          
          <!-- Información de privacidad -->
          <div class="text-center q-mt-xl">
            <q-chip 
              color="grey-2" 
              text-color="grey-7" 
              icon="shield"
              dense
            >
              Tu información se mantiene segura y privada
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
      
      <!-- Información adicional -->
      <div class="q-mt-xl text-center" style="max-width: 600px; margin-left: auto; margin-right: auto;">
        <div class="text-h6 q-mb-md text-grey-7">¿Cómo funciona?</div>
        <div class="row q-gutter-md justify-center">
          <q-card flat bordered class="col-12 col-sm-auto info-card" style="min-width: 150px;">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="qr_code_scanner" size="2em" color="primary" class="q-mb-sm" />
              <div class="text-subtitle2">1. Escanea</div>
              <div class="text-caption text-grey-6">Código QR del evento</div>
            </q-card-section>
          </q-card>
          
          <q-card flat bordered class="col-12 col-sm-auto info-card" style="min-width: 150px;">
            <q-card-section class="text-center q-pa-md">
              <q-icon name="login" size="2em" color="primary" class="q-mb-sm" />
              <div class="text-subtitle2">2. Inicia Sesión</div>
              <div class="text-caption text-grey-6">Con Google o como invitado</div>
            </q-card-section>
          </q-card>
          
          <q-card flat bordered class="col-12 col-sm-auto info-card" style="min-width: 150px;">
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
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTenant } from '../composables/useTenant'
import { authService } from '../services/authService'
import NoTenantPrompt from '../components/NoTenantPrompt.vue'

const router = useRouter()
const { tenantId, extractTenantFromRoute, navigateWithTenant, isValidTenant } = useTenant()

const googleLoading = ref(false)
const guestLoading = ref(false)

async function handleGoogleLogin() {
  googleLoading.value = true
  
  try {
    console.log('🔐 Iniciando login con Google...')
    
    const result = await authService.loginWithGoogle()
    
    if (!result.success) {
      console.error('❌ Error en login con Google:', result.error)
      // TODO: Mostrar mensaje de error al usuario con Quasar Notify
      alert('Error al iniciar sesión con Google. Por favor, intenta nuevamente.')
    }
    
    // Si es exitoso, Google redirigirá automáticamente
    // No necesitamos hacer nada más aquí
    
  } catch (error) {
    console.error('❌ Excepción en Google login:', error)
    alert('Error inesperado. Por favor, intenta nuevamente.')
  } finally {
    // Solo resetear loading si no hubo redirección
    setTimeout(() => {
      googleLoading.value = false
    }, 1000)
  }
}

function handleGuestLogin() {
  guestLoading.value = true
  
  try {
    // Navegar a la página de guest login
    navigateWithTenant('/guest-login')
  } catch (error) {
    console.error('Error navegando a guest login:', error)
  } finally {
    guestLoading.value = false
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

.google-btn {
  background: white !important;
  color: #1e293b !important;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  padding: 16px !important;
  font-weight: 600;
}

.google-btn:hover {
  background: #f9fafb !important;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.guest-btn {
  padding: 16px !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.guest-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.info-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.98) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.full-width {
  width: 100%;
}
</style>
