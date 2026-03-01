<template>
  <div class="container mx-auto py-12">
    <h1 class="text-3xl font-bold mb-6">About Brickify</h1>
    <p class="text-lg text-gray-700 mb-4">
      Brickify lets you generate brick building instructions for any QR code — WiFi credentials, URLs, plain text,
      emails, phone numbers, SMS messages, and geographic locations. It is open source and designed for brick fans and
      makers.
    </p>
    <ul class="list-disc list-inside text-gray-600 mb-6">
      <li>QR code builder: choose a type, fill in the details, and get a parts list and building instructions</li>
      <li>Supports 7 QR code types: WiFi, URL, Text, Email, Phone, SMS, and Location</li>
      <li>Mosaic builder: turn any image into a brick mosaic (coming soon)</li>
      <li>Optimized for real brick parts and colors</li>
      <li>Deployable to GitHub Pages</li>
    </ul>
    <div class="bg-gray-100 border border-gray-300 rounded-lg p-6 text-gray-700">
      <strong>Project by robokozo</strong><br>
      <a href="https://github.com/robokozo/lego-wifi-qr-builder" target="_blank" class="text-blue-600 underline">GitHub
        Repository</a>
    </div>
  </div>
</template>

<script setup lang="ts">
// About page placeholder
</script>

<style scoped>
.container {
  max-width: 700px;
}
</style>
