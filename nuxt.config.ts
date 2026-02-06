// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'nuxt-gtag','@nuxtjs/tailwindcss'],

  gtag: {
    id: process.env.GOOGLE_ANALYTICS_ID || '',
    enabled: !!process.env.GOOGLE_ANALYTICS_ID
  },
  app: {
    head: {
      title: 'UX Dojo - Learn UX Laws Through Games',
      meta: [
        { name: 'google-site-verification', content: 'UfZFQPhRDEA7Fpx_JGvbn4FS4wF0oTfLeUNmWxKuLs8' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Interactive mini-games that teach the Laws of UX through fun challenges' }
      ]
    }
  },
  typescript: {
    strict: true
  }
})
