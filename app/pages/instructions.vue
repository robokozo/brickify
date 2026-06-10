<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
</script>

<template>
  <div class="container mx-auto py-12 px-4 space-y-6">
    <h1 class="text-3xl font-black text-gray-900">Help &amp; Tips</h1>

    <BrickCard color="red" title="🔲 QR Code Builder">
      <div class="p-6 space-y-3 text-gray-700">
        <ol class="list-decimal list-inside space-y-2">
          <li>Pick a QR code type: WiFi, URL, Text, Email, Phone, SMS, Location, or Contact</li>
          <li>Fill in the form. The QR code and brick layout rebuild automatically as you type</li>
          <li>Choose foreground and background colors. The contrast meter and the scan check warn you if a
            combination is hard to scan</li>
          <li>Pick piece types (plates have studs, tiles are smooth) and which brick sizes you own or want to order
          </li>
          <li>Already have a baseplate in your background color? Turn on "Use baseplate for background" and you only
            need foreground pieces. The alignment grid positions the code on the baseplate</li>
        </ol>
        <p class="text-sm text-gray-500">
          The scan check runs a simulated phone scan of your exact colors after every change, so a green check means
          the finished build should scan.
        </p>
      </div>
    </BrickCard>

    <BrickCard color="blue" title="🖼️ Mosaic Builder">
      <div class="p-6 space-y-3 text-gray-700">
        <ol class="list-decimal list-inside space-y-2">
          <li>Upload a photo: drop it, browse, or paste with Ctrl+V / ⌘V</li>
          <li>Adjust the image: drag to reposition, zoom in to crop tighter, zoom out to fit the whole photo, and
            apply a filter (B&amp;W, Sepia, Vivid)</li>
          <li>Pick a panel layout. Each panel is a 48×48 stud baseplate, so a 2×2 layout is a 96×96 mosaic</li>
          <li>Try dithering for photos with gradients; nearest color looks sharper for logos and flat art</li>
          <li>Save pieces with the baseplate color option: pieces matching that color are left off and the baseplate
            shows through</li>
        </ol>
      </div>
    </BrickCard>

    <BrickCard color="yellow" title="📖 Building Instructions">
      <div class="p-6 space-y-2 text-gray-700">
        <ul class="list-disc list-inside space-y-2">
          <li>Every build gets step-by-step instructions, 10 pieces at a time, in booklet style: the parts for the
            step are shown in the callout box, and new pieces are outlined in red in the 3D view</li>
          <li>Flip through steps with the ← → arrow keys, the Prev/Next buttons, or by dragging the slider</li>
          <li>Switch any 3D view to Flat for a top-down map of exact stud positions, and use "Reset view" if you
            lose the camera</li>
          <li>Multi-panel mosaics are built one panel at a time; pick the panel above the step header</li>
        </ul>
      </div>
    </BrickCard>

    <BrickCard color="green" title="🛒 Ordering &amp; Building Tips">
      <div class="p-6 space-y-2 text-gray-700">
        <ul class="list-disc list-inside space-y-2">
          <li>The parts list shows BrickLink part numbers; print it or copy it to your clipboard for ordering</li>
          <li>Order 5 to 10 percent extra pieces to cover mistakes and lost parts</li>
          <li>Tiles give a clean, smooth finish and scan slightly better (no stud shadows); plates are cheaper and
            easier to adjust</li>
          <li>When scanning a finished build, use even lighting and hold the phone parallel to the build to avoid
            glare on glossy pieces</li>
          <li>Larger pieces make the build faster and sturdier; 1×1 pieces are only needed where the pattern demands
            them</li>
        </ul>
      </div>
    </BrickCard>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
}
</style>
