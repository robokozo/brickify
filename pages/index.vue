<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">🧱 LEGO WiFi QR Code Builder</h1>
      <p class="app-subtitle">Generate LEGO building instructions for WiFi QR codes</p>
    </header>

    <main class="app-main">
      <div class="workflow-steps">
        <!-- Step 1: WiFi Configuration -->
        <section class="step" :class="{ 'step-active': currentStep >= 1 }">
          <div class="step-number">1</div>
          <WifiForm 
            v-model="wifiConfig"
            @valid="wifiValid = $event"
          />
        </section>

        <!-- Step 2: Baseplate Configuration -->
        <section v-if="wifiValid" class="step" :class="{ 'step-active': currentStep >= 2 }">
          <div class="step-number">2</div>
          <BaseplateConfig
            v-model="baseplateConfig"
            :qr-size="qrSize"
            :max-scale="maxScale"
          />
        </section>

        <!-- Step 3: Color Selection -->
        <section v-if="wifiValid && qrMatrix" class="step" :class="{ 'step-active': currentStep >= 3 }">
          <div class="step-number">3</div>
          <ColorPicker
            v-model:foreground="foregroundColor"
            v-model:background="backgroundColor"
          />
        </section>

        <!-- Step 4: Generate Button -->
        <section v-if="wifiValid && qrMatrix" class="step">
          <button 
            class="generate-button"
            :disabled="generating"
            @click="generateLayout"
          >
            {{ generating ? '⏳ Generating...' : '🎯 Generate LEGO Instructions' }}
          </button>
        </section>

        <!-- Step 5: Results -->
        <section v-if="legoLayout" class="results-section">
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
            :foreground="foregroundColor"
            :background="backgroundColor"
          />
        </section>
      </div>
    </main>

    <footer class="app-footer">
      <p>Built with Nuxt.js 3 • Open Source on <a href="https://github.com/robokozo/lego-wifi-qr-builder" target="_blank">GitHub</a></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WiFiConfig } from '~/composables/useQRCode'
import type { BaseplateConfig, LegoLayout, BrickCount } from '~/composables/useLegoConverter'

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
const { getMaxScale, convertToLegoLayout, calculateBrickCount } = useLegoConverter()

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
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.app-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  position: relative;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.step-active {
  opacity: 1;
}

.step-number {
  position: absolute;
  top: -15px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.generate-button {
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-footer {
  text-align: center;
  margin-top: 3rem;
  padding: 2rem 0;
  color: white;
  opacity: 0.9;
}

.app-footer p {
  margin: 0;
}

.app-footer a {
  color: white;
  text-decoration: underline;
}

.app-footer a:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem 0.5rem;
  }

  .app-title {
    font-size: 1.8rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .step-number {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .generate-button {
    font-size: 1.1rem;
  }
}
</style>
