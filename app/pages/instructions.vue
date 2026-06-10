<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
</script>

<template>
  <div class="container mx-auto py-12 px-4">
    <h1 class="text-3xl font-black text-gray-900 mb-6">Help &amp; Tips</h1>

    <BrickCard color="red" class="mb-6">
      <div class="p-6">
        <p class="text-lg text-gray-700 mb-4">
          Learn how to use the QR code and mosaic builders, including tips for building, scanning, and ordering parts.
        </p>
        <ul class="list-disc list-inside text-gray-600 space-y-1">
          <li>Select a QR code type: WiFi, URL, Text, Email, Phone, SMS, or Location</li>
          <li>Fill in the required fields and the QR code and 3D brick layout build themselves as you type</li>
          <li>Customise colours and brick sizes, then use the parts list to order pieces</li>
          <li>For mosaics: upload a photo, pick a panel layout, and follow the step-by-step instructions</li>
          <li>Tip: in any Building Instructions card, flip through steps with the ← → arrow keys</li>
        </ul>
      </div>
    </BrickCard>

    <BrickCard color="green">
      <div class="p-6 text-green-800 bg-green-50">
        More detailed instructions will be added soon!
      </div>
    </BrickCard>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
}
</style>
