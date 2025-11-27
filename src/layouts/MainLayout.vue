<template src="../templates/layouts/MainLayout.html"></template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import { reactionsService } from '../services/reactionsService'
import EssentialLink from '../components/EssentialLink.vue'
import type { EssentialLinkProps } from '../types/components'

const router = useRouter()
const route = useRoute()
const { tenantId, navigateWithTenant } = useTenant()
const { user, logout: userLogout, loadUserFromStorage } = useUser()

// Detectar si estamos en la página de login
const isLoginPage = computed(() => route.name === 'login')

// Estado de conexión a reacciones
const isConnected = ref(false)

// Función para verificar estado de conexión periódicamente
const checkConnectionStatus = () => {
  isConnected.value = reactionsService.isChannelConnected()
}

// Intervalo para verificar conexión
let connectionCheckInterval: any = null
// Intervalo para verificar sesión
let sessionCheckInterval: any = null

const essentialLinks: EssentialLinkProps[] = [
  {
    title: 'Inicio',
    caption: 'Página principal',
    icon: 'home',
    link: '/'
  },
  {
    title: 'Anotarse para cantar',
    caption: 'Únete a la cola de canciones',
    icon: 'mic',
    link: '/anotarse'
  },
  {
    title: 'Reacciones',
    caption: 'Reacciona a las presentaciones',
    icon: 'favorite',
    link: '/reacciones'
  },
  {
    title: 'Mis Favoritos',
    caption: 'Gestiona tus temas favoritos',
    icon: 'star',
    link: '/favoritos'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function logout() {
  try {
    console.log('🔐 Iniciando logout desde MainLayout')
    // Usar el logout del composable que maneja la desconexión automática
    await userLogout()
    
    // Redirigir al login manteniendo el tenant
    navigateWithTenant('/login')
    console.log('✅ Logout completado y redirigido')
  } catch (error) {
    console.error('❌ Error durante logout:', error)
    // Forzar navegación aunque haya error
    navigateWithTenant('/login')
  }
}

function redirectToHome() {
  navigateWithTenant('/')
}

/**
 * Verificar y reforzar el estado de la sesión
 */
function checkSessionStatus() {
  try {
    // Forzar recarga desde localStorage
    loadUserFromStorage()
    console.log('🔄 Estado de sesión verificado:', {
      isAuthenticated: user.value.isAuthenticated,
      name: user.value.name,
      route: route.path
    })
  } catch (error) {
    console.error('❌ Error al verificar estado de sesión:', error)
  }
}

/**
 * Manejar eventos de autenticación personalizados
 */
function handleAuthenticationEvents() {
  // Escuchar evento de autenticación exitosa
  window.addEventListener('userAuthenticated', (event: any) => {
    console.log('✅ Usuario autenticado (evento):', event.detail)
    // El composable ya maneja el estado, solo logueamos
  })
  
  // Escuchar evento de logout
  window.addEventListener('userLogout', () => {
    console.log('👋 Usuario deslogueado (evento)')
    // El composable ya maneja el estado, solo logueamos
  })
  
  // Escuchar evento de actualización de usuario
  window.addEventListener('userUpdated', (event: any) => {
    console.log('🔄 Usuario actualizado (evento):', event.detail)
    // El composable ya maneja el estado, solo logueamos
  })
}

/**
 * Limpiar listeners de eventos
 */
function removeAuthenticationEventListeners() {
  window.removeEventListener('userAuthenticated', handleAuthenticationEvents)
  window.removeEventListener('userLogout', handleAuthenticationEvents)
  window.removeEventListener('userUpdated', handleAuthenticationEvents)
}

// Watch para detectar cambios en el estado del usuario y loguear
watch(
  () => user.value,
  (newUser, oldUser) => {
    if (newUser.isAuthenticated !== oldUser?.isAuthenticated) {
      console.log('🔐 Estado de autenticación cambió:', {
        from: oldUser?.isAuthenticated,
        to: newUser.isAuthenticated,
        user: newUser.name,
        route: route.path
      })
    }
  },
  { deep: true }
)

// Cargar usuario al montar el componente
onMounted(() => {
  console.log('🚀 MainLayout montado, inicializando sistemas...')
  
  // Cargar estado inicial del usuario
  loadUserFromStorage()
  console.log('👤 Estado inicial del usuario:', {
    isAuthenticated: user.value.isAuthenticated,
    name: user.value.name
  })
  
  // Configurar eventos de autenticación
  handleAuthenticationEvents()
  
  // Escuchar cambios en localStorage (para sincronizar entre pestañas)
  window.addEventListener('storage', (e) => {
    if (e.key === 'karaqr-user') {
      console.log('🔄 localStorage cambió, recargando usuario...')
      loadUserFromStorage()
    }
  })
  
  // Iniciar monitoreo de conexión
  checkConnectionStatus()
  connectionCheckInterval = setInterval(checkConnectionStatus, 2000)
  
  // Iniciar verificación periódica de sesión (cada 10 segundos)
  sessionCheckInterval = setInterval(checkSessionStatus, 10000)
  
  console.log('✅ Todos los sistemas iniciados')
})

// Limpiar listeners al desmontar
onUnmounted(() => {
  console.log('🔄 Limpiando MainLayout...')
  
  // Remover listeners de eventos personalizados
  removeAuthenticationEventListeners()
  
  // Remover listener de storage
  window.removeEventListener('storage', loadUserFromStorage)
  
  // Limpiar intervalos
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval)
  }
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval)
  }
  
  console.log('✅ MainLayout limpiado')
})
</script>

<style src="../styles/layouts/MainLayout.scss" scoped></style>