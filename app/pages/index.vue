<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WiFiConfig } from '~/composables/useQRCode'
import type { LegoLayout, BrickCount, OptimizedBrickCount, BrickSize } from '~/composables/useLegoConverter'

// Page metadata
useHead({
  title: 'Brick WiFi QR Code Builder',
  meta: [
    { name: 'description', content: 'Generate brick building instructions for WiFi QR codes. Configure your WiFi network, choose colors, and get a complete parts list and building guide.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

// Composables
const { generateWiFiString, generateQRMatrix, getQRCodeSize } = useQRCode()
const { convertToLegoLayout, calculateBrickCount, optimizeBrickLayout, allBrickSizes } = useLegoConverter()

// State
const wifiConfig = ref<WiFiConfig>({
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false
})

// Baseplate size - 48x48 is the standard size for QR codes
const baseplateSize = ref(48)
const baseplateColor = ref('#FFFFFF') // Default to background color

const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')

// Default to all brick sizes selected (except 1x1 which is always included)
const availableBrickSizes = ref<BrickSize[]>([...allBrickSizes.filter(s => !(s.width === 1 && s.height === 1))])

// Piece type selection (Plate = studs, Tile = smooth)
const foregroundPieceType = ref<'Plate' | 'Tile'>('Plate')
const backgroundPieceType = ref<'Plate' | 'Tile'>('Tile')

// Whether to use a baseplate for the background
const useBaseplate = ref(false)

const wifiValid = ref(false)
const qrMatrix = ref<boolean[][] | null>(null)

// Computed - reactively generate layout when qrMatrix or availableBrickSizes changes
const qrSize = computed(() => {
  return qrMatrix.value ? getQRCodeSize(qrMatrix.value) : 0
})

const legoLayout = computed<LegoLayout | null>(() => {
  if (!qrMatrix.value) return null
  return convertToLegoLayout(qrMatrix.value, 1)
})

const brickCount = computed<BrickCount>(() => {
  if (!legoLayout.value) return { foreground: 0, background: 0, total: 0 }
  return calculateBrickCount(legoLayout.value)
})

const optimizedBrickCount = computed<OptimizedBrickCount | null>(() => {
  if (!legoLayout.value) return null
  return optimizeBrickLayout(legoLayout.value, availableBrickSizes.value)
})

// Methods
const generateQR = async () => {
  if (!wifiValid.value) return
  try {
    const wifiString = generateWiFiString(wifiConfig.value)
    qrMatrix.value = await generateQRMatrix(wifiString, 'H')
  } catch (error) {
    console.error('Error generating QR code:', error)
    qrMatrix.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800">
    <UContainer class="py-8">
      <!-- Header -->
      <header class="text-center text-white mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">
          🧱 Brick WiFi QR Code Builder
        </h1>
        <p class="text-lg md:text-xl opacity-95">
          Generate brick building instructions for WiFi QR codes
        </p>
      </header>

      <!-- Main Content -->
      <main class="space-y-6">
        <!-- Step 1: WiFi Configuration -->
        <WifiForm v-model="wifiConfig" @valid="wifiValid = $event" />

        <!-- Step 2: Generate QR Code Button -->
        <div v-if="wifiValid && !qrMatrix">
          <button
            class="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            @click="generateQR">
            📱 Generate QR Code
          </button>
        </div>

        <!-- Step 3: Setup (only shown after QR is generated) -->
        <ColorPicker v-if="qrMatrix" v-model:foreground="foregroundColor" v-model:background="backgroundColor"
          v-model:foreground-piece-type="foregroundPieceType" v-model:background-piece-type="backgroundPieceType"
          v-model:available-brick-sizes="availableBrickSizes" v-model:use-baseplate="useBaseplate"
          v-model:baseplate-size="baseplateSize" v-model:baseplate-color="baseplateColor" />

        <!-- Results (shown when QR is generated) -->
        <div v-if="qrMatrix && legoLayout" class="space-y-6">
          <BrickArrangement :grid="legoLayout.grid" :qr-size="qrSize" :foreground="foregroundColor"
            :background="backgroundColor" :baseplate-width="baseplateSize" :baseplate-height="baseplateSize"
            :bricks="optimizedBrickCount?.bricks" :foreground-piece-type="foregroundPieceType"
            :background-piece-type="backgroundPieceType" :use-baseplate="useBaseplate"
            :baseplate-color="baseplateColor" />

          <BrickList :brick-count="brickCount" :optimized-brick-count="optimizedBrickCount"
            :foreground="foregroundColor" :background="backgroundColor" :foreground-piece-type="foregroundPieceType"
            :background-piece-type="backgroundPieceType" :use-baseplate="useBaseplate" />
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center text-white mt-12 py-8 opacity-90">
        <p>
          Built with Nuxt.js 3 • Open Source on
          <a href="https://github.com/robokozo/lego-wifi-qr-builder" target="_blank"
            class="underline hover:opacity-80 transition-opacity">
            GitHub
          </a>
        </p>
      </footer>
    </UContainer>
  </div>
</template>
