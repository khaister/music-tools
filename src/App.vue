<script setup>
import NavigationMenu from './components/NavigationMenu.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <NavigationMenu />
  <router-view />
  <SiteFooter />
</template>

<style>
/* Global styles if needed, but we import shared.css in main.js */
</style>
