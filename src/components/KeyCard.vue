<script setup>
defineProps({
  name: String,
  slug: String,
  meta: String
})
</script>

<template>
  <router-link :to="`/key/${slug}`" class="key-card">
    <div class="key-label">{{ name }}</div>
    <div class="key-meta">{{ meta }}</div>
  </router-link>
</template>
