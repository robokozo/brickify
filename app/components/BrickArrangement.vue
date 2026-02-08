<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Brick } from '~/composables/useBrickConverter'

const props = withDefaults(defineProps<{
  grid: boolean[][]
  qrSize: number
  foreground: string
  background: string
  baseplateWidth: number
  baseplateHeight: number
  bricks?: Brick[]
  foregroundPieceType?: 'Plate' | 'Tile'
  backgroundPieceType?: 'Plate' | 'Tile'
  useBaseplate?: boolean
  baseplateColor?: string
}>(), {
  foregroundPieceType: 'Plate',
  backgroundPieceType: 'Tile',
  useBaseplate: false,
  baseplateColor: '#FFFFFF'
})

const totalSize = computed(() => props.grid.length)

const fitsOnBaseplate = computed(() => {
  return totalSize.value <= props.baseplateWidth &&
    totalSize.value <= props.baseplateHeight
})

const showForegroundStuds = computed(() => props.foregroundPieceType === 'Plate')
const showBackgroundStuds = computed(() => props.backgroundPieceType === 'Plate')

// Alignment options
type Alignment = 'tl' | 't' | 'tr' | 'l' | 'c' | 'r' | 'bl' | 'b' | 'br'
const alignment = ref<Alignment>('c')

const alignmentLabels: Record<Alignment, string> = {
  tl: '↖', t: '↑', tr: '↗',
  l: '←', c: '•', r: '→',
  bl: '↙', b: '↓', br: '↘'
}

// Calculate position based on alignment
const availableSpaceX = computed(() => props.baseplateWidth - totalSize.value)
const availableSpaceY = computed(() => props.baseplateHeight - totalSize.value)
const canFit = computed(() => availableSpaceX.value >= 0 && availableSpaceY.value >= 0)

const offsetX = computed(() => {
  if (availableSpaceX.value < 0) return 0
  const align = alignment.value
  if (align === 'tl' || align === 'l' || align === 'bl') return 0
  if (align === 'tr' || align === 'r' || align === 'br') return availableSpaceX.value
  return Math.floor(availableSpaceX.value / 2) // center
})

const offsetY = computed(() => {
  if (availableSpaceY.value < 0) return 0
  const align = alignment.value
  if (align === 'tl' || align === 't' || align === 'tr') return 0
  if (align === 'bl' || align === 'b' || align === 'br') return availableSpaceY.value
  return Math.floor(availableSpaceY.value / 2) // center
})

// Starting stud coordinates (1-based for display)
const startX = computed(() => offsetX.value + 1)
const startY = computed(() => offsetY.value + 1)

// Baseplate display sizing
const maxDisplaySize = 500
const studSize = computed(() => Math.floor(maxDisplaySize / props.baseplateWidth))
const baseplateDisplaySize = computed(() => studSize.value * props.baseplateWidth)

// Baseplate color for visualization
const displayBaseplateColor = computed(() => props.useBaseplate ? props.background : props.baseplateColor)

// Ruler markers - show every 5 studs, with major marks at 10
const markerInterval = 5
const rulerMarkers = computed(() => {
  const markers: Array<number> = []
  for (let i = markerInterval; i <= props.baseplateWidth; i += markerInterval) {
    markers.push(i)
  }
  return markers
})
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="m-0 mb-6 text-gray-800 text-2xl font-semibold">🧱 Brick Arrangement</h2>

    <div v-if="!fitsOnBaseplate"
      class="p-3 mb-4 bg-amber-100 border-l-4 border-amber-500 rounded text-amber-800 text-sm">
      ⚠️ Warning: QR code ({{ totalSize }}×{{ totalSize }}) exceeds your baseplate dimensions ({{ baseplateWidth }}×{{
        baseplateHeight }})
    </div>

    <!-- Baseplate visualization with QR positioned on it -->
    <div class="flex justify-center mb-6 overflow-auto p-4 bg-gray-100 rounded-md">
      <div class="relative">
        <!-- Top ruler -->
        <div class="relative mb-1"
          :style="{ height: '16px', marginLeft: '20px', marginRight: '20px', width: `${baseplateDisplaySize}px` }">
          <div v-for="marker in rulerMarkers" :key="'top-' + marker"
            class="absolute text-xs text-gray-500 font-mono text-center" :class="marker % 10 === 0 ? 'font-bold' : ''"
            :style="{ left: `${marker * studSize - 8}px`, width: '16px' }">
            {{ marker }}
          </div>
        </div>

        <div class="flex">
          <!-- Left ruler -->
          <div class="relative mr-1" :style="{ width: '20px', height: `${baseplateDisplaySize}px` }">
            <div v-for="marker in rulerMarkers" :key="'left-' + marker"
              class="absolute text-xs text-gray-500 font-mono text-right pr-1"
              :class="marker % 10 === 0 ? 'font-bold' : ''"
              :style="{ top: `${marker * studSize - 8}px`, width: '20px' }">
              {{ marker }}
            </div>
          </div>

          <!-- Baseplate -->
          <div class="relative" :style="{
            width: `${baseplateDisplaySize}px`,
            height: `${baseplateDisplaySize}px`,
            background: displayBaseplateColor
          }">
            <!-- Baseplate stud grid -->
            <div class="absolute inset-0 grid" :style="{
              gridTemplateColumns: `repeat(${baseplateWidth}, 1fr)`,
              gridTemplateRows: `repeat(${baseplateHeight}, 1fr)`
            }">
              <div v-for="i in baseplateWidth * baseplateHeight" :key="i" class="flex items-center justify-center">
                <div class="rounded-full bg-black/10" :style="{
                  width: `${studSize * 0.6}px`,
                  height: `${studSize * 0.6}px`
                }" />
              </div>
            </div>

            <!-- QR code positioned on baseplate -->
            <div v-if="bricks && bricks.length > 0" class="absolute" :style="{
              left: `${offsetX * studSize}px`,
              top: `${offsetY * studSize}px`,
              width: `${totalSize * studSize}px`,
              height: `${totalSize * studSize}px`
            }">
              <BrickQRDisplayWithToggle :bricks="bricks" :grid-size="totalSize" :foreground="foreground"
                :background="background" :max-size="totalSize * studSize" :show-foreground-studs="showForegroundStuds"
                :show-background-studs="showBackgroundStuds" :use-baseplate="useBaseplate" />
            </div>

            <!-- Alignment indicator border -->
            <div v-if="canFit" class="absolute pointer-events-none" :style="{
              left: `${offsetX * studSize - 2}px`,
              top: `${offsetY * studSize - 2}px`,
              width: `${totalSize * studSize + 4}px`,
              height: `${totalSize * studSize + 4}px`,
              border: '2px dashed rgba(59, 130, 246, 0.5)'
            }" />
          </div>

          <!-- Right ruler -->
          <div class="relative ml-1" :style="{ width: '20px', height: `${baseplateDisplaySize}px` }">
            <div v-for="marker in rulerMarkers" :key="'right-' + marker"
              class="absolute text-xs text-gray-500 font-mono text-left pl-1"
              :class="marker % 10 === 0 ? 'font-bold' : ''"
              :style="{ top: `${marker * studSize - 8}px`, width: '20px' }">
              {{ marker }}
            </div>
          </div>
        </div>

        <!-- Bottom ruler -->
        <div class="relative mt-1"
          :style="{ height: '16px', marginLeft: '20px', marginRight: '20px', width: `${baseplateDisplaySize}px` }">
          <div v-for="marker in rulerMarkers" :key="'bottom-' + marker"
            class="absolute text-xs text-gray-500 font-mono text-center" :class="marker % 10 === 0 ? 'font-bold' : ''"
            :style="{ left: `${marker * studSize - 8}px`, width: '16px' }">
            {{ marker }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-6 items-center">
      <!-- Alignment selector -->
      <div class="shrink-0">
        <label class="block mb-2 text-gray-700 font-medium text-sm">Alignment</label>
        <div class="grid grid-cols-3 gap-1 bg-gray-200 p-1 rounded-lg">
          <button v-for="pos in (['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'] as Alignment[])" :key="pos"
            @click="alignment = pos"
            class="w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors"
            :class="alignment === pos ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'">
            {{ alignmentLabels[pos] }}
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 p-4 bg-blue-50 border-l-4 border-blue-500 rounded space-y-1">
        <p class="my-0 text-gray-800 text-sm"><strong class="text-blue-800">Baseplate:</strong> {{ baseplateWidth }}×{{
          baseplateHeight }} studs</p>
        <p class="my-0 text-gray-800 text-sm"><strong class="text-blue-800">QR Size:</strong> {{ totalSize }}×{{
          totalSize }} studs</p>
        <p v-if="canFit" class="my-0 text-gray-800 text-sm">
          <strong class="text-blue-800">Start at:</strong>
          Column {{ startX }}, Row {{ startY }}
        </p>
      </div>
    </div>
  </div>
</template>