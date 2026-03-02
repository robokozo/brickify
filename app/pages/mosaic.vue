<template>
  <UContainer class="py-8">
    <header class="text-center text-blue-900 mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-3">
        🧱 Brick Mosaic Builder
      </h1>
      <p class="text-lg md:text-xl opacity-95">
        Upload a photo and get brick building instructions for your LEGO mosaic
      </p>
    </header>

    <main class="space-y-6">
      <!-- Step 1: Upload -->
      <MosaicUpload @upload="onImageUpload" />

      <!-- Step 2: Settings (always visible once image selected) -->
      <MosaicSettings v-if="imageFile !== null" v-model:use-dithering="useDithering" v-model:piece-type="pieceType"
        v-model:panel-cols="panelCols" v-model:panel-rows="panelRows" />

      <!-- Step 3: Generate button -->
      <div v-if="imageFile !== null && isProcessing === false && colorGrid === null">
        <button
          class="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          @click="generate">
          🎨 Generate Mosaic
        </button>
      </div>

      <!-- Re-generate button (shown after result, if settings changed) -->
      <div v-if="imageFile !== null && colorGrid !== null && isProcessing === false">
        <button
          class="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-lg rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          @click="generate">
          🔄 Re-generate with Current Settings
        </button>
      </div>

      <!-- Processing indicator -->
      <div v-if="isProcessing === true" class="flex items-center justify-center gap-3 py-8 text-blue-700 font-medium">
        <span class="animate-spin text-2xl">⏳</span>
        Processing image…
      </div>

      <!-- Error -->
      <div v-if="error !== null" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Results -->
      <template v-if="colorGrid !== null && mosaicResult !== null">
        <MosaicPreview :color-grid="colorGrid" :show-studs="pieceType === 'Plate'" :panel-cols="panelCols"
          :panel-rows="panelRows" />
        <MosaicPartsList :color-groups="mosaicResult.colorGroups" :total-pieces="mosaicResult.totalPieces"
          :piece-type="pieceType" />
        <BuildingInstructions :bricks="allMosaicBricks" :show-studs="pieceType === 'Plate'" :piece-type="pieceType"
          :panel-cols="panelCols" :panel-rows="panelRows" />
      </template>
    </main>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMosaicConverter } from '~/composables/useMosaicConverter'
import { useBrickConverter } from '~/composables/useBrickConverter'
import type { MosaicResult } from '~/composables/useMosaicConverter'
import MosaicUpload from '~/components/MosaicUpload.vue'
import MosaicSettings from '~/components/MosaicSettings.vue'
import MosaicPreview from '~/components/MosaicPreview.vue'
import MosaicPartsList from '~/components/MosaicPartsList.vue'
import BuildingInstructions from '~/components/BuildingInstructions.vue'

const { convertImageToColorGrid, generateMosaicPartsList } = useMosaicConverter()
const { defaultBrickSizes } = useBrickConverter()

const imageFile = ref<File | null>(null)
const useDithering = ref(false)
const pieceType = ref<'Plate' | 'Tile'>('Plate')
const panelCols = ref(1)
const panelRows = ref(1)
const colorGrid = ref<string[][] | null>(null)
const isProcessing = ref(false)
const error = ref<string | null>(null)

const mosaicResult = computed<MosaicResult | null>(() => {
  if (colorGrid.value === null) return null
  const colorGroups = generateMosaicPartsList({
    colorGrid: colorGrid.value,
    brickSizes: defaultBrickSizes,
    panelCols: panelCols.value,
    panelRows: panelRows.value,
  })
  const totalPieces = colorGroups.reduce((sum, g) => sum + g.total, 0)
  return { colorGrid: colorGrid.value, colorGroups, totalPieces }
})

const allMosaicBricks = computed(() =>
  mosaicResult.value?.colorGroups.flatMap((g) => g.positionedBricks) ?? [],
)

const onImageUpload = (file: File): void => {
  imageFile.value = file
  colorGrid.value = null
  error.value = null
}

const generate = async (): Promise<void> => {
  if (imageFile.value === null) return
  isProcessing.value = true
  error.value = null
  colorGrid.value = null
  try {
    colorGrid.value = await convertImageToColorGrid({
      imageFile: imageFile.value,
      useDithering: useDithering.value,
      panelCols: panelCols.value,
      panelRows: panelRows.value,
    })
  } catch (err) {
    error.value = 'Failed to process image. Please try a different file.'
    console.error(err)
  } finally {
    isProcessing.value = false
  }
}
</script>
