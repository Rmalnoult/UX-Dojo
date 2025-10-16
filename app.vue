<template>
  <div class="dark">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup>
// Force dark mode
if (import.meta.client) {
  document.documentElement.classList.add('dark')
}
</script>

<style>
@import './assets/css/main.css';
</style>
