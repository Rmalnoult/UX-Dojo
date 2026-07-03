<template>
  <div class="dark">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup>
const route = useRoute()

useHead({
  link: [
    { rel: 'canonical', href: computed(() => `https://ux-dojo.com${route.path}`) }
  ]
})

useSeoMeta({
  ogSiteName: 'UX Dojo',
  ogType: 'website',
  ogLocale: 'en_US',
  ogImage: 'https://ux-dojo.com/og-image.png',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://ux-dojo.com/og-image.png',
})

// Force dark mode
if (import.meta.client) {
  document.documentElement.classList.add('dark')
}
</script>

<style>
@import './assets/css/main.css';
</style>
