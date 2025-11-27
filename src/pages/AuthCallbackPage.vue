<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
  <q-page class="flex flex-center karaqr-page-bg">
    <div class="text-center">
      <q-spinner-ios 
        color="primary" 
        size="80px"
        class="q-mb-xl"
      />
      <div class="text-h5 text-primary q-mb-md">
        {{ statusMessage }}
      </div>
      <div class="text-body1 text-grey-7">
        {{ subMessage }}
      </div>
    </div>
  </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { useUser } from '../composables/useUser'
import { useTenant } from '../composables/useTenant'

const router = useRouter()
const { authenticateWithOAuth } = useUser()
const { tenantId, navigateWithTenant } = useTenant()

const statusMessage = ref('Procesando autenticación con Google...')
const subMessage = ref('Esto puede tomar unos segundos')

onMounted(async () => {
  try {
    console.log('🔐 AuthCallback: Procesando callback de OAuth...')
    
    // Esperar más tiempo para que Supabase procese la sesión completa
    // El hash fragment de OAuth necesita ser procesado por Supabase
    statusMessage.value = 'Verificando sesión...'
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Intentar obtener el usuario con reintentos
    let user = null
    let attempts = 0
    const maxAttempts = 5
    
    while (!user && attempts < maxAttempts) {
      attempts++
      console.log(`🔄 Intento ${attempts}/${maxAttempts} de obtener usuario...`)
      statusMessage.value = `Verificando credenciales... (${attempts}/${maxAttempts})`
      
      try {
        user = await authService.getCurrentUser()
        
        if (user) {
          console.log('✅ Usuario OAuth autenticado:', user)
          break
        }
      } catch (error) {
        console.warn(`⚠️ Intento ${attempts} falló:`, error)
      }
      
      // Esperar antes del siguiente intento
      if (!user && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    if (user) {
      statusMessage.value = `¡Bienvenido, ${user.name}!`
      subMessage.value = 'Configurando tu sesión de karaoke...'
      
      // Autenticar con el composable useUser (incluye reconexión automática)
      await authenticateWithOAuth(user, tenantId.value)
      
      // Pequeño delay para mostrar el mensaje
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirigir al home
      statusMessage.value = '¡Todo listo!'
      subMessage.value = 'Redirigiendo...'
      
      await new Promise(resolve => setTimeout(resolve, 500))
      navigateWithTenant('/')
      
    } else {
      console.error('❌ No se pudo obtener usuario después del OAuth')
      statusMessage.value = 'Error en autenticación'
      subMessage.value = 'No se pudo completar el inicio de sesión. Redirigiendo...'
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      navigateWithTenant('/login')
    }
    
  } catch (error) {
    console.error('❌ Error en callback de autenticación:', error)
    statusMessage.value = 'Error en autenticación'
    subMessage.value = 'Ocurrió un error. Redirigiendo al login...'
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    navigateWithTenant('/login')
  }
})
</script>

<style scoped>
/* Estilos heredados del sistema karaqr-page-bg */
</style>
