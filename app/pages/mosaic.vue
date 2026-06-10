<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMosaicConverter } from '~/composables/useMosaicConverter'
import { useBrickConverter } from '~/composables/useBrickConverter'
import type { MosaicColorGroup, MosaicResult } from '~/composables/useMosaicConverter'
import MosaicUpload from '~/components/MosaicUpload.vue'
import MosaicImageEditor from '~/components/MosaicImageEditor.vue'
import MosaicSettings from '~/components/MosaicSettings.vue'
import MosaicPreview from '~/components/MosaicPreview.vue'
import MosaicPartsList from '~/components/MosaicPartsList.vue'
import BuildingInstructions from '~/components/BuildingInstructions.vue'

const { convertImageToColorGrid, generateMosaicPartsList } = useMosaicConverter()
const { defaultBrickSizes } = useBrickConverter()

const REGEN_DEBOUNCE_MS = 250

// What the user uploaded (drives the editor) vs the cropped/filtered result
// the mosaic is generated from
const originalFile = ref<File | null>(null)
const imageFile = ref<File | null>(null)
const useDithering = ref(false)
const pieceType = ref<'Plate' | 'Tile'>('Plate')
const panelCols = ref(1)
const panelRows = ref(1)
const baseplateColorId = ref<string | null>(null)
const colorGrid = ref<string[][] | null>(null)
// Panel layout the current colorGrid was generated with, which keeps the preview
// consistent while a regeneration with new settings is still in flight
const generatedPanelCols = ref(1)
const generatedPanelRows = ref(1)
const isProcessing = ref(false)
const error = ref<string | null>(null)

const rawColorGroups = computed<MosaicColorGroup[] | null>(() => {
  if (colorGrid.value === null) return null
  return generateMosaicPartsList({
    colorGrid: colorGrid.value,
    brickSizes: defaultBrickSizes,
    panelCols: generatedPanelCols.value,
    panelRows: generatedPanelRows.value,
  })
})

// Pieces matching the baseplate color are not placed (the baseplate shows
// through), so they are excluded from the preview, parts list, and steps
const baseplateGroup = computed<MosaicColorGroup | null>(() =>
  rawColorGroups.value?.find((g) => g.colorId === baseplateColorId.value) ?? null,
)

const baseplateOptions = computed(() =>
  rawColorGroups.value?.map((g) => ({
    id: g.colorId,
    name: g.color.name,
    hex: g.color.hex,
    total: g.total,
  })) ?? [],
)

// Drop a stale selection when a new image/layout no longer contains the color
watch(rawColorGroups, (groups) => {
  if (baseplateColorId.value === null || groups === null) return
  if (groups.some((g) => g.colorId === baseplateColorId.value) === false) {
    baseplateColorId.value = null
  }
})

const mosaicResult = computed<MosaicResult | null>(() => {
  if (colorGrid.value === null || rawColorGroups.value === null) return null
  const colorGroups = rawColorGroups.value.filter((g) => g.colorId !== baseplateColorId.value)
  const totalPieces = colorGroups.reduce((sum, g) => sum + g.total, 0)
  return { colorGrid: colorGrid.value, colorGroups, totalPieces }
})

const allMosaicBricks = computed(() =>
  mosaicResult.value?.colorGroups.flatMap((g) => g.positionedBricks) ?? [],
)

const generate = async (): Promise<void> => {
  if (imageFile.value === null) return
  isProcessing.value = true
  error.value = null
  const cols = panelCols.value
  const rows = panelRows.value
  try {
    colorGrid.value = await convertImageToColorGrid({
      imageFile: imageFile.value,
      useDithering: useDithering.value,
      panelCols: cols,
      panelRows: rows,
    })
    generatedPanelCols.value = cols
    generatedPanelRows.value = rows
  } catch (err) {
    error.value = 'Failed to process image. Please try a different file.'
    colorGrid.value = null
    console.error(err)
  } finally {
    isProcessing.value = false
  }
}

// Regenerate automatically whenever the image or a setting that affects
// sampling changes (pieceType only affects display, not sampling)
let regenTimer: ReturnType<typeof setTimeout> | null = null

watch([imageFile, useDithering, panelCols, panelRows], () => {
  if (imageFile.value === null) return
  if (regenTimer !== null) clearTimeout(regenTimer)
  regenTimer = setTimeout(() => {
    regenTimer = null
    void generate()
  }, REGEN_DEBOUNCE_MS)
})

onUnmounted(() => {
  if (regenTimer !== null) clearTimeout(regenTimer)
})

const onImageUpload = (file: File): void => {
  originalFile.value = file
  error.value = null
}

// The editor emits a freshly rendered crop/filter result; the mosaic always
// generates from that
const onImageProcessed = (file: File): void => {
  imageFile.value = file
  error.value = null
}
</script>

<template>
  <UContainer class="py-8 max-w-7xl">
    <header class="mb-8">
      <h1 class="text-3xl font-black text-gray-900">
        🧱 Brick Mosaic Builder
      </h1>
      <p class="text-gray-600 font-semibold mt-1">
        Upload a photo and get building instructions for your brick mosaic
      </p>
    </header>

    <div class="grid gap-6 items-start lg:grid-cols-[360px_minmax(0,1fr)]">
      <!-- Left column: controls -->
      <div class="space-y-6 lg:sticky lg:top-20">
        <MosaicUpload @upload="onImageUpload" />
        <MosaicImageEditor v-if="originalFile !== null" :file="originalFile" :panel-cols="panelCols"
          :panel-rows="panelRows" @processed="onImageProcessed" />
        <MosaicSettings v-if="originalFile !== null" v-model:use-dithering="useDithering" v-model:piece-type="pieceType"
          v-model:panel-cols="panelCols" v-model:panel-rows="panelRows"
          v-model:baseplate-color-id="baseplateColorId" :baseplate-options="baseplateOptions" />
      </div>

      <!-- Right column: results -->
      <div class="space-y-6 min-w-0">
        <!-- Error -->
        <div v-if="error !== null" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Empty state -->
        <div v-if="colorGrid === null && isProcessing === false && error === null"
          class="brick-card px-8 py-16 text-center">
          <p class="text-6xl mb-4">🖼️</p>
          <h2 class="text-xl font-extrabold text-gray-900 mb-2">Your mosaic will appear here</h2>
          <p class="text-gray-500 max-w-md mx-auto">
            Upload a photo on the left to generate a 3D brick mosaic preview, a parts list, and
            step-by-step building instructions.
          </p>
        </div>

        <!-- First-generation loading state -->
        <div v-if="colorGrid === null && isProcessing === true"
          class="brick-card px-8 py-16 flex items-center justify-center gap-3 text-brick-blue font-bold">
          <span class="animate-spin text-2xl">⏳</span>
          Building your mosaic…
        </div>

        <!-- Results -->
        <template v-if="colorGrid !== null && mosaicResult !== null">
          <div class="relative">
            <MosaicPreview :bricks="allMosaicBricks" :show-studs="pieceType === 'Plate'"
              :panel-cols="generatedPanelCols" :panel-rows="generatedPanelRows"
              :baseplate-color="baseplateGroup?.color.hex ?? null" />
            <!-- Updating overlay during regeneration -->
            <div v-if="isProcessing === true"
              class="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
              <span class="flex items-center gap-2 text-brick-blue font-medium bg-white px-4 py-2 rounded-full shadow">
                <span class="animate-spin">⏳</span> Updating…
              </span>
            </div>
          </div>
          <MosaicPartsList :color-groups="mosaicResult.colorGroups" :total-pieces="mosaicResult.totalPieces"
            :piece-type="pieceType" :baseplate-color="baseplateGroup?.color ?? null"
            :baseplate-savings="baseplateGroup?.total ?? 0" />
          <BuildingInstructions :bricks="allMosaicBricks" :show-studs="pieceType === 'Plate'" :piece-type="pieceType"
            :panel-cols="generatedPanelCols" :panel-rows="generatedPanelRows"
            :baseplate-color="baseplateGroup?.color.hex" />
        </template>
      </div>
    </div>
  </UContainer>
</template>
