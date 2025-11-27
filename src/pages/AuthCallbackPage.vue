<template>
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

const statusMessage = ref('Completando autenticación...')
const subMessage = ref('Un momento por favor')

onMounted(async () => {
  try {
    console.log('🔐 AuthCallback: Procesando callback de OAuth...')
    
    // Esperar un momento para que Supabase procese la sesión
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Obtener el usuario autenticado
    const user = await authService.getCurrentUser()
    
    if (user) {
      console.log('✅ Usuario OAuth autenticado:', user)
      
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
      subMessage.value = 'Redirigiendo al login...'
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      navigateWithTenant('/login')
    }
    
  } catch (error) {
    console.error('❌ Error en callback de autenticación:', error)
    statusMessage.value = 'Error en autenticación'
    subMessage.value = 'Redirigiendo al login...'
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    navigateWithTenant('/login')
  }
})
</script>

<style scoped>
/* Estilos heredados del sistema karaqr-page-bg */
</style>
