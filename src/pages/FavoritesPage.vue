<template>
  <q-page class="q-pa-md karaqr-page-bg">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Título -->
        <div class="text-h4 q-mb-md text-center text-primary">
          <q-icon name="favorite" class="q-mr-sm" />
          Mis Temas Favoritos
        </div>

        <!-- Botón para agregar nuevo tema -->
        <div class="q-mb-md">
          <q-btn
            color="primary"
            icon="add"
            label="Agregar tema favorito"
            class="full-width"
            @click="showAddDialog = true"
            :disable="loading"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-dots color="primary" size="50px" />
          <div class="text-body1 text-grey-7 q-mt-md">
            Cargando favoritos...
          </div>
        </div>

        <!-- Lista de favoritos -->
        <div v-else-if="favorites.length > 0" class="q-gutter-md">
          <q-card
            v-for="favorite in favorites"
            :key="favorite.id"
            class="favorite-card"
          >
            <q-card-section class="row items-center">
              <div class="col-auto q-mr-md">
                <q-icon name="music_note" size="2em" color="primary" />
              </div>
              
              <div class="col">
                <div class="text-h6 text-primary">{{ favorite.song }}</div>
                <div class="text-subtitle2 text-grey-7">{{ favorite.artist }}</div>
                <div v-if="favorite.youtubeUrl" class="text-caption q-mt-xs">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="play_arrow"
                    label="Ver en YouTube"
                    color="red"
                    type="a"
                    :href="favorite.youtubeUrl"
                    target="_blank"
                  />
                </div>
              </div>

              <div class="col-auto q-gutter-sm">
                <q-btn
                  color="secondary"
                  icon="queue_music"
                  label="Agregar a la fila"
                  @click="addToQueueFromFavorite(favorite)"
                  :loading="addingToQueue === favorite.id"
                  class="add-to-queue-btn"
                />
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    color="primary"
                    @click="editFavorite(favorite)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="confirmDelete(favorite)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Estado vacío -->
        <q-card v-else class="text-center q-pa-xl">
          <q-icon name="music_off" size="4em" color="grey-5" />
          <div class="text-h6 q-mt-md text-grey-7">
            Aún no tienes temas favoritos
          </div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            Agrega tus canciones favoritas para tenerlas siempre a mano
          </div>
        </q-card>
      </div>
    </div>

    <!-- Dialog para agregar/editar tema -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editingFavorite ? 'Editar tema favorito' : 'Agregar tema favorito' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveFavorite" class="q-gutter-md">
            <q-input
              v-model="form.song"
              filled
              label="Nombre de la canción *"
              hint="Título de la canción"
              :rules="[val => !!val || 'El nombre es requerido']"
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="music_note" />
              </template>
            </q-input>

            <q-input
              v-model="form.artist"
              filled
              label="Artista *"
              hint="Nombre del artista o banda"
              :rules="[val => !!val || 'El artista es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="form.youtubeUrl"
              filled
              label="Link de YouTube (opcional)"
              hint="URL del video de karaoke en YouTube"
              type="url"
            >
              <template v-slot:prepend>
                <q-icon name="link" />
              </template>
            </q-input>

            <div class="row q-gutter-sm justify-end">
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                @click="closeDialog"
              />
              <q-btn
                type="submit"
                label="Guardar"
                color="primary"
                icon="save"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">¿Eliminar tema favorito?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body1">
            ¿Estás seguro de que quieres eliminar 
            <strong>"{{ favoriteToDelete?.song }}"</strong> 
            de {{ favoriteToDelete?.artist }}?
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            icon="delete"
            @click="deleteFavorite"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabaseService } from '../services/supabaseService'
import { authService } from '../services/authService'
import { useQueue } from '../composables/useQueue'

const $q = useQuasar()
const { addToQueue } = useQueue()

interface Favorite {
  id: string
  song_title: string
  artist_name: string
  youtube_url?: string | null
  created_at: string
}

// Para mantener compatibilidad con el template
interface DisplayFavorite {
  id: string
  song: string
  artist: string
  youtubeUrl?: string
  createdAt: number
}

const favorites = ref<DisplayFavorite[]>([])
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingFavorite = ref<DisplayFavorite | null>(null)
const favoriteToDelete = ref<DisplayFavorite | null>(null)
const saving = ref(false)
const loading = ref(false)
const currentUserId = ref<string | null>(null)
const addingToQueue = ref<string | null>(null)

const form = reactive({
  song: '',
  artist: '',
  youtubeUrl: ''
})

// Cargar favoritos desde Supabase
async function loadFavorites() {
  if (!currentUserId.value) {
    console.warn('No hay usuario autenticado')
    return
  }

  loading.value = true
  try {
    const data = await supabaseService.getFavoriteSongs(currentUserId.value)
    
    // Convertir de formato DB a formato display
    favorites.value = (data || []).map((fav: Favorite) => ({
      id: fav.id,
      song: fav.song_title,
      artist: fav.artist_name,
      youtubeUrl: fav.youtube_url || undefined,
      createdAt: new Date(fav.created_at).getTime()
    }))
  } catch (error) {
    console.error('Error al cargar favoritos:', error)
    
    $q.notify({
      type: 'negative',
      message: '❌ Error al cargar favoritos',
      position: 'top',
      timeout: 2000,
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Guardar o actualizar favorito
async function saveFavorite() {
  if (!form.song.trim() || !form.artist.trim()) {
    return
  }

  if (!currentUserId.value) {
    $q.notify({
      type: 'warning',
      message: 'Debes estar autenticado para guardar favoritos',
      position: 'top',
      timeout: 2000,
      icon: 'warning'
    })
    return
  }

  saving.value = true

  try {
    if (editingFavorite.value) {
      // Editar existente
      const updated = await supabaseService.updateFavoriteSong(
        editingFavorite.value.id,
        form.song.trim(),
        form.artist.trim(),
        form.youtubeUrl.trim() || undefined
      )
      
      // Actualizar en la lista local
      const index = favorites.value.findIndex(f => f.id === editingFavorite.value!.id)
      if (index !== -1) {
        favorites.value[index] = {
          id: updated.id,
          song: updated.song_title,
          artist: updated.artist_name,
          youtubeUrl: updated.youtube_url || undefined,
          createdAt: new Date(updated.created_at).getTime()
        }
      }
      
      $q.notify({
        type: 'positive',
        message: '✅ Tema actualizado correctamente',
        position: 'top',
        timeout: 2000,
        icon: 'check_circle'
      })
    } else {
      // Agregar nuevo
      const newFav = await supabaseService.addFavoriteSong(
        currentUserId.value,
        form.song.trim(),
        form.artist.trim(),
        form.youtubeUrl.trim() || undefined
      )
      
      // Agregar a la lista local
      favorites.value.unshift({
        id: newFav.id,
        song: newFav.song_title,
        artist: newFav.artist_name,
        youtubeUrl: newFav.youtube_url || undefined,
        createdAt: new Date(newFav.created_at).getTime()
      })
      
      $q.notify({
        type: 'positive',
        message: '✅ Tema agregado a favoritos',
        position: 'top',
        timeout: 2000,
        icon: 'favorite'
      })
    }

    closeDialog()
  } catch (error) {
    console.error('Error al guardar favorito:', error)
    
    $q.notify({
      type: 'negative',
      message: '❌ Error al guardar el tema',
      position: 'top',
      timeout: 2000,
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Editar favorito
function editFavorite(favorite: DisplayFavorite) {
  editingFavorite.value = favorite
  form.song = favorite.song
  form.artist = favorite.artist
  form.youtubeUrl = favorite.youtubeUrl || ''
  showAddDialog.value = true
}

// Confirmar eliminación
function confirmDelete(favorite: DisplayFavorite) {
  favoriteToDelete.value = favorite
  showDeleteDialog.value = true
}

// Eliminar favorito
async function deleteFavorite() {
  if (!favoriteToDelete.value) return

  try {
    await supabaseService.deleteFavoriteSong(favoriteToDelete.value.id)
    
    const index = favorites.value.findIndex(f => f.id === favoriteToDelete.value!.id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
    }
    
    $q.notify({
      type: 'info',
      message: 'Tema eliminado de favoritos',
      position: 'top',
      timeout: 2000,
      icon: 'delete'
    })
  } catch (error) {
    console.error('Error al eliminar favorito:', error)
    
    $q.notify({
      type: 'negative',
      message: '❌ Error al eliminar el tema',
      position: 'top',
      timeout: 2000,
      icon: 'error'
    })
  } finally {
    favoriteToDelete.value = null
  }
}

// Agregar canción favorita a la fila
async function addToQueueFromFavorite(favorite: DisplayFavorite) {
  addingToQueue.value = favorite.id
  
  try {
    await addToQueue({
      title: favorite.song,
      artist: favorite.artist,
      youtubeLink: favorite.youtubeUrl
    })
  } catch (error) {
    console.error('Error al agregar a la fila:', error)
  } finally {
    addingToQueue.value = null
  }
}

// Cerrar dialog
function closeDialog() {
  showAddDialog.value = false
  editingFavorite.value = null
  form.song = ''
  form.artist = ''
  form.youtubeUrl = ''
}

async function initializePage() {
  // Obtener usuario actual
  const user = await authService.getCurrentUser()
  if (user && !user.isAuthenticated) {
    $q.notify({
      type: 'warning',
      message: 'Debes autenticarte para ver tus favoritos',
      position: 'top',
      timeout: 3000,
      icon: 'warning'
    })
    return
  }
  
  if (user) {
    currentUserId.value = user.id
    await loadFavorites()
  }
}

onMounted(() => {
  initializePage()
})
</script>

<style scoped>
.favorite-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.favorite-card:hover {
  background: rgba(255, 255, 255, 0.98) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.12);
}

.add-to-queue-btn {
  font-weight: 600;
  text-transform: none;
}
</style>
