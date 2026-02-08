<template>
  <UContainer class="py-16">
    <header class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4 text-blue-900">Brick Mosaic & QR Builder</h1>
      <p class="text-lg text-gray-700 mb-8">
        Create custom building instructions for mosaics and QR codes using bricks. Choose your mode below.
      </p>
      <div class="flex flex-wrap justify-center gap-6 mt-8">
        <NuxtLink to="/qr" class="px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-3">
          <span>QR Code Builder</span>
        </NuxtLink>
        <NuxtLink to="/mosaic" class="px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-3">
          <span>Mosaic Builder</span>
        </NuxtLink>
      </div>
    </header>
  </UContainer>
</template>
