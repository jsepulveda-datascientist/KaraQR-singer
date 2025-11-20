<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md text-center">
      🎵 Cola de Canciones
    </div>
    
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Ahora cantando:</div>
        <div v-if="currentSong" class="text-subtitle1 text-primary">
          {{ currentSong.title }} - {{ currentSong.artist }}
        </div>
        <div v-else class="text-subtitle1 text-grey">
          No hay canciones en reproducción
        </div>
      </q-card-section>
    </q-card>
    
    <q-list bordered separator>
      <q-item-label header>Próximas canciones</q-item-label>
      
      <q-item
        v-for="(song, index) in queueSongs"
        :key="song.id"
        class="q-py-md"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ index + 1 }}
          </q-avatar>
        </q-item-section>
        
        <q-item-section>
          <q-item-label>{{ song.title }}</q-item-label>
          <q-item-label caption>{{ song.artist }}</q-item-label>
        </q-item-section>
        
        <q-item-section side>
          <q-item-label caption>{{ song.singer }}</q-item-label>
        </q-item-section>
      </q-item>
      
      <q-item v-if="queueSongs.length === 0">
        <q-item-section>
          <q-item-label class="text-center text-grey">
            No hay canciones en la cola
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="addSongDialog = true"
      />
    </q-page-sticky>
    
    <!-- Dialog para agregar canción -->
    <q-dialog v-model="addSongDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Agregar canción</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newSong.title"
            dense
            autofocus
            label="Título de la canción"
          />
          <q-input
            v-model="newSong.artist"
            dense
            label="Artista"
            class="q-mt-md"
          />
          <q-input
            v-model="newSong.singer"
            dense
            label="Tu nombre"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="addSongDialog = false" />
          <q-btn flat label="Agregar" @click="addSong" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '../composables/useUser'

interface Song {
  id: number
  title: string
  artist: string
  singer: string
}

const { userName } = useUser()
const addSongDialog = ref(false)
const currentSong = ref<Song | null>({
  id: 1,
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  singer: 'Juan'
})

const queueSongs = ref<Song[]>([
  {
    id: 2,
    title: 'Hotel California',
    artist: 'Eagles',
    singer: 'María'
  },
  {
    id: 3,
    title: 'Imagine',
    artist: 'John Lennon',
    singer: 'Pedro'
  },
  {
    id: 4,
    title: 'Sweet Caroline',
    artist: 'Neil Diamond',
    singer: 'Ana'
  }
])

const newSong = ref({
  title: '',
  artist: '',
  singer: ''
})

// Inicializar con el nombre del usuario al montar el componente
onMounted(() => {
  newSong.value.singer = userName.value
})

function addSong() {
  if (newSong.value.title && newSong.value.artist && newSong.value.singer) {
    queueSongs.value.push({
      id: Date.now(),
      ...newSong.value
    })
    
    // Limpiar formulario manteniendo el nombre del usuario
    newSong.value = {
      title: '',
      artist: '',
      singer: userName.value
    }
    
    addSongDialog.value = false
  }
}
</script>