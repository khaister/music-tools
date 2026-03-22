<script setup>
defineProps({
  title: String,
  feel: String,
  numerals: Array,
  chords: Array
})
</script>

<template>
  <div class="tip-card">
    <h4>{{ title }}</h4>
    <p>{{ feel }}</p>
    <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 8px;">
      {{ numerals.join(' · ') }}
    </p>
    <p style="font-size: 12px; margin-top: 4px;">
      {{ chords.join(' – ') }}
    </p>
  </div>
</template>
