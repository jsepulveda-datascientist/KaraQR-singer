<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md text-center">
      👤 Mi Perfil en Basement
    </div>
    
    <!-- Información de usuario -->
    <q-card class="q-mb-md" v-if="isLoggedIn">
      <q-card-section class="text-center">
        <q-avatar size="80px" class="q-mb-md">
          <img v-if="profile.avatar" :src="profile.avatar" alt="Avatar">
          <q-icon v-else name="person" size="40px" />
        </q-avatar>
        <div class="text-h6">{{ profile.name }}</div>
        <div class="text-subtitle2 text-grey">{{ profile.email }}</div>
        <q-chip color="primary" text-color="white" class="q-mt-sm">
          🎤 {{ profile.favoriteGenre || 'Sin género favorito' }}
        </q-chip>
      </q-card-section>
    </q-card>
    
    <!-- Mensaje para usuarios no autenticados -->
    <q-card class="q-mb-md" v-else>
      <q-card-section class="text-center q-py-xl">
        <q-icon name="person_add" size="xl" color="grey" />
        <div class="text-h6 q-mt-md">¡Inicia sesión para personalizar tu perfil!</div>
        <div class="text-subtitle2 text-grey q-mt-sm">
          Guarda tus canciones favoritas y configura tu experiencia en Basement
        </div>
        <q-btn 
          color="primary" 
          label="Iniciar sesión" 
          class="q-mt-md"
          @click="$router.push('/')"
        />
      </q-card-section>
    </q-card>
    
    <q-card class="q-mb-md">
      <q-card-section>
        <q-form @submit="saveProfile" class="q-gutter-md">
          <q-input
            v-model="profile.name"
            filled
            label="Nombre"
            lazy-rules
            :rules="[val => !!val || 'El nombre es requerido']"
          />
          
          <q-input
            v-model="profile.email"
            filled
            type="email"
            label="Email"
            lazy-rules
            :rules="[
              val => !!val || 'El email es requerido',
              val => /.+@.+\..+/.test(val) || 'Email no válido'
            ]"
          />
          
          <q-select
            v-model="profile.favoriteGenre"
            :options="musicGenres"
            filled
            label="Género musical favorito"
          />
          
          <q-toggle
            v-model="profile.notifications"
            label="Recibir notificaciones"
          />
          
          <div>
            <q-btn
              label="Guardar Perfil"
              type="submit"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Mis Canciones Favoritas</div>
        
        <q-list separator>
          <q-item
            v-for="song in favoriteSongs"
            :key="song.id"
            clickable
          >
            <q-item-section>
              <q-item-label>{{ song.title }}</q-item-label>
              <q-item-label caption>{{ song.artist }}</q-item-label>
            </q-item-section>
            
            <q-item-section side>
              <q-btn
                flat
                round
                color="red"
                icon="delete"
                @click="removeFavorite(song.id)"
              />
            </q-item-section>
          </q-item>
          
          <q-item v-if="favoriteSongs.length === 0">
            <q-item-section>
              <q-item-label class="text-center text-grey">
                No tienes canciones favoritas aún
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Profile {
  name: string
  email: string
  favoriteGenre: string
  notifications: boolean
  avatar?: string
}

interface Song {
  id: number
  title: string
  artist: string
}

const profile = ref<Profile>({
  name: 'Usuario Demo',
  email: 'usuario@ejemplo.com',
  favoriteGenre: 'Rock',
  notifications: true,
  avatar: 'https://cdn.quasar.dev/img/avatar2.jpg'
})

const isLoggedIn = ref(true) // Simulando usuario logueado

const musicGenres = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Reggaeton',
  'Salsa',
  'Bachata',
  'Merengue',
  'Balada',
  'Folk'
]

const favoriteSongs = ref<Song[]>([
  {
    id: 1,
    title: 'Bohemian Rhapsody',
    artist: 'Queen'
  },
  {
    id: 2,
    title: 'Hotel California',
    artist: 'Eagles'
  }
])

function saveProfile() {
  // Aquí se guardaría el perfil en la base de datos
  console.log('Perfil guardado:', profile.value)
  // Mostrar notificación de éxito
}

function removeFavorite(songId: number) {
  const index = favoriteSongs.value.findIndex(song => song.id === songId)
  if (index > -1) {
    favoriteSongs.value.splice(index, 1)
  }
}
</script>