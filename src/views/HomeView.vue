<script setup>
import KeyCard from '../components/KeyCard.vue'

const AVAILABLE_KEYS = [
  { name: "C Major", slug: "c-major", meta: "0 accidentals · Natural" },
  { name: "E Major", slug: "e-major", meta: "4 sharps · F♯ C♯ G♯ D♯" },
  { name: "C♯ Minor", slug: "c-sharp-minor", meta: "4 sharps · F♯ C♯ G♯ D♯" }
]
</script>

<template>
  <div class="home-page">
    <header>
      <div class="eyebrow">Explore Keys</div>
      <h1>KeyAtlas</h1>
      <div class="subtitle">Choose a musical key to explore scales, chords, and more.</div>
    </header>

    <main class="key-grid">
      <KeyCard 
        v-for="key in AVAILABLE_KEYS" 
        :key="key.slug" 
        :name="key.name" 
        :slug="key.slug" 
        :meta="key.meta" 
      />
    </main>
  </div>
</template>
