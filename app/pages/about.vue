<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
</script>

<template>
  <div class="container mx-auto py-12 px-4">
    <h1 class="text-3xl font-black text-gray-900 mb-6">About Brickify</h1>

    <BrickCard color="blue">
      <div class="p-6">
        <p class="text-lg text-gray-700 mb-4">
          Brickify lets you generate brick building instructions for any QR code (WiFi credentials, URLs, plain text,
          emails, phone numbers, SMS messages, and geographic locations) and turn any photo into a brick mosaic. It is
          open source and designed for brick fans and makers.
        </p>
        <ul class="list-disc list-inside text-gray-600 space-y-1 mb-4">
          <li>QR code builder: choose a type, fill in the details, and get a parts list and building instructions</li>
          <li>Supports 7 QR code types: WiFi, URL, Text, Email, Phone, SMS, and Location</li>
          <li>Mosaic builder: turn any image into a brick mosaic with a 3D preview</li>
          <li>Optimized for real brick parts and colors</li>
        </ul>
        <p class="text-sm text-gray-500">Project by robokozo</p>
      </div>
    </BrickCard>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
}
</style>
