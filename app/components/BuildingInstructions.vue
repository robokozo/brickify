<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PANEL_SIZE } from '~/composables/useMosaicConverter'
import type { Brick } from '~/composables/useBrickConverter'
import BrickCard from '~/components/BrickCard.vue'

const props = withDefaults(defineProps<{
  bricks: Brick[]
  gridSize?: number
  foreground?: string
  background?: string
  showStuds?: boolean
  pieceType?: 'Plate' | 'Tile'
  rowBandSize?: number
  panelCols?: number
  panelRows?: number
  /** Color of the empty baseplate behind the bricks */
  baseplateColor?: string
}>(), {
  gridSize: PANEL_SIZE,
  foreground: '#000000',
  background: '#FFFFFF',
  showStuds: true,
  pieceType: 'Plate',
  rowBandSize: 4,
  panelCols: 1,
  panelRows: 1,
  baseplateColor: '#b8bdc3',
})

// --- Panel selection ---
const activePanelCol = ref(0)
const activePanelRow = ref(0)

const totalPanels = computed(() => props.panelCols * props.panelRows)

// Bricks belonging to the currently active panel
const panelBricks = computed(() =>
  props.bricks.filter(
    (b) => b.panelCol === activePanelCol.value && b.panelRow === activePanelRow.value,
  ),
)

const selectPanel = (col: number, row: number): void => {
  activePanelCol.value = col
  activePanelRow.value = row
  currentStep.value = 0
}

const panelLabel = (col: number, row: number): string =>
  props.panelRows > 1 && props.panelCols > 1
    ? `R${row + 1}C${col + 1}`
    : props.panelCols > 1
      ? `Panel ${col + 1}`
      : `Panel ${row + 1}`

const currentStep = ref(0)

// How many row-band steps cover the full grid
const totalSteps = computed(() => Math.ceil(props.gridSize / props.rowBandSize))

// Which step a given brick belongs to (keyed by its top row)
const stepIndexOf = (brick: Brick): number =>
  Math.floor(brick.y / props.rowBandSize)

// Bricks visible in the current step view
const pastBricks = computed(() =>
  panelBricks.value.filter((b) => stepIndexOf(b) < currentStep.value),
)
const currentBricks = computed(() =>
  panelBricks.value.filter((b) => stepIndexOf(b) === currentStep.value),
)

const isComplete = computed(() => currentStep.value === totalSteps.value - 1)

// Keep step and panel selection valid when the build shrinks
// (e.g. QR regenerated with a shorter payload, or fewer panels selected)
watch(totalSteps, (steps) => {
  if (currentStep.value > steps - 1) currentStep.value = Math.max(0, steps - 1)
})
watch([() => props.panelCols, () => props.panelRows], ([cols, rows]) => {
  if (activePanelCol.value > cols - 1 || activePanelRow.value > rows - 1) {
    selectPanel(0, 0)
  }
})

const goTo = (step: number): void => {
  currentStep.value = Math.max(0, Math.min(totalSteps.value - 1, step))
}

// Keyboard navigation, booklet-style page flipping
const onKeydown = (event: KeyboardEvent): void => {
  const target = event.target
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return
  }
  if (event.key === 'ArrowLeft') goTo(currentStep.value - 1)
  if (event.key === 'ArrowRight') goTo(currentStep.value + 1)
}

onMounted(() => { window.addEventListener('keydown', onKeydown) })
onUnmounted(() => { window.removeEventListener('keydown', onKeydown) })

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
    return `rgb(${Math.round(r * 0.78)},${Math.round(g * 0.78)},${Math.round(b * 0.78)})`
  }
  return `rgb(${Math.min(255, r + 55)},${Math.min(255, g + 55)},${Math.min(255, b + 55)})`
}

// --- Sizing ---

const cellSize = computed(() => {
  if (props.gridSize <= 32) return 14
  if (props.gridSize <= 48) return 10
  return 7
})

const containerPx = computed(() => props.gridSize * cellSize.value)

const baseplateStyle = computed(() => ({
  width: `${containerPx.value}px`,
  height: `${containerPx.value}px`,
  backgroundColor: props.baseplateColor,
  // Faint stud dots on the empty baseplate
  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 27%, transparent 30%)',
  backgroundSize: `${cellSize.value}px ${cellSize.value}px`,
}))

const brickStyle = (brick: Brick) => ({
  left: `${(brick.x / props.gridSize) * 100}%`,
  top: `${(brick.y / props.gridSize) * 100}%`,
  width: `${(brick.width / props.gridSize) * 100}%`,
  height: `${(brick.height / props.gridSize) * 100}%`,
  background: resolveColor(brick),
  ...(brick.isRound === true ? { borderRadius: '9999px' } : {}),
})

// Highlight band for current step
const bandStyle = computed(() => ({
  top: `${(currentStep.value * props.rowBandSize / props.gridSize) * 100}%`,
  height: `${(Math.min(props.rowBandSize, props.gridSize - currentStep.value * props.rowBandSize) / props.gridSize) * 100}%`,
}))

// --- Per-step parts callout (booklet-style "2×" box) ---

interface StepEntry {
  colorHex: string
  width: number
  height: number
  count: number
  round: boolean
}

const stepEntries = computed((): StepEntry[] => {
  const map = new Map<string, StepEntry>()
  for (const brick of currentBricks.value) {
    const hex = resolveColor(brick)
    const round = brick.isRound === true
    // Aggregate by normalized size so 1×4 and 4×1 count as the same part
    const long = Math.max(brick.width, brick.height)
    const short = Math.min(brick.width, brick.height)
    const key = `${hex}|${long}|${short}|${round ? 'r' : 's'}`
    const existing = map.get(key)
    if (existing !== undefined) {
      existing.count++
    } else {
      map.set(key, { colorHex: hex, width: long, height: short, count: 1, round })
    }
  }
  // Sort: by color then by area desc
  return [...map.values()].sort((a, b) => {
    if (a.colorHex !== b.colorHex) return a.colorHex.localeCompare(b.colorHex)
    return (b.width * b.height) - (a.width * a.height)
  })
})

const rowStart = computed(() => currentStep.value * props.rowBandSize + 1)
const rowEnd = computed(() => Math.min((currentStep.value + 1) * props.rowBandSize, props.gridSize))
</script>

<template>
  <BrickCard color="red" title="Building Instructions">
    <template #header-extra>
      <span class="text-sm text-gray-500">
        <template v-if="totalPanels > 1">
          {{ panelLabel(activePanelCol, activePanelRow) }} &mdash;
        </template>
        Rows {{ rowStart }}–{{ rowEnd }} of {{ gridSize }}
      </span>
    </template>

    <div class="p-5 space-y-5">
      <!-- Panel selector (only shown for multi-panel mosaics) -->
      <div v-if="totalPanels > 1">
        <p class="text-sm font-medium text-gray-700 mb-2">Panel</p>
        <div class="flex flex-col gap-1">
          <div v-for="pr in panelRows" :key="pr" class="flex gap-1">
            <button v-for="pc in panelCols" :key="pc" type="button" :class="[
              'px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors',
              activePanelCol === pc - 1 && activePanelRow === pr - 1
                ? 'border-brick-blue bg-blue-50 text-brick-blue'
                : 'border-gray-200 text-gray-600 hover:border-brick-blue/50',
            ]" @click="selectPanel(pc - 1, pr - 1)">
              {{ panelLabel(pc - 1, pr - 1) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Booklet-style step header: big step number + parts callout box -->
      <div class="flex items-stretch gap-3">
        <div
          class="flex items-center justify-center min-w-16 px-3 rounded-xl bg-brick-red text-white text-3xl font-black shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]">
          {{ currentStep + 1 }}
        </div>
        <div class="flex-1 border-2 border-gray-900 rounded-xl bg-white px-4 py-3">
          <div v-if="stepEntries.length > 0" class="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div v-for="(entry, i) in stepEntries" :key="i" class="flex items-center gap-2">
              <span class="text-lg font-bold text-gray-900 tabular-nums">{{ entry.count }}×</span>
              <!-- Top-down mini part -->
              <div class="border border-black/30 grid shadow-sm"
                :class="entry.round === true ? 'rounded-full' : 'rounded-[3px]'" :style="{
                  gridTemplateColumns: `repeat(${entry.width}, 9px)`,
                  gridTemplateRows: `repeat(${entry.height}, 9px)`,
                  backgroundColor: entry.colorHex,
                }">
                <div v-for="s in entry.width * entry.height" :key="s" class="flex items-center justify-center">
                  <div v-if="showStuds === true" class="w-1.25 h-1.25 rounded-full"
                    :style="{ backgroundColor: getStudColor(entry.colorHex) }" />
                </div>
              </div>
              <span class="text-xs text-gray-500">{{ entry.width }}×{{ entry.height }}{{ entry.round === true ? ' round' : '' }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 italic">No new pieces in this step</p>
        </div>
      </div>

      <!-- Build area -->
      <div class="flex justify-center overflow-auto">
        <div class="relative rounded-md border-2 border-gray-300 shrink-0 shadow-inner" :style="baseplateStyle">

          <!-- Current row band guide -->
          <div
            class="absolute left-0 right-0 border-y-2 border-dashed border-red-400/70 bg-red-400/5 pointer-events-none z-10"
            :style="bandStyle" />

          <!-- Past bricks (already built: full color, like a printed booklet) -->
          <div v-for="(brick, i) in pastBricks" :key="`past-${i}`"
            class="absolute rounded-[2px] border border-black/15" :style="brickStyle(brick)">
            <div v-if="showStuds === true" class="w-full h-full grid opacity-60" :style="{
              gridTemplateColumns: `repeat(${brick.width}, 1fr)`,
              gridTemplateRows: `repeat(${brick.height}, 1fr)`,
            }">
              <div v-for="s in brick.width * brick.height" :key="s" class="flex items-center justify-center">
                <div class="w-1/2 h-1/2 rounded-full"
                  :style="{ backgroundColor: getStudColor(resolveColor(brick)) }" />
              </div>
            </div>
          </div>

          <!-- Current step bricks (outlined + pop-in 'new part' emphasis) -->
          <div v-for="(brick, i) in currentBricks" :key="`cur-${currentStep}-${i}`"
            class="absolute rounded-[2px] z-20 brick-pop"
            :style="{ ...brickStyle(brick), boxShadow: '0 0 0 2px #111827, 0 2px 6px rgba(0,0,0,0.35)' }">
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

      <!-- Step navigation -->
      <div class="flex items-center gap-3">
        <button type="button" :disabled="currentStep === 0"
          class="px-4 py-2 rounded-lg border-2 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-300 hover:border-brick-blue/60 hover:bg-blue-50"
          @click="goTo(currentStep - 1)">
          ← Prev
        </button>

        <!-- Step pills -->
        <div class="flex-1 flex gap-1 flex-wrap justify-center">
          <button v-for="i in totalSteps" :key="i" type="button" :class="[
            'w-7 h-7 rounded-md text-xs font-bold transition-colors',
            (i - 1) === currentStep
              ? 'bg-brick-red text-white'
              : (i - 1) < currentStep
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          ]" @click="goTo(i - 1)">
            {{ i }}
          </button>
        </div>

        <button type="button" :disabled="isComplete === true"
          class="px-4 py-2 rounded-lg border-2 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-300 hover:border-brick-blue/60 hover:bg-blue-50"
          @click="goTo(currentStep + 1)">
          Next →
        </button>
      </div>
      <p class="text-center text-xs text-gray-400">Tip: use ← → arrow keys to flip through steps</p>

      <!-- Done state -->
      <div v-if="isComplete === true"
        class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
        ✅ Final step! Once these pieces are placed{{ totalPanels > 1 ? ' and all panels are built' : '' }}, your build
        is complete.
      </div>
    </div>
  </BrickCard>
</template>

<style scoped>
@keyframes brick-pop {
  from {
    transform: scale(1.12);
    opacity: 0.2;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.brick-pop {
  animation: brick-pop 180ms ease-out;
}
</style>
