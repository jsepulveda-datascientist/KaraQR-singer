import { ref, reactive, computed, watch } from 'vue'
import { reactionsService } from '../services/reactionsService'
import { useTenant } from './useTenant'

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
  
  // Obtener acceso al tenantId del composable useTenant
  const { tenantId: currentTenantId } = useTenant()
  
  /**
   * Reconectar automáticamente al sistema de reacciones
   * Sistema inteligente con backoff exponencial y reintentos
   */
  const reconnectToReactions = async () => {
    // Solo intentar reconectar si hay un usuario autenticado
    if (!userState.isAuthenticated) {
      console.log('🔄 Sin usuario autenticado, saltando reconexión')
      return
    }

    // Obtener el tenantId del composable useTenant
    const tenantId = currentTenantId.value
    
    if (!tenantId) {
      console.log('⚠️ No se encontró tenantId para reconectar:', { 
        url: window.location.search,
        tenantIdValue: tenantId 
      })
      return
    }

    console.log('🚀 Iniciando proceso de reconexión automática...', { 
      tenantId, 
      userAuthenticated: userState.isAuthenticated,
      userName: userState.name 
    })

    // Sistema de reintentos con backoff exponencial
    const maxAttempts = 3
    const baseDelay = 1000 // 1 segundo base
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 Reconectando automáticamente (intento ${attempt}/${maxAttempts})...`, { tenantId })
        
        await reactionsService.connect(tenantId)
        
        // Verificar que la conexión realmente se estableció
        if (reactionsService.isChannelConnected()) {
          console.log('✅ Reconexión automática exitosa - Usuario conectado a reacciones')
          return // Éxito, salir del bucle
        } else {
          throw new Error('La conexión no se estableció correctamente')
        }
        
      } catch (error) {
        console.warn(`⚠️ Intento ${attempt} fallido:`, error)
        
        // Si no es el último intento, esperar con backoff exponencial
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // 1s, 2s, 4s
          console.log(`⏱️ Esperando ${delay}ms antes del siguiente intento...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          console.log('❌ Todos los intentos de reconexión fallaron (funcionamiento silencioso)')
          console.log('🔍 Para debugging - Estado actual:', {
            userAuthenticated: userState.isAuthenticated,
            userName: userState.name,
            tenantId,
            url: window.location.href
          })
          // No mostramos error al usuario, simplemente logeamos
        }
      }
    }
  }

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
          
          // ✨ RECONEXIÓN AUTOMÁTICA: Intentar reconectar a reacciones
          // Usar setTimeout para asegurar que el DOM y routing estén listos
          setTimeout(() => {
            reconnectToReactions()
          }, 500)
          
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

  /**
   * Verificar y reforzar estado de sesión
   */
  const checkSession = () => {
    const wasAuthenticated = userState.isAuthenticated
    const success = loadUserFromStorage()
    
    if (wasAuthenticated !== userState.isAuthenticated) {
      console.log('🔐 Estado de sesión cambió durante verificación:', {
        anterior: wasAuthenticated,
        actual: userState.isAuthenticated,
        usuario: userState.name
      })
    }
    
    return success
  }

  /**
   * Obtener información detallada del estado de sesión
   */
  const getSessionInfo = () => {
    return {
      isAuthenticated: userState.isAuthenticated,
      name: userState.name,
      avatar: userState.avatar,
      hasLocalStorage: !!localStorage.getItem('karaqr-user'),
      timestamp: new Date().toISOString()
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
  const initialLoad = loadUserFromStorage()
  console.log('👤 useUser inicializado:', {
    success: initialLoad,
    user: userState.name,
    authenticated: userState.isAuthenticated
  })

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
    saveUserToStorage,
    checkSession,
    getSessionInfo
  }
}

export default useUser