<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
</script>

<template>
  <div class="container mx-auto py-12 px-4 space-y-6">
    <h1 class="text-3xl font-black text-gray-900">About Brickify</h1>

    <BrickCard color="blue" title="🧱 What it does">
      <div class="p-6 space-y-3 text-gray-700">
        <p>
          Brickify turns QR codes and photos into buildable brick projects. Design it on screen, then order the
          exact pieces and follow the step-by-step instructions to build the real thing.
        </p>
        <ul class="list-disc list-inside space-y-1.5 text-gray-600">
          <li>QR codes for WiFi, URLs, text, email, phone, SMS, locations, and contact cards</li>
          <li>Photo mosaics with cropping, filters, color limits, and multi-panel layouts</li>
          <li>Interactive 3D previews of every build</li>
          <li>Parts lists with BrickLink part numbers, optimized to use fewer pieces</li>
          <li>Booklet-style building instructions, 10 pieces per step</li>
          <li>A scan check that verifies your QR color choices actually decode</li>
        </ul>
      </div>
    </BrickCard>

    <BrickCard color="green" title="🔒 Private by design">
      <div class="p-6 text-gray-700">
        <p>
          Everything runs in your browser. Photos, WiFi passwords, and contact details never leave your device:
          there is no server, no upload, and no account.
        </p>
      </div>
    </BrickCard>

    <BrickCard color="yellow" title="💛 Open source">
      <div class="p-6 space-y-2 text-gray-700">
        <p>
          Brickify is open source. Found a bug or have an idea?
          <a href="https://github.com/robokozo/brickify" target="_blank" rel="noopener"
            class="text-brick-blue font-semibold hover:underline">Visit the project on GitHub</a>.
        </p>
        <p class="text-sm text-gray-500">
          Project by robokozo. Not affiliated with the LEGO Group; brick part numbers reference BrickLink for
          ordering convenience.
        </p>
      </div>
    </BrickCard>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
}
</style>
