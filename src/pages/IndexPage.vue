<template>
  <q-page class="row items-center justify-evenly">
    <!-- Mostrar prompt cuando no hay tenant configurado -->
    <NoTenantPrompt v-if="!isValidTenant" />
    
    <!-- Contenido principal cuando está autenticado Y hay tenant -->
    <div v-else class="text-center">
      <div class="text-h4 text-primary q-mb-md">
        ¡Bienvenido {{ user.name }}! 🎤
      </div>
      <div class="text-h6 q-mb-xl">
        Tu aplicación para participar en karaoke
      </div>
      
      <div class="row q-gutter-md justify-center q-mb-xl">
        <q-btn
          color="primary"
          size="lg"
          label="Anotarse"
          icon="mic"
          @click="navigateWithTenant('/anotarse')"
          unelevated
        />
        
        <q-btn
          color="secondary"
          size="lg"
          label="Reaccionar"
          icon="favorite"
          @click="navigateWithTenant('/reacciones')"
          outline
        />
      </div>
      
      <div class="q-mt-xl">
        <q-card class="q-pa-md" style="max-width: 400px;">
          <q-card-section>
            <div class="text-h6">¿Cómo funciona?</div>
          </q-card-section>
          
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="qr_code_scanner" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Escanea el código QR</q-item-label>
                  <q-item-label caption>Usa tu cámara para conectarte al evento</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="mic" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Anótate para cantar</q-item-label>
                  <q-item-label caption>Elige tu canción y únete a la cola</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="favorite" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Reacciona en vivo</q-item-label>
                  <q-item-label caption>Apoya a los cantantes con tus reacciones</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon color="primary" name="music_note" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>¡Disfruta!</q-item-label>
                  <q-item-label caption>Espera tu turno y canta con confianza</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import NoTenantPrompt from '../components/NoTenantPrompt.vue'

const { tenantId, extractTenantFromRoute, navigateWithTenant, isValidTenant } = useTenant()
const { user } = useUser()

// Verificar tenant al montar el componente
onMounted(() => {
  extractTenantFromRoute()
  console.log('🏠 Home page - Tenant:', tenantId.value)
  console.log('👤 Usuario:', user.value)
})
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>