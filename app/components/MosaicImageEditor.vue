<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useTemplateRef } from 'vue'
import BrickCard from '~/components/BrickCard.vue'

const props = defineProps<{
  file: File
  panelCols: number
  panelRows: number
}>()

const emit = defineEmits<{
  (e: 'processed', file: File): void
}>()

// --- Adjustment state ---
// zoom = 1 means "cover" (fill the crop frame); below 1 fits more of the
// image with white letterboxing, preserving aspect ratio
const zoom = ref(1)
const tx = ref(0)
const ty = ref(0)

type FilterId = 'none' | 'bw' | 'sepia' | 'vivid'
const filter = ref<FilterId>('none')

const FILTERS: Array<{ id: FilterId; label: string; css: string }> = [
  { id: 'none', label: 'None', css: 'none' },
  { id: 'bw', label: '⚫ B&W', css: 'grayscale(1)' },
  { id: 'sepia', label: '🟤 Sepia', css: 'sepia(0.9)' },
  { id: 'vivid', label: '🌈 Vivid', css: 'saturate(1.6) contrast(1.08)' },
]

const filterCss = computed(() => FILTERS.find((f) => f.id === filter.value)?.css ?? 'none')

// --- Image loading ---
const imageUrl = ref<string | null>(null)
const imageEl = ref<HTMLImageElement | null>(null)

watch(
  () => props.file,
  (file) => {
    if (imageUrl.value !== null) URL.revokeObjectURL(imageUrl.value)
    imageUrl.value = URL.createObjectURL(file)
    imageEl.value = null
    zoom.value = 1
    tx.value = 0
    ty.value = 0
    filter.value = 'none'
    const img = new Image()
    img.onload = () => {
      imageEl.value = img
    }
    img.src = imageUrl.value
  },
  { immediate: true },
)

// --- Crop frame measurement (its aspect follows the panel layout) ---
const cropArea = useTemplateRef<HTMLDivElement>('cropArea')
const containerSize = ref({ w: 0, h: 0 })
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (rect !== undefined) containerSize.value = { w: rect.width, h: rect.height }
  })
  if (cropArea.value !== null) resizeObserver.observe(cropArea.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (imageUrl.value !== null) URL.revokeObjectURL(imageUrl.value)
})

// --- Geometry ---
const coverScale = computed(() => {
  const img = imageEl.value
  const { w, h } = containerSize.value
  if (img === null || w === 0 || h === 0) return 1
  return Math.max(w / img.naturalWidth, h / img.naturalHeight)
})

const containScale = computed(() => {
  const img = imageEl.value
  const { w, h } = containerSize.value
  if (img === null || w === 0 || h === 0) return 1
  return Math.min(w / img.naturalWidth, h / img.naturalHeight)
})

// Zooming out stops once the whole image fits in the frame
const minZoom = computed(() =>
  coverScale.value > 0 ? Math.min(1, containScale.value / coverScale.value) : 1,
)

const scale = computed(() => coverScale.value * zoom.value)

const clampPan = (): void => {
  const img = imageEl.value
  if (img === null) return
  const { w, h } = containerSize.value
  const maxTx = Math.abs(img.naturalWidth * scale.value - w) / 2
  const maxTy = Math.abs(img.naturalHeight * scale.value - h) / 2
  tx.value = Math.max(-maxTx, Math.min(maxTx, tx.value))
  ty.value = Math.max(-maxTy, Math.min(maxTy, ty.value))
}

watch([zoom, containerSize, imageEl], clampPan)
watch(minZoom, (min) => {
  if (zoom.value < min) zoom.value = min
})

// --- Drag to reposition ---
let dragStart: { x: number; y: number; tx: number; ty: number } | null = null

const onPointerDown = (event: PointerEvent): void => {
  dragStart = { x: event.clientX, y: event.clientY, tx: tx.value, ty: ty.value }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

const onPointerMove = (event: PointerEvent): void => {
  if (dragStart === null) return
  tx.value = dragStart.tx + (event.clientX - dragStart.x)
  ty.value = dragStart.ty + (event.clientY - dragStart.y)
  clampPan()
}

const onPointerUp = (): void => {
  dragStart = null
}

const resetAdjustments = (): void => {
  zoom.value = 1
  tx.value = 0
  ty.value = 0
  filter.value = 'none'
}

// --- Output rendering ---
// The mosaic samples 48×48 per panel, so 240px per panel is plenty
const OUTPUT_PX_PER_PANEL = 240
const RENDER_DEBOUNCE_MS = 300
let renderTimer: ReturnType<typeof setTimeout> | null = null

const renderAndEmit = (): void => {
  const img = imageEl.value
  const { w, h } = containerSize.value
  if (img === null || w === 0 || h === 0) return

  const outW = props.panelCols * OUTPUT_PX_PER_PANEL
  const outH = props.panelRows * OUTPUT_PX_PER_PANEL
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (ctx === null) return

  // White letterbox fill for when the image is zoomed out past "cover"
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, outW, outH)
  if (filterCss.value !== 'none') ctx.filter = filterCss.value

  // Map the visible frame into image pixels: a frame point c (centered
  // coordinates) shows image pixel (c - pan) / scale + imageCenter
  const s = scale.value
  const sx = (-w / 2 - tx.value) / s + img.naturalWidth / 2
  const sy = (-h / 2 - ty.value) / s + img.naturalHeight / 2
  ctx.drawImage(img, sx, sy, w / s, h / s, 0, 0, outW, outH)

  canvas.toBlob((blob) => {
    if (blob !== null) {
      emit('processed', new File([blob], 'adjusted.png', { type: 'image/png' }))
    }
  }, 'image/png')
}

watch(
  [imageEl, zoom, tx, ty, filter, () => props.panelCols, () => props.panelRows, containerSize],
  () => {
    if (renderTimer !== null) clearTimeout(renderTimer)
    renderTimer = setTimeout(() => {
      renderTimer = null
      renderAndEmit()
    }, RENDER_DEBOUNCE_MS)
  },
)

onUnmounted(() => {
  if (renderTimer !== null) clearTimeout(renderTimer)
})
</script>

<template>
  <BrickCard color="blue" title="✂️ Adjust Image">
    <div class="p-5 space-y-4">

      <!-- Crop frame (aspect follows the panel layout) -->
      <div ref="cropArea"
        class="relative w-full overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 cursor-move touch-none select-none"
        :style="{ aspectRatio: `${panelCols} / ${panelRows}` }" @pointerdown.prevent="onPointerDown"
        @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
        <img v-if="imageUrl !== null && imageEl !== null" :src="imageUrl" alt="Crop preview" draggable="false"
          class="absolute left-1/2 top-1/2 max-w-none pointer-events-none" :style="{
            width: `${imageEl.naturalWidth * scale}px`,
            height: `${imageEl.naturalHeight * scale}px`,
            transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`,
            filter: filterCss === 'none' ? undefined : filterCss,
          }" />
        <p
          class="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[11px] text-gray-600 bg-white/75 backdrop-blur px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap">
          Drag to reposition
        </p>
      </div>

      <!-- Zoom / resize -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="mosaic-zoom" class="text-sm font-medium text-gray-700">Zoom</label>
          <button type="button" class="text-xs font-semibold text-brick-blue hover:underline"
            @click="resetAdjustments">
            Reset
          </button>
        </div>
        <input id="mosaic-zoom" v-model.number="zoom" type="range" :min="minZoom" :max="3" :step="0.01"
          class="w-full accent-brick-blue cursor-pointer" />
        <p class="mt-0.5 text-xs text-gray-500">
          Zoom out to fit the whole image; white fills the leftover space
        </p>
      </div>

      <!-- Filters -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Filter</p>
        <div class="flex gap-2 flex-wrap">
          <button v-for="f in FILTERS" :key="f.id" type="button" :class="[
            'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
            filter === f.id
              ? 'border-brick-blue bg-blue-50 text-brick-blue'
              : 'border-gray-200 text-gray-700 hover:border-brick-blue/50',
          ]" @click="filter = f.id">
            {{ f.label }}
          </button>
        </div>
      </div>

    </div>
  </BrickCard>
</template>
