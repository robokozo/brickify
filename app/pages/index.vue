<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center text-white mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">
          🧱 LEGO WiFi QR Code Builder
        </h1>
        <p class="text-lg md:text-xl opacity-95">
          Generate LEGO building instructions for WiFi QR codes
        </p>
      </header>

      <!-- Main Content -->
      <main class="space-y-6 max-w-5xl mx-auto">
        <!-- Step 1: WiFi Configuration -->
        <div class="relative" :class="{ 'opacity-100': currentStep >= 1, 'opacity-70': currentStep < 1 }">
          <div class="absolute -left-4 top-4 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
            1
          </div>
          <WifiForm 
            v-model="wifiConfig"
            @valid="wifiValid = $event"
          />
        </div>

        <!-- Step 2: Baseplate Configuration -->
        <div v-if="wifiValid" class="relative" :class="{ 'opacity-100': currentStep >= 2, 'opacity-70': currentStep < 2 }">
          <div class="absolute -left-4 top-4 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
            2
          </div>
          <BaseplateConfig
            v-model="baseplateConfig"
            :qr-size="qrSize"
            :max-scale="maxScale"
          />
        </div>

        <!-- Step 3: Color Selection -->
        <div v-if="wifiValid && qrMatrix" class="relative" :class="{ 'opacity-100': currentStep >= 3, 'opacity-70': currentStep < 3 }">
          <div class="absolute -left-4 top-4 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
            3
          </div>
          <ColorPicker
            v-model:foreground="foregroundColor"
            v-model:background="backgroundColor"
          />
        </div>

        <!-- Step 4: Generate Button -->
        <div v-if="wifiValid && qrMatrix">
          <UButton
            block
            size="xl"
            color="green"
            :loading="generating"
            :disabled="generating"
            @click="generateLayout"
          >
            <template v-if="!generating">
              🎯 Generate LEGO Instructions
            </template>
            <template v-else>
              ⏳ Generating...
            </template>
          </UButton>
        </div>

        <!-- Step 5: Results -->
        <div v-if="legoLayout" class="space-y-6">
          <BrickArrangement
            :grid="legoLayout.grid"
            :qr-size="qrSize"
            :scale="currentScale"
            :max-scale="maxScale"
            :foreground="foregroundColor"
            :background="backgroundColor"
            :baseplate-width="baseplateConfig.width"
            :baseplate-height="baseplateConfig.height"
            @update:scale="handleScaleChange"
          />

          <BrickList
            :brick-count="brickCount"
            :optimized-brick-count="optimizedBrickCount"
            :foreground="foregroundColor"
            :background="backgroundColor"
          />
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center text-white mt-12 py-8 opacity-90">
        <p>
          Built with Nuxt.js 3 • Open Source on 
          <a 
            href="https://github.com/robokozo/lego-wifi-qr-builder" 
            target="_blank"
            class="underline hover:opacity-80 transition-opacity"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WiFiConfig } from '~/composables/useQRCode'
import type { BaseplateConfig, LegoLayout, BrickCount, OptimizedBrickCount } from '~/composables/useLegoConverter'

// Page metadata
useHead({
  title: 'LEGO WiFi QR Code Builder',
  meta: [
    { name: 'description', content: 'Generate LEGO building instructions for WiFi QR codes. Configure your WiFi network, choose colors, and get a complete parts list and building guide.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

// Composables
const { generateWiFiString, generateQRMatrix, getQRCodeSize } = useQRCode()
const { getMaxScale, convertToLegoLayout, calculateBrickCount, optimizeBrickLayout } = useLegoConverter()

// State
const wifiConfig = ref<WiFiConfig>({
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false
})

const baseplateConfig = ref<BaseplateConfig>({
  width: 32,
  height: 32
})

const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')
const currentScale = ref(1)

const wifiValid = ref(false)
const generating = ref(false)
const qrMatrix = ref<boolean[][] | null>(null)
const legoLayout = ref<LegoLayout | null>(null)
const brickCount = ref<BrickCount>({ foreground: 0, background: 0, total: 0 })
const optimizedBrickCount = ref<OptimizedBrickCount | null>(null)

// Computed
const currentStep = computed(() => {
  if (!wifiValid.value) return 1
  if (!qrMatrix.value) return 2
  return 3
})

const qrSize = computed(() => {
  return qrMatrix.value ? getQRCodeSize(qrMatrix.value) : 0
})

const maxScale = computed(() => {
  if (!qrMatrix.value) return 1
  return getMaxScale(qrSize.value, baseplateConfig.value.width, baseplateConfig.value.height)
})

// Watch for WiFi config changes and regenerate QR code
watch(wifiConfig, async (newConfig) => {
  if (wifiValid.value) {
    try {
      const wifiString = generateWiFiString(newConfig)
      qrMatrix.value = await generateQRMatrix(wifiString, 'H')
      // Reset layout when QR changes
      legoLayout.value = null
    } catch (error) {
      console.error('Error generating QR code:', error)
      qrMatrix.value = null
    }
  } else {
    qrMatrix.value = null
    legoLayout.value = null
  }
}, { deep: true })

// Watch for baseplate config changes
watch([baseplateConfig, qrSize], () => {
  if (qrSize.value > 0) {
    // Adjust scale if current scale doesn't fit
    const newMaxScale = maxScale.value
    if (currentScale.value > newMaxScale) {
      currentScale.value = newMaxScale
    }
  }
}, { deep: true })

// Methods
const generateLayout = () => {
  if (!qrMatrix.value) return
  
  generating.value = true
  
  // Use setTimeout to allow UI to update
  setTimeout(() => {
    try {
      legoLayout.value = convertToLegoLayout(qrMatrix.value!, currentScale.value)
      brickCount.value = calculateBrickCount(legoLayout.value)
      optimizedBrickCount.value = optimizeBrickLayout(legoLayout.value)
    } catch (error) {
      console.error('Error generating layout:', error)
    } finally {
      generating.value = false
    }
  }, 100)
}

const handleScaleChange = (newScale: number) => {
  currentScale.value = newScale
  if (qrMatrix.value) {
    legoLayout.value = convertToLegoLayout(qrMatrix.value, newScale)
    brickCount.value = calculateBrickCount(legoLayout.value)
    optimizedBrickCount.value = optimizeBrickLayout(legoLayout.value)
  }
}
</script>
