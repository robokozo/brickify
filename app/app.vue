<script setup lang="ts">
const links = [
  { to: '/qr', label: 'QR Code' },
  { to: '/mosaic', label: 'Mosaic' },
  { to: '/instructions', label: 'Help' },
  { to: '/about', label: 'About' },
] as const
</script>

<template>
  <UApp>
    <header class="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <nav class="container mx-auto flex items-center gap-1 py-3 px-4 overflow-x-auto">
        <NuxtLink to="/" class="mr-2 sm:mr-4 shrink-0">
          <span
            class="inline-block bg-brick-blue text-white font-black text-sm tracking-widest px-2.5 py-1.5 rounded-lg shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)]">
            BRICKIFY
          </span>
        </NuxtLink>
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
          class="px-3 py-1.5 rounded-lg text-sm font-bold text-gray-600 hover:text-brick-blue hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0"
          active-class="text-brick-blue! bg-blue-50">
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>

<style scoped>
.container {
  max-width: 1280px;
}
</style>
