<template>
  <UContainer class="py-8">
    <header class="text-center text-blue-900 mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-3">
        🧱 Brick QR Code Builder
      </h1>
      <p class="text-lg md:text-xl opacity-95">
        Generate building instructions for WiFi QR codes using bricks
      </p>
    </header>
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
        v-model:foreground-brick-sizes="foregroundBrickSizes" v-model:background-brick-sizes="backgroundBrickSizes"
        v-model:use-baseplate="useBaseplate" v-model:baseplate-size="baseplateSize"
        v-model:baseplate-color="baseplateColor" />
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
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WiFiConfig } from '~/composables/useQRCode'
import type { LegoLayout, BrickCount, OptimizedBrickCount, BrickSize } from '~/composables/useLegoConverter'

const { generateWiFiString, generateQRMatrix, getQRCodeSize } = useQRCode()
const { convertToLegoLayout, calculateBrickCount, optimizeBrickLayout, defaultBrickSizes } = useLegoConverter()

const wifiConfig = ref<WiFiConfig>({
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false
})
const baseplateSize = ref(48)
const baseplateColor = ref('#FFFFFF')
const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')
const foregroundBrickSizes = ref<BrickSize[]>([...defaultBrickSizes])
const backgroundBrickSizes = ref<BrickSize[]>([...defaultBrickSizes])
const foregroundPieceType = ref<'Plate' | 'Tile'>('Plate')
const backgroundPieceType = ref<'Plate' | 'Tile'>('Tile')
const useBaseplate = ref(false)
const wifiValid = ref(false)
const qrMatrix = ref<boolean[][] | null>(null)
const qrSize = computed(() => qrMatrix.value ? getQRCodeSize(qrMatrix.value) : 0)
const legoLayout = computed<LegoLayout | null>(() => qrMatrix.value ? convertToLegoLayout(qrMatrix.value, 1) : null)
const brickCount = computed<BrickCount>(() => legoLayout.value ? calculateBrickCount(legoLayout.value) : { foreground: 0, background: 0, total: 0 })
const optimizedBrickCount = computed<OptimizedBrickCount | null>(() => legoLayout.value ? optimizeBrickLayout(legoLayout.value, foregroundBrickSizes.value, backgroundBrickSizes.value) : null)
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
