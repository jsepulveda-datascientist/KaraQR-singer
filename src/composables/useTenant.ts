import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { queueService } from '../services/queueService'

const tenantId = ref<string>('') // No hay valor por defecto - viene del QR

/**
 * Composable para manejar el tenant ID desde la URL
 * Replica la funcionalidad del módulo join de karaQR
 */
export function useTenant() {
  const route = useRoute()
  const router = useRouter()

  // Función para extraer y almacenar tenant de query params
  const extractTenantFromRoute = () => {
    // Validar que route y query existen
    if (!route || !route.query) {
      console.warn('⚠️ Route o query no disponible')
      return tenantId.value
    }
    
    const tenant = route.query.tenant as string
    console.log('🔍 extractTenantFromRoute - tenant de URL:', tenant)
    console.log('🔍 extractTenantFromRoute - tenantId.value actual:', tenantId.value)
    
    if (tenant && tenant !== tenantId.value) {
      // Almacenar tenant en localStorage para persistencia
      localStorage.setItem('karaqr_current_tenant', tenant)
      tenantId.value = tenant
      
      // Actualizar servicio con el nuevo tenant
      queueService.setTenantId(tenant)
      
      console.log('🏢 Tenant ID escaneado y almacenado:', tenant)
    } else if (!tenant && !tenantId.value) {
      // Intentar recuperar de localStorage si no hay en URL
      const storedTenant = localStorage.getItem('karaqr_current_tenant')
      console.log('🔍 Tenant almacenado encontrado:', storedTenant)
      if (storedTenant) {
        tenantId.value = storedTenant
        queueService.setTenantId(storedTenant)
        console.log('🏢 Tenant ID recuperado del almacenamiento:', storedTenant)
      }
    }
    
    console.log('🔍 Resultado final - tenantId.value:', tenantId.value)
    return tenantId.value
  }

  // Observar cambios en la ruta
  watch(
    () => route?.query?.tenant,
    () => {
      try {
        extractTenantFromRoute()
      } catch (error) {
        console.warn('⚠️ Error al extraer tenant de ruta:', error)
      }
    },
    { immediate: true }
  )

  // Computed para el tenant actual
  const currentTenant = computed(() => tenantId.value)

  // Función para navegar manteniendo el tenant
  const navigateWithTenant = (path: string) => {
    try {
      if (!router) {
        console.warn('⚠️ Router no disponible para navegación')
        return
      }
      
      const query = route?.query || {}
      
      router.push({
        path,
        query: { ...query, tenant: tenantId.value }
      })
    } catch (error) {
      console.error('❌ Error al navegar con tenant:', error)
      // Intentar navegación simple sin query params como fallback
      try {
        router.push(path)
      } catch (fallbackError) {
        console.error('❌ Error en navegación fallback:', fallbackError)
      }
    }
  }

  // Función para obtener URL con tenant
  const getUrlWithTenant = (path: string) => {
    return `${path}?tenant=${tenantId.value}`
  }

  // Función para verificar si el tenant es válido
  const isValidTenant = computed(() => {
    return tenantId.value && tenantId.value.length > 0
  })

  // Función para limpiar tenant almacenado
  const clearTenant = () => {
    localStorage.removeItem('karaqr_current_tenant')
    tenantId.value = ''
    console.log('🗑️ Tenant limpiado del almacenamiento')
  }

  // Función para forzar tenant (útil para testing)
  const setTenant = (newTenant: string) => {
    localStorage.setItem('karaqr_current_tenant', newTenant)
    tenantId.value = newTenant
    queueService.setTenantId(newTenant)
    console.log('🔧 Tenant forzado:', newTenant)
  }

  // Función para validar que existe tenant antes de usar la app
  const requireTenant = () => {
    console.log('🔍 requireTenant() - tenantId.value:', tenantId.value)
    console.log('🔍 requireTenant() - isValidTenant.value:', isValidTenant.value)
    
    if (!isValidTenant.value) {
      console.warn('⚠️ No hay tenant configurado. La aplicación requiere escanear un QR válido.')
      return false
    }
    console.log('✅ requireTenant() - tenant válido')
    return true
  }

  return {
    tenantId: currentTenant,
    extractTenantFromRoute,
    navigateWithTenant,
    getUrlWithTenant,
    isValidTenant,
    clearTenant,
    setTenant,
    requireTenant
  }
}

export default useTenant