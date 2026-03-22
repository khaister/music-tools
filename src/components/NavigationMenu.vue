<script setup>
import { ref } from 'vue'

const AVAILABLE_KEYS = [
  { name: "C Major", slug: "c-major", meta: "0 accidentals" },
  { name: "E Major", slug: "e-major", meta: "4 sharps" },
  { name: "C♯ Minor", slug: "c-sharp-minor", meta: "4 sharps" }
]

const isActive = ref(false)

const toggleMenu = () => {
  isActive.value = !isActive.value
  document.body.style.overflow = isActive.value ? 'hidden' : ''
}

const closeMenu = () => {
  isActive.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <div class="drawer-overlay" :class="{ active: isActive }" @click="toggleMenu"></div>
  
  <div class="side-drawer" :class="{ active: isActive }">
    <div class="drawer-header">Quick Navigate</div>
    <nav class="drawer-nav">
      <router-link to="/" class="drawer-link" @click="closeMenu">Home</router-link>
      <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>
      
      <router-link 
        v-for="key in AVAILABLE_KEYS" 
        :key="key.slug" 
        :to="`/key/${key.slug}`" 
        class="drawer-link" 
        @click="closeMenu"
      >
        {{ key.name }}
        <span>{{ key.meta }}</span>
      </router-link>
    </nav>
  </div>

  <button class="menu-toggle" :class="{ active: isActive }" @click="toggleMenu">
    <span></span>
    <span></span>
    <span></span>
  </button>
</template>

<style scoped>
/* Scoped styles can be here, but we have them in components.css which is imported */
</style>
