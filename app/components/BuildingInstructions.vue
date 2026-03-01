<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Brick } from '~/composables/useBrickConverter'

const props = withDefaults(defineProps<{
  bricks: Brick[]
  gridSize: number
  foreground?: string
  background?: string
  showStuds?: boolean
  pieceType?: 'Plate' | 'Tile'
  rowBandSize?: number
}>(), {
  foreground: '#000000',
  background: '#FFFFFF',
  showStuds: true,
  pieceType: 'Plate',
  rowBandSize: 4,
})

const currentStep = ref(0)

// How many row-band steps cover the full grid
const totalSteps = computed(() => Math.ceil(props.gridSize / props.rowBandSize))

// Which step a given brick belongs to (keyed by its top row)
const stepIndexOf = (brick: Brick): number =>
  Math.floor(brick.y / props.rowBandSize)

// Bricks visible in the current step view
const pastBricks = computed(() =>
  props.bricks.filter((b) => stepIndexOf(b) < currentStep.value),
)
const currentBricks = computed(() =>
  props.bricks.filter((b) => stepIndexOf(b) === currentStep.value),
)

const goTo = (step: number): void => {
  currentStep.value = Math.max(0, Math.min(totalSteps.value - 1, step))
}

// --- Color helpers ---

const resolveColor = (brick: Brick): string => {
  if (brick.colorHex !== undefined && brick.colorHex !== null) return brick.colorHex
  return brick.isForeground === true ? props.foreground : props.background
}

const getStudColor = (hex: string): string => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  if (lum > 0.5) {
    return `rgb(${Math.round(r * 0.7)},${Math.round(g * 0.7)},${Math.round(b * 0.7)})`
  }
  return `rgb(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)})`
}

// --- Sizing ---

const cellSize = computed(() => {
  if (props.gridSize <= 32) return 14
  if (props.gridSize <= 48) return 10
  return 7
})

const containerPx = computed(() => props.gridSize * cellSize.value)

const brickStyle = (brick: Brick) => ({
  left: `${(brick.x / props.gridSize) * 100}%`,
  top: `${(brick.y / props.gridSize) * 100}%`,
  width: `${(brick.width / props.gridSize) * 100}%`,
  height: `${(brick.height / props.gridSize) * 100}%`,
  background: resolveColor(brick),
})

// Highlight band for current step
const bandStyle = computed(() => ({
  top: `${(currentStep.value * props.rowBandSize / props.gridSize) * 100}%`,
  height: `${(props.rowBandSize / props.gridSize) * 100}%`,
}))

// --- Per-step mini parts list ---

interface StepEntry {
  colorHex: string
  width: number
  height: number
  count: number
}

const stepEntries = computed((): StepEntry[] => {
  const map = new Map<string, StepEntry>()
  for (const brick of currentBricks.value) {
    const hex = resolveColor(brick)
    const key = `${hex}|${brick.width}|${brick.height}`
    const existing = map.get(key)
    if (existing !== undefined) {
      existing.count++
    } else {
      map.set(key, { colorHex: hex, width: brick.width, height: brick.height, count: 1 })
    }
  }
  // Sort: by color then by area desc
  return [...map.values()].sort((a, b) => {
    if (a.colorHex !== b.colorHex) return a.colorHex.localeCompare(b.colorHex)
    return (b.width * b.height) - (a.width * a.height)
  })
})

const textColorForHex = (hex: string): 'white' | 'black' => {
  const h = hex.replace('#', '')
  const lum = 0.2126 * (parseInt(h.slice(0, 2), 16) / 255)
    + 0.7152 * (parseInt(h.slice(2, 4), 16) / 255)
    + 0.0722 * (parseInt(h.slice(4, 6), 16) / 255)
  return lum > 0.4 ? 'black' : 'white'
}

const rowStart = computed(() => currentStep.value * props.rowBandSize + 1)
const rowEnd = computed(() => Math.min((currentStep.value + 1) * props.rowBandSize, props.gridSize))
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-2xl font-semibold text-gray-900">📖 Building Instructions</h2>
      <span class="text-sm text-gray-500">
        Rows {{ rowStart }}–{{ rowEnd }} of {{ gridSize }}
      </span>
    </div>

    <div class="p-6 space-y-5">
      <!-- Step navigation -->
      <div class="flex items-center gap-3">
        <button type="button" :disabled="currentStep === 0"
          class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          @click="goTo(currentStep - 1)">
          ← Prev
        </button>

        <!-- Step pills -->
        <div class="flex-1 flex gap-1 flex-wrap justify-center">
          <button v-for="i in totalSteps" :key="i" type="button" :class="[
            'w-7 h-7 rounded-full text-xs font-bold transition-colors',
            (i - 1) === currentStep
              ? 'bg-blue-600 text-white'
              : (i - 1) < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          ]" @click="goTo(i - 1)">
            {{ i }}
          </button>
        </div>

        <button type="button" :disabled="currentStep === totalSteps - 1"
          class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          @click="goTo(currentStep + 1)">
          Next →
        </button>
      </div>

      <!-- Grid visualization -->
      <div class="flex justify-center overflow-auto">
        <div class="relative rounded border-2 border-gray-400 shrink-0"
          :style="{ width: `${containerPx}px`, height: `${containerPx}px`, background: '#9ca3af' }">

          <!-- Current row band highlight -->
          <div class="absolute left-0 right-0 bg-blue-400/20 border-y-2 border-blue-400 pointer-events-none z-10"
            :style="bandStyle" />

          <!-- Past bricks (dimmed, no studs) -->
          <div v-for="(brick, i) in pastBricks" :key="`past-${i}`"
            class="absolute rounded-sm border border-black/20 opacity-35" :style="brickStyle(brick)" />

          <!-- Current bricks (full opacity + stud grid + outline) -->
          <div v-for="(brick, i) in currentBricks" :key="`cur-${i}`"
            class="absolute rounded-sm border-2 border-blue-500 shadow-sm z-20" :style="brickStyle(brick)">
            <!-- Studs -->
            <div v-if="showStuds === true" class="w-full h-full grid" :style="{
              gridTemplateColumns: `repeat(${brick.width}, 1fr)`,
              gridTemplateRows: `repeat(${brick.height}, 1fr)`,
            }">
              <div v-for="s in brick.width * brick.height" :key="s" class="flex items-center justify-center">
                <div class="w-1/2 h-1/2 rounded-full border border-black/10" :style="{
                  backgroundColor: getStudColor(resolveColor(brick)),
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2)',
                }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Per-step parts list -->
      <div v-if="stepEntries.length > 0">
        <p class="text-sm font-semibold text-gray-700 mb-2">
          Place this step ({{ currentBricks.length }} bricks):
        </p>
        <div class="flex flex-wrap gap-2">
          <div v-for="(entry, i) in stepEntries" :key="i"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm">
            <div class="w-4 h-4 rounded border border-gray-300 shrink-0" :style="{ backgroundColor: entry.colorHex }" />
            <span class="font-medium text-gray-900">{{ entry.count }}×</span>
            <span class="text-gray-600">{{ entry.width }}×{{ entry.height }} {{ pieceType }}</span>
          </div>
        </div>
      </div>

      <!-- Done state -->
      <div v-if="currentStep === totalSteps - 1 && pastBricks.length + currentBricks.length === bricks.length"
        class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
        ✅ All steps complete! Refer to the parts list above for a full summary.
      </div>
    </div>
  </div>
</template>
