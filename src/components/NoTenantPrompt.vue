<template>
  <div class="q-pa-md text-center">
    <div class="q-mb-lg">
      <q-icon name="qr_code_scanner" size="120px" color="primary" />
    </div>
    
    <h4 class="q-mt-lg q-mb-md">¡Escanea el QR del Local!</h4>
    
    <p class="text-body1 q-mb-lg">
      Para usar KaraQR Singer necesitas escanear el código QR 
      del establecimiento donde quieres cantar.
    </p>

    <div class="q-mb-lg">
      <q-icon name="info" class="q-mr-sm" />
      <span class="text-body2">
        El QR contiene la información del local específico
      </span>
    </div>

    <!-- Botón para testing en desarrollo -->
    <div v-if="isDev" class="q-mt-xl">
      <q-separator class="q-mb-md" />
      <p class="text-caption q-mb-md">🚧 Solo para Testing:</p>
      
      <q-btn-group>
        <q-btn 
          @click="setTestTenant('basement')"
          size="sm" 
          color="secondary" 
          label="Basement"
        />
        <q-btn 
          @click="setTestTenant('bar-central')"
          size="sm" 
          color="secondary" 
          label="Bar Central"
        />
        <q-btn 
          @click="setTestTenant('pub-test')"
          size="sm" 
          color="secondary" 
          label="Pub Test"
        />
      </q-btn-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTenant } from '../composables/useTenant'
import { useRouter } from 'vue-router'

const { setTenant } = useTenant()
const router = useRouter()

// Detectar si estamos en desarrollo
const isDev = import.meta.env.DEV as boolean

// Función para testing - simular escaneo de QR
const setTestTenant = (tenantId: string) => {
  setTenant(tenantId)
  
  // Navegar con el tenant configurado
  router.push({ 
    path: '/', 
    query: { tenant: tenantId } 
  })
}
</script>

<style scoped>
.q-btn-group {
  border-radius: 8px;
}
</style>