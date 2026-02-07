// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Configure for SPA mode
  ssr: false,
  
  // Configure for GitHub Pages deployment
  app: {
    baseURL: '/lego-wifi-qr-builder/',
    buildAssetsDir: 'assets',
  },
  
  // Ensure proper routing for SPA
  router: {
    options: {
      hashMode: false
    }
  },

  // Add Nuxt UI module
  modules: ['@nuxt/ui'],

  // Tailwind CSS configuration (via Nuxt UI)
  ui: {
    global: true,
  },

  // Color mode configuration
  colorMode: {
    preference: 'light'
  }
})
