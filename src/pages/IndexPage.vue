<template>
  <q-page class="karaqr-page-bg">
    <!-- Contenido principal -->
    
    <!-- Mostrar prompt cuando no hay tenant configurado -->
    <NoTenantPrompt v-if="!isValidTenant" />
    
    <!-- Contenido principal cuando está autenticado Y hay tenant -->
    <div v-else class="home-content">
      <!-- Hero Section -->
      <div class="page-title q-mb-xl">
        <div class="title-content">
          <q-icon name="home" class="title-icon-inline" />
          <div class="title-text">
            <div class="text-h4 gradient-text">
              ¡Bienvenido {{ user.name }}!
            </div>
            <div class="text-subtitle1 text-grey-6">
              ✨ Canta, reacciona y disfruta la música ✨
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <q-btn
          color="primary"
          size="xl"
          label="Anotarse"
          icon="mic"
          @click="navigateWithTenant('/anotarse')"
          class="btn-animated main-cta glow-effect"
          unelevated
        />
        
        <q-btn
          color="secondary"
          size="lg"
          label="Reaccionar"
          icon="favorite"
          @click="navigateWithTenant('/reacciones')"
          class="btn-animated secondary-cta"
        />
      </div>
      
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTenant } from '../composables/useTenant'
import { useUser } from '../composables/useUser'
import NoTenantPrompt from '../components/NoTenantPrompt.vue'

const { tenantId, extractTenantFromRoute, navigateWithTenant, isValidTenant } = useTenant()
const { user } = useUser()

// Features data
const features = ref([
  {
    icon: 'mic',
    color: 'primary',
    title: 'Anótate para cantar',
    description: 'Elige tu canción favorita y únete a la cola de karaoke'
  },
  {
    icon: 'favorite',
    color: 'secondary', 
    title: 'Reacciona en vivo',
    description: 'Apoya a los cantantes con emojis y reacciones en tiempo real'
  },
  {
    icon: 'music_note',
    color: 'accent',
    title: '¡Disfruta la música!',
    description: 'Espera tu turno y canta con total confianza en el escenario'
  }
])

// Stats data
const stats = ref([
  { value: '🎤', label: 'Karaoke' },
  { value: '🎵', label: 'Música' },
  { value: '❤️', label: 'Diversión' },
  { value: '✨', label: 'Magia' }
])

// Verificar tenant al montar el componente
onMounted(() => {
  extractTenantFromRoute()
  console.log('🏠 Home page - Tenant:', tenantId.value)
  console.log('👤 Usuario:', user.value)
})
</script>

<style scoped>
/* Estilos limpios para Home Page */
.karaqr-page-bg {
  padding: 2rem 1rem;
}

.home-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

/* Hero Section */
/* Título unificado - nuevo estilo horizontal con ícono a la izquierda */
.page-title {
  text-align: left;
  position: relative;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: flex-start;
}

.title-icon-inline {
  font-size: 3rem !important;
  color: #6366f1 !important;
  flex-shrink: 0;
}

.title-text {
  flex: 1;
}

.title-text .text-h4 {
  margin-bottom: 0.5rem;
  font-weight: 700;
}

/* Responsivo para móviles */
@media (max-width: 600px) {
  .title-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .title-icon-inline {
    font-size: 2.5rem !important;
  }
}

/* Mantener compatibilidad con ícono antiguo */
.title-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
  animation: singing-pulse 3s ease-in-out infinite;
}

/* Hero Section - legacy styles mantenidos por compatibilidad */
.hero-section {
  text-align: center;
  animation: page-slide-in 0.8s ease-out;
}

.hero-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  display: block;
  animation: float 6s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1, #06b6d4, #8b5cf6);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.hero-tagline {
  font-size: 1rem;
  color: #94a3b8;
  font-weight: 400;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  animation: page-slide-in 0.8s ease-out 0.2s both;
}

.main-cta {
  height: 70px;
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #06b6d4) !important;
  border: none !important;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3) !important;
  font-family: 'Poppins', sans-serif;
}

.main-cta:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 6px 30px rgba(99, 102, 241, 0.4) !important;
}

/* Asegurar que el ícono del corazón sea blanco */
.secondary-cta .q-icon,
.secondary-cta i {
  color: white !important;
}

.secondary-cta {
  height: 60px;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid transparent !important;
  background: linear-gradient(135deg, #6366f1, #06b6d4) !important;
  color: white !important;
  backdrop-filter: blur(8px) !important;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3) !important;
}

.secondary-cta:hover {
  background: linear-gradient(135deg, #4f46e5, #0891b2) !important;
  color: white !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2) !important;
}

/* Info Section */
.info-section {
  width: 100%;
  animation: page-slide-in 0.8s ease-out 0.4s both;
}

.info-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1) !important;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05)) !important;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.features-list {
  padding: 2rem 1.5rem 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 16px;
  /* Background handled by global system */
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  /* Background handled by global system */
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(8px);
}

.feature-icon {
  flex-shrink: 0;
}

.feature-content {
  flex-grow: 1;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  font-family: 'Inter', sans-serif;
}

.feature-description {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Stats Section */
.stats-section {
  /* Background handled by global system */
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem 0;
}

.stat-item {
  text-align: center;
  padding: 1rem 0.5rem;
  border-radius: 12px;
  /* Background handled by global system */
  transition: all 0.3s ease;
}

.stat-item:hover {
  /* Background handled by global system */
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  font-family: 'Poppins', sans-serif;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 600px) {
  .karaqr-page-bg {
    padding: 1rem 0.5rem;
  }
  
  .home-content {
    gap: 2rem;
  }
  
  .hero-icon {
    font-size: 4rem;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .action-buttons {
    max-width: 100%;
  }
  
  .main-cta {
    height: 60px;
    font-size: 1.1rem;
  }
  
  .secondary-cta {
    height: 52px;
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .feature-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .feature-item:hover {
    transform: translateY(-2px);
  }
}

@media (max-width: 400px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .info-card {
    background: rgba(30, 41, 59, 0.98) !important;
    border-color: rgba(124, 58, 237, 0.2) !important;
  }
  
  .feature-item {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(124, 58, 237, 0.2);
  }
  
  .feature-title {
    color: #f8fafc;
  }
  
  .feature-description {
    color: #cbd5e1;
  }
}

/* Animación para el ícono del título unificado */
@keyframes singing-pulse {
  0%, 100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
  }
  50% { 
    transform: scale(1.1);
    filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.5));
  }
}
</style>