<template src="../templates/pages/QueuePage.html"></template>

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

<style src="../styles/pages/QueuePage.scss" scoped></style>