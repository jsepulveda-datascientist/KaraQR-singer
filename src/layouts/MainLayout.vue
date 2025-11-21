<template>
  <q-layout view="lHh Lpr lff">
    <q-header v-if="!isLoginPage" elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          KaraQR Singer
        </q-toolbar-title>

        <!-- Área de usuario -->
        <div class="row items-center q-gutter-sm">
          <q-btn
            v-if="!user.isAuthenticated"
            flat
            icon="person_add"
            label="Crear perfil"
            @click="redirectToHome"
          />
          
          <div v-else class="row items-center q-gutter-sm user-info">
            <div class="text-right">
              <div class="text-subtitle2">{{ user.name }}</div>
              <div class="text-caption text-grey-4">Cantante</div>
            </div>
            <q-btn
              ref="avatarButton"
              flat
              round
              class="avatar-btn"
            >
              <q-avatar size="32px">
                <img v-if="user.avatar" :src="user.avatar" alt="Avatar">
                <q-icon v-else name="person" size="20px" />
              </q-avatar>
              
              <q-menu
                anchor="bottom right"
                self="top right"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-list style="min-width: 180px">
                  <q-item clickable v-close-popup @click="logout">
                    <q-item-section avatar>
                      <q-icon name="logout" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-negative">Cerrar sesión</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="!isLoginPage"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Navegación
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer con nombre del tenant y estado de conexión -->
    <q-footer v-if="!isLoginPage" elevated class="bg-primary text-white">
      <q-toolbar>
        <div class="row items-center justify-between full-width">
          <div class="text-body2">
            🎤 Basement415
          </div>
          
          <div class="text-center">
            <div class="text-caption">Powered by KaraQR</div>
          </div>
          
          <div class="row items-center q-gutter-xs">
            <q-icon 
              :name="isConnected ? 'wifi' : 'wifi_off'" 
              :color="isConnected ? 'light-green' : 'red'"
              size="sm"
            />
            <span class="text-caption">
              {{ isConnected ? 'En línea' : 'Desconectado' }}
            </span>
          </div>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import { reactionsService } from '../services/reactionsService'
import EssentialLink, { EssentialLinkProps } from '../components/EssentialLink.vue'

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

<style scoped>
.q-toolbar {
  backdrop-filter: blur(10px);
}

.user-info {
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
}

.avatar-btn {
  transition: transform 0.2s ease;
}

.avatar-btn:hover {
  transform: scale(1.05);
}

/* Animación para el menú de avatar */
.q-menu .q-list {
  border-radius: 12px;
}
</style>