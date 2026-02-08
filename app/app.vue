<template>
  <UApp>
    <header class="bg-white border-b border-gray-200 py-4 mb-8">
      <nav class="container mx-auto flex items-center gap-6">
        <NuxtLink to="/" class="text-xl font-bold text-blue-600 hover:underline">Brickify</NuxtLink>
        <NuxtLink to="/qr" class="text-gray-700 hover:text-blue-600 hover:underline">QR Code</NuxtLink>
        <NuxtLink to="/mosaic" class="text-gray-700 hover:text-blue-600 hover:underline">Mosaic</NuxtLink>
        <NuxtLink to="/instructions" class="text-gray-700 hover:text-blue-600 hover:underline">Instructions</NuxtLink>
        <NuxtLink to="/about" class="text-gray-700 hover:text-blue-600 hover:underline">About</NuxtLink>
      </nav>
    </header>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>

<style scoped>
.container {
  max-width: 900px;
}
</style>
