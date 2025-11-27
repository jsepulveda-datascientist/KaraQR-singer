<template>
  <q-page class="q-pa-md karaqr-page-bg">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Título -->
        <div class="text-h4 q-mb-md text-center text-primary">
          <q-icon name="settings" class="q-mr-sm" />
          Configuración
        </div>

        <!-- Información del perfil -->
        <q-card class="q-mb-md settings-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="person" class="q-mr-sm" color="primary" />
                Perfil de Usuario
              </div>
              <q-btn
                flat
                icon="arrow_back"
                label="Volver"
                color="primary"
                @click="goToHome"
              />
            </div>
            
            <div class="row items-center q-mb-md">
              <q-avatar size="64px" class="q-mr-md">
                <img v-if="user.avatar" :src="user.avatar" alt="Avatar">
                <q-icon v-else name="person" size="32px" color="white" />
              </q-avatar>
              <div>
                <div class="text-subtitle1 text-weight-medium">{{ user.name }}</div>
                <div class="text-caption text-grey-7">Cantante</div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Editar nombre -->
            <q-input
              v-model="editForm.name"
              filled
              label="Nombre artístico"
              hint="Tu nombre para el karaoke"
              :rules="[val => !!val || 'El nombre es requerido']"
              counter
              maxlength="30"
            >
              <template v-slot:prepend>
                <q-icon name="edit" />
              </template>
            </q-input>

            <!-- Cambiar avatar -->
            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-md">
                <q-icon name="face" class="q-mr-sm" />
                Cambiar avatar
              </div>
              <div class="row q-gutter-sm">
                <q-avatar
                  v-for="(avatar, index) in avatarOptions"
                  :key="index"
                  size="50px"
                  class="cursor-pointer avatar-option"
                  :class="{ 'selected': editForm.avatar === avatar }"
                  @click="editForm.avatar = avatar"
                >
                  <img :src="avatar" alt="Avatar option">
                </q-avatar>
              </div>
            </div>

            <div class="q-mt-lg">
              <q-btn
                color="primary"
                label="Guardar cambios"
                icon="save"
                class="full-width"
                :loading="saving"
                @click="saveProfile"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useUser } from '../composables/useUser'
import { useTenant } from '../composables/useTenant'

const $q = useQuasar()
const { user, updateUserProfile } = useUser()
const { navigateWithTenant } = useTenant()

const saving = ref(false)

// Formulario de edición
const editForm = reactive({
  name: '',
  avatar: ''
})

// Opciones de avatar
const avatarOptions = [
  'https://cdn.quasar.dev/img/avatar2.jpg',
  'https://cdn.quasar.dev/img/avatar3.jpg',
  'https://cdn.quasar.dev/img/avatar4.jpg',
  'https://cdn.quasar.dev/img/avatar5.jpg',
  'https://cdn.quasar.dev/img/avatar6.jpg',
  'https://cdn.quasar.dev/img/boy-avatar.png',
  'https://cdn.quasar.dev/img/avatar.png'
]

// Cargar datos del usuario
function loadUserData() {
  editForm.name = user.value.name
  editForm.avatar = user.value.avatar || ''
}

// Guardar perfil
async function saveProfile() {
  if (!editForm.name.trim()) {
    return
  }

  saving.value = true
  try {
    // Actualizar perfil de usuario
    await updateUserProfile({
      name: editForm.name.trim(),
      avatar: editForm.avatar
    })

    // Mostrar mensaje de éxito
    $q.notify({
      type: 'positive',
      message: '✅ Perfil actualizado correctamente',
      position: 'top',
      timeout: 2000,
      icon: 'check_circle'
    })
    
    console.log('✅ Perfil actualizado correctamente')
  } catch (error) {
    console.error('❌ Error al guardar perfil:', error)
    
    $q.notify({
      type: 'negative',
      message: '❌ Error al guardar el perfil',
      position: 'top',
      timeout: 2000,
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Navegar al home
function goToHome() {
  navigateWithTenant('/')
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.settings-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.settings-card:hover {
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
}

.avatar-option {
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}
</style>
