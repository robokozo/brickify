<template>
  <UContainer class="py-8">
    <header class="text-center text-blue-900 mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-3">
        🧱 Brick QR Code Builder
      </h1>
      <p class="text-lg md:text-xl opacity-95">
        Choose a QR code type, fill in the details, and get brick building instructions
      </p>
    </header>
    <main class="space-y-6">
      <!-- Step 1: QR Type Selection -->
      <QrTypeSelector v-model="selectedType" />
      <!-- Step 2: Type-specific form -->
      <component :is="formComponents[selectedType]" :model-value="currentModel" @update:model-value="updateCurrentModel"
        @valid="isFormValid = $event" />
      <!-- Step 3: Generate QR Code Button -->
      <div v-if="isFormValid === true && qrMatrix === null">
        <button
          class="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          @click="generateQR">
          📱 Generate QR Code
        </button>
      </div>
      <!-- Step 4: Setup (only shown after QR is generated) -->
      <ColorPicker v-if="qrMatrix !== null" v-model:foreground="foregroundColor" v-model:background="backgroundColor"
        v-model:foreground-piece-type="foregroundPieceType" v-model:background-piece-type="backgroundPieceType"
        v-model:foreground-brick-sizes="foregroundBrickSizes" v-model:background-brick-sizes="backgroundBrickSizes"
        v-model:use-baseplate="useBaseplate" v-model:baseplate-size="baseplateSize"
        v-model:baseplate-color="baseplateColor" />
      <!-- Results (shown when QR is generated) -->
      <div v-if="qrMatrix !== null && brickLayout !== null" class="space-y-6">
        <BrickArrangement :grid="brickLayout.grid" :qr-size="qrSize" :foreground="foregroundColor"
          :background="backgroundColor" :baseplate-width="baseplateSize" :baseplate-height="baseplateSize"
          :bricks="optimizedBrickCount?.bricks" :foreground-piece-type="foregroundPieceType"
          :background-piece-type="backgroundPieceType" :use-baseplate="useBaseplate"
          :baseplate-color="baseplateColor" />
        <BrickList :brick-count="brickCount" :optimized-brick-count="optimizedBrickCount" :foreground="foregroundColor"
          :background="backgroundColor" :foreground-piece-type="foregroundPieceType"
          :background-piece-type="backgroundPieceType" :use-baseplate="useBaseplate" :qr-type-label="qrTypeLabel" />
        <BuildingInstructions v-if="optimizedBrickCount !== null" :bricks="optimizedBrickCount.bricks"
          :grid-size="qrSize" :foreground="foregroundColor" :background="backgroundColor"
          :show-studs="foregroundPieceType === 'Plate'" :piece-type="foregroundPieceType" />
      </div>
    </main>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import type { Component } from 'vue'
import type { BrickLayout, BrickCount, OptimizedBrickCount, BrickSize } from '~/composables/useBrickConverter'
import type { QrContentType, QrConfig, WifiConfig, UrlConfig, TextConfig, EmailConfig, PhoneConfig, SmsConfig, GeoConfig } from '~/composables/useQrPayloads'
import { useQrPayloads, QR_TYPE_LIST } from '~/composables/useQrPayloads'
import WifiForm from '~/components/WifiForm.vue'
import UrlForm from '~/components/UrlForm.vue'
import TextForm from '~/components/TextForm.vue'
import EmailForm from '~/components/EmailForm.vue'
import PhoneForm from '~/components/PhoneForm.vue'
import SmsForm from '~/components/SmsForm.vue'
import GeoForm from '~/components/GeoForm.vue'
import QrTypeSelector from '~/components/QrTypeSelector.vue'
import BuildingInstructions from '~/components/BuildingInstructions.vue'

const { generateQRMatrix, getQRCodeSize } = useQRCode()
const { convertToBrickLayout, calculateBrickCount, optimizeBrickLayout, defaultBrickSizes } = useBrickConverter()
const { buildPayload } = useQrPayloads()

// --- QR type state ---
const selectedType = ref<QrContentType>('wifi')
const isFormValid = ref(false)

interface QrModels {
  wifi: WifiConfig
  url: UrlConfig
  text: TextConfig
  email: EmailConfig
  phone: PhoneConfig
  sms: SmsConfig
  geo: GeoConfig
}

const models = reactive<QrModels>({
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
  url: { url: '' },
  text: { text: '' },
  email: { address: '', subject: '', body: '' },
  phone: { phone: '' },
  sms: { phone: '', message: '' },
  geo: { latitude: '', longitude: '', query: '' },
})

const formComponents: Record<QrContentType, Component> = {
  wifi: WifiForm,
  url: UrlForm,
  text: TextForm,
  email: EmailForm,
  phone: PhoneForm,
  sms: SmsForm,
  geo: GeoForm,
}

const currentModel = computed(() => models[selectedType.value] as QrConfig)

const updateCurrentModel = (value: QrConfig): void => {
  ; (models as Record<string, QrConfig>)[selectedType.value] = value
}

const qrTypeInfo = computed(() => QR_TYPE_LIST.find((t) => t.type === selectedType.value) ?? null)
const qrTypeLabel = computed(() =>
  qrTypeInfo.value !== null ? `${qrTypeInfo.value.icon} ${qrTypeInfo.value.label}` : 'QR Code',
)

watch(selectedType, () => {
  qrMatrix.value = null
  isFormValid.value = false
})

// --- Brick setup ---
const baseplateSize = ref(48)
const baseplateColor = ref('#FFFFFF')
const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')
const foregroundBrickSizes = ref<BrickSize[]>([...defaultBrickSizes])
const backgroundBrickSizes = ref<BrickSize[]>([...defaultBrickSizes])
const foregroundPieceType = ref<'Plate' | 'Tile'>('Plate')
const backgroundPieceType = ref<'Plate' | 'Tile'>('Tile')
const useBaseplate = ref(false)

// --- QR matrix ---
const qrMatrix = ref<boolean[][] | null>(null)
const qrSize = computed(() => qrMatrix.value !== null ? getQRCodeSize(qrMatrix.value) : 0)
const brickLayout = computed<BrickLayout | null>(() =>
  qrMatrix.value !== null ? convertToBrickLayout(qrMatrix.value, 1) : null,
)
const brickCount = computed<BrickCount>(() =>
  brickLayout.value !== null ? calculateBrickCount(brickLayout.value) : { foreground: 0, background: 0, total: 0 },
)
const optimizedBrickCount = computed<OptimizedBrickCount | null>(() =>
  brickLayout.value !== null
    ? optimizeBrickLayout(brickLayout.value, foregroundBrickSizes.value, backgroundBrickSizes.value)
    : null,
)

const generateQR = async (): Promise<void> => {
  if (isFormValid.value !== true) return
  try {
    const payload = buildPayload({ type: selectedType.value, config: currentModel.value })
    qrMatrix.value = await generateQRMatrix({ payload, errorCorrectionLevel: 'H' })
  } catch (error) {
    console.error('Error generating QR code:', error)
    qrMatrix.value = null
  }
}
</script>
