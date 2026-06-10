<template>
  <UContainer class="py-8 max-w-7xl">
    <header class="mb-8">
      <h1 class="text-3xl font-black text-gray-900">
        🧱 Brick QR Code Builder
      </h1>
      <p class="text-gray-600 font-semibold mt-1">
        Pick a QR code type, fill in the details, and your brick build appears automatically
      </p>
    </header>

    <div class="grid gap-6 items-start lg:grid-cols-[360px_minmax(0,1fr)]">
      <!-- Left column: controls -->
      <!-- Not sticky: this column is taller than the viewport once setup cards appear -->
      <div class="space-y-6">
        <QrTypeSelector v-model="selectedType" />
        <component :is="formComponents[selectedType]" :model-value="currentModel"
          @update:model-value="updateCurrentModel" @valid="isFormValid = $event" />
        <ColorPicker v-if="qrMatrix !== null" v-model:foreground="foregroundColor" v-model:background="backgroundColor"
          v-model:foreground-piece-type="foregroundPieceType" v-model:background-piece-type="backgroundPieceType"
          v-model:foreground-brick-sizes="foregroundBrickSizes" v-model:background-brick-sizes="backgroundBrickSizes"
          v-model:use-baseplate="useBaseplate" v-model:baseplate-size="baseplateSize"
          v-model:baseplate-color="baseplateColor" />
      </div>

      <!-- Right column: results -->
      <div class="space-y-6 min-w-0">
        <!-- Empty state -->
        <div v-if="qrMatrix === null || brickLayout === null" class="brick-card px-8 py-16 text-center">
          <p class="text-6xl mb-4">📱</p>
          <h2 class="text-xl font-extrabold text-gray-900 mb-2">Your brick QR code will appear here</h2>
          <p class="text-gray-500 max-w-md mx-auto">
            Pick a type and fill in the form on the left to generate a 3D brick preview, a parts list, and
            step-by-step building instructions.
          </p>
        </div>

        <!-- Results -->
        <template v-else>
          <!-- Scan check -->
          <div v-if="scanCheck !== null" class="px-4 py-3 rounded-lg border text-sm font-medium flex items-start gap-2"
            :class="scanCheck.scannable
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'">
            <span class="text-base leading-5">{{ scanCheck.scannable ? '✅' : '🚫' }}</span>
            <span><strong>Scan check:</strong> {{ scanCheck.message }}</span>
          </div>

          <BrickArrangement :grid="brickLayout.grid" :qr-size="qrSize" :foreground="foregroundColor"
            :background="backgroundColor" :baseplate-width="baseplateSize" :baseplate-height="baseplateSize"
            :bricks="optimizedBrickCount?.bricks" :foreground-piece-type="foregroundPieceType"
            :background-piece-type="backgroundPieceType" :use-baseplate="useBaseplate"
            :baseplate-color="baseplateColor" />
          <BrickList :brick-count="brickCount" :optimized-brick-count="optimizedBrickCount"
            :foreground="foregroundColor" :background="backgroundColor"
            :foreground-piece-type="foregroundPieceType" :background-piece-type="backgroundPieceType"
            :use-baseplate="useBaseplate" :qr-type-label="qrTypeLabel" />
          <BuildingInstructions v-if="optimizedBrickCount !== null" :bricks="optimizedBrickCount.bricks"
            :grid-size="qrSize" :foreground="foregroundColor" :background="backgroundColor"
            :show-studs="foregroundPieceType === 'Plate'" :piece-type="foregroundPieceType" />
        </template>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue'
import type { Component } from 'vue'
import type { BrickLayout, BrickCount, OptimizedBrickCount, BrickSize } from '~/composables/useBrickConverter'
import type { ScanCheckResult } from '~/composables/useScanCheck'
import { useScanCheck } from '~/composables/useScanCheck'
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
const { checkScannability } = useScanCheck()
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
    lastPayload.value = payload
  } catch (error) {
    console.error('Error generating QR code:', error)
    qrMatrix.value = null
  }
}

// --- Scan check: simulate a phone scan of the current colors and style ---
const lastPayload = ref('')
const scanCheck = ref<ScanCheckResult | null>(null)
const SCAN_CHECK_DEBOUNCE_MS = 350
let scanTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [qrMatrix, foregroundColor, backgroundColor],
  () => {
    if (scanTimer !== null) clearTimeout(scanTimer)
    if (qrMatrix.value === null) {
      scanCheck.value = null
      return
    }
    scanTimer = setTimeout(() => {
      scanTimer = null
      if (qrMatrix.value === null) return
      scanCheck.value = checkScannability({
        matrix: qrMatrix.value,
        foreground: foregroundColor.value,
        background: backgroundColor.value,
        payload: lastPayload.value,
      })
    }, SCAN_CHECK_DEBOUNCE_MS)
  },
  { immediate: true },
)

// Regenerate automatically as the form changes so the QR never goes stale
const AUTO_GENERATE_DEBOUNCE_MS = 400
let genTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [isFormValid, () => JSON.stringify(currentModel.value)],
  () => {
    if (genTimer !== null) clearTimeout(genTimer)
    if (isFormValid.value !== true) {
      qrMatrix.value = null
      return
    }
    genTimer = setTimeout(() => {
      genTimer = null
      void generateQR()
    }, AUTO_GENERATE_DEBOUNCE_MS)
  },
)

onUnmounted(() => {
  if (genTimer !== null) clearTimeout(genTimer)
  if (scanTimer !== null) clearTimeout(scanTimer)
})
</script>
