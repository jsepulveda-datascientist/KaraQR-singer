import { ref, reactive, computed, watch } from 'vue'
import { reactionsService } from '../services/reactionsService'

interface User {
  name: string
  avatar: string
  isAuthenticated: boolean
}

// Estado global del usuario
const userState = reactive<User>({
  name: '',
  avatar: '',
  isAuthenticated: false
})

/**
 * Composable para manejar el estado del usuario autenticado
 * Gestiona la persistencia en localStorage y la sincronización
 */
export function useUser() {
  
  /**
   * Cargar datos del usuario desde localStorage
   */
  const loadUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('karaqr-user')
      if (userData) {
        const user = JSON.parse(userData)
        if (user.name && user.avatar) {
          userState.name = user.name
          userState.avatar = user.avatar
          userState.isAuthenticated = true
          console.log('👤 Usuario cargado desde localStorage:', user.name)
          return true
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario desde localStorage:', error)
      localStorage.removeItem('karaqr-user')
    }
    
    console.log('👤 No se encontró usuario válido en localStorage')
    return false
  }

  /**
   * Guardar datos del usuario en localStorage
   */
  const saveUserToStorage = () => {
    try {
      if (userState.name && userState.avatar) {
        const userData = {
          name: userState.name,
          avatar: userState.avatar
        }
        localStorage.setItem('karaqr-user', JSON.stringify(userData))
        console.log('💾 Usuario guardado en localStorage:', userState.name)
      }
    } catch (error) {
      console.error('Error al guardar usuario en localStorage:', error)
    }
  }

  /**
   * Autenticar usuario con nombre y avatar
   */
  const authenticate = async (name: string, avatar: string, tenantId?: string) => {
    userState.name = name.trim()
    userState.avatar = avatar
    userState.isAuthenticated = true
    
    saveUserToStorage()
    
    // Conectar al sistema de reacciones si se proporciona tenantId
    if (tenantId) {
      try {
        await reactionsService.connect(tenantId)
        console.log('✅ Conectado al sistema de reacciones para tenant:', tenantId)
      } catch (error) {
        console.warn('⚠️ Error al conectar a reacciones durante autenticación:', error)
        // No bloqueamos la autenticación por errores de conexión
      }
    }
    
    // Emitir evento para sincronizar con otros componentes
    window.dispatchEvent(new CustomEvent('userAuthenticated', { 
      detail: { name: userState.name, avatar: userState.avatar } 
    }))
    
    console.log('✅ Usuario autenticado:', userState.name)
  }

  /**
   * Cerrar sesión del usuario
   */
  const logout = async () => {
    // Desconectar del sistema de reacciones
    try {
      await reactionsService.disconnect()
      console.log('🔌 Desconectado del sistema de reacciones')
    } catch (error) {
      console.warn('⚠️ Error al desconectar reacciones:', error)
    }
    
    userState.name = ''
    userState.avatar = ''
    userState.isAuthenticated = false
    
    localStorage.removeItem('karaqr-user')
    
    // Emitir evento de logout
    window.dispatchEvent(new CustomEvent('userLogout'))
    
    console.log('👋 Usuario desautenticado')
  }

  /**
   * Actualizar datos del usuario
   */
  const updateUser = (name?: string, avatar?: string) => {
    if (name !== undefined) {
      userState.name = name.trim()
    }
    if (avatar !== undefined) {
      userState.avatar = avatar
    }
    
    if (userState.isAuthenticated) {
      saveUserToStorage()
      
      // Emitir evento de actualización
      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: { name: userState.name, avatar: userState.avatar } 
      }))
      
      console.log('🔄 Usuario actualizado:', userState.name)
    }
  }

  // Computeds para acceso reactivo
  const user = computed(() => ({
    name: userState.name,
    avatar: userState.avatar,
    isAuthenticated: userState.isAuthenticated
  }))

  const userName = computed(() => userState.name || 'Invitado')
  const userAvatar = computed(() => userState.avatar)
  const isAuthenticated = computed(() => userState.isAuthenticated)

  // Inicializar cargando datos del localStorage al crear el composable
  loadUserFromStorage()

  return {
    // Estado reactivo
    user,
    userName,
    userAvatar,
    isAuthenticated,
    
    // Métodos
    authenticate,
    logout,
    updateUser,
    loadUserFromStorage,
    saveUserToStorage
  }
}

export default useUser