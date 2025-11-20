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
              <div class="text-caption text-grey-4">{{ user.role }}</div>
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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import { reactionsService } from '../services/reactionsService'
import EssentialLink, { EssentialLinkProps } from '../components/EssentialLink.vue'

const router = useRouter()
const route = useRoute()
const { tenantId, navigateWithTenant } = useTenant()
const { logout: userLogout } = useUser()

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

// Estado de usuario sincronizado con localStorage
const user = reactive({
  isAuthenticated: false,
  name: '',
  avatar: '',
  role: 'Cantante'
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function logout() {
  try {
    // Usar el logout del composable que maneja la desconexión automática
    await userLogout()
    
    // Limpiar estado local del usuario
    user.isAuthenticated = false
    user.name = ''
    user.avatar = ''
    
    // Redirigir al login manteniendo el tenant
    navigateWithTenant('/login')
  } catch (error) {
    console.error('Error durante logout:', error)
    // Forzar logout local aunque haya error
    user.isAuthenticated = false
    user.name = ''
    user.avatar = ''
    navigateWithTenant('/login')
  }
}

function redirectToHome() {
  navigateWithTenant('/')
}

// Sincronizar estado del usuario con localStorage
function loadUserFromStorage() {
  const savedUser = localStorage.getItem('karaqr-user')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      user.isAuthenticated = true
      user.name = userData.name || ''
      user.avatar = userData.avatar || ''
    } catch (error) {
      console.error('Error loading user data:', error)
      localStorage.removeItem('karaqr-user')
    }
  }
}

// Cargar usuario al montar el componente
onMounted(() => {
  loadUserFromStorage()
  
  // Escuchar cambios en localStorage (para sincronizar entre componentes)
  window.addEventListener('storage', loadUserFromStorage)
  
  // Iniciar monitoreo de conexión
  checkConnectionStatus()
  connectionCheckInterval = setInterval(checkConnectionStatus, 2000) // Verificar cada 2 segundos
})

// Limpiar listener al desmontar
onUnmounted(() => {
  window.removeEventListener('storage', loadUserFromStorage)
  
  // Limpiar intervalo de verificación de conexión
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval)
  }
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