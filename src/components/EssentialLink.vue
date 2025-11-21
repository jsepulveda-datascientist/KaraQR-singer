<template>
  <q-item
    clickable
    tag="router-link"
    :to="computedLink"
    :exact="isExactRoute"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { EssentialLinkProps } from '../types/components'

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: ''
})

const route = useRoute()

// Computed para mantener el tenant en los links
const computedLink = computed(() => {
  if (props.link === '#') return '#'
  
  return {
    path: props.link,
    query: route.query // Mantener todos los query params, incluyendo tenant
  }
})

// Determinar si este enlace debe usar exact matching
// Solo la ruta raíz "/" necesita exact para evitar que se active en todas las rutas
const isExactRoute = computed(() => {
  return props.link === '/'
})
</script>