<script setup lang="ts">
import { ref, computed } from 'vue'
import { PANEL_SIZE } from '~/composables/useMosaicConverter'
import type { Brick } from '~/composables/useBrickConverter'
import Brick3DPreview from '~/components/Brick3DPreview.vue'
import BrickCard from '~/components/BrickCard.vue'
import ViewToggle from '~/components/ViewToggle.vue'

const props = withDefaults(defineProps<{
  bricks: Array<Brick>
  showStuds: boolean
  panelCols?: number
  panelRows?: number
  /** Hex of the baseplate color, shown where pieces are skipped */
  baseplateColor?: string | null
}>(), {
  panelCols: 1,
  panelRows: 1,
  baseplateColor: null,
})

const VIEW_OPTIONS = [
  { value: '3d', label: '3D' },
  { value: 'flat', label: 'Flat' },
]
const viewMode = ref('3d')

const CELL_PX = 9 // px per stud in flat view

const totalCols = computed(() => props.panelCols * PANEL_SIZE)
const totalRows = computed(() => props.panelRows * PANEL_SIZE)

const subtitleText = computed(() => {
  const base = `${totalCols.value}×${totalRows.value} studs`
  return props.panelCols > 1 || props.panelRows > 1
    ? `${base} (${props.panelCols}×${props.panelRows} panels of ${PANEL_SIZE}×${PANEL_SIZE})`
    : base
})

// Stud color with enough contrast against the brick color (same treatment as
// the QR code flat view)
const studColorCache = new Map<string, string>()
const getStudColor = (color: string): string => {
  const cached = studColorCache.get(color)
  if (cached !== undefined) return cached
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const result = luminance > 0.5
    ? `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`
    : `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`
  studColorCache.set(color, result)
  return result
}

// Brick x/y are relative to their panel; convert to global stud coordinates
const brickLeft = (brick: Brick): number => brick.panelCol * PANEL_SIZE + brick.x
const brickTop = (brick: Brick): number => brick.panelRow * PANEL_SIZE + brick.y

// Panel boundary lines (vertical + horizontal) as percentages
const verticalLines = computed(() =>
  props.panelCols > 1
    ? Array.from({ length: props.panelCols - 1 }, (_, i) => ((i + 1) / props.panelCols) * 100)
    : []
)
const horizontalLines = computed(() =>
  props.panelRows > 1
    ? Array.from({ length: props.panelRows - 1 }, (_, i) => ((i + 1) / props.panelRows) * 100)
    : []
)
</script>

<template>
  <BrickCard color="blue" title="Preview" :subtitle="subtitleText">
    <template #header-extra>
      <ViewToggle v-model="viewMode" :options="VIEW_OPTIONS" />
    </template>

    <!-- 3D view. Horizontal margin on mobile leaves room for fingers to
         scroll the page past the canvas (which captures touch drags) -->
    <div v-if="viewMode === '3d'" class="relative h-90 md:h-135 mx-8 md:mx-0">
      <Brick3DPreview :bricks="bricks" :panel-cols="panelCols" :panel-rows="panelRows" :studs-foreground="showStuds"
        :studs-background="showStuds" :baseplate-color="baseplateColor ?? undefined" />
      <p class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 bg-white/70 backdrop-blur px-2.5 py-1 rounded-full pointer-events-none whitespace-nowrap">
        Drag to rotate · Pinch or scroll to zoom
      </p>
    </div>

    <!-- Flat view -->
    <div v-else class="p-6 flex justify-center overflow-auto">
      <div class="relative rounded border-2 border-gray-500 shadow-lg shrink-0" :style="{
        width: `${totalCols * CELL_PX}px`,
        height: `${totalRows * CELL_PX}px`,
        backgroundColor: baseplateColor ?? '#9ca3af',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 27%, transparent 30%)',
        backgroundSize: `${CELL_PX}px ${CELL_PX}px`,
      }">
        <!-- Bricks -->
        <div v-for="(brick, index) in bricks" :key="`brick-${index}`"
          class="absolute rounded-sm box-border border border-black/30 transition-opacity hover:opacity-80 hover:z-10 hover:outline-2 hover:outline-blue-500"
          :style="{
            left: `${brickLeft(brick) * CELL_PX}px`,
            top: `${brickTop(brick) * CELL_PX}px`,
            width: `${brick.width * CELL_PX}px`,
            height: `${brick.height * CELL_PX}px`,
            backgroundColor: brick.colorHex ?? '#CCCCCC',
          }" :title="`${brick.width}×${brick.height} at (${brickLeft(brick) + 1}, ${brickTop(brick) + 1})`">
          <!-- Studs grid inside brick -->
          <div v-if="showStuds === true" class="w-full h-full grid" :style="{
            gridTemplateColumns: `repeat(${brick.width}, 1fr)`,
            gridTemplateRows: `repeat(${brick.height}, 1fr)`,
          }">
            <div v-for="stud in brick.width * brick.height" :key="stud" class="flex items-center justify-center">
              <div class="w-1/2 h-1/2 rounded-full border border-black/10" :style="{
                backgroundColor: getStudColor(brick.colorHex ?? '#CCCCCC'),
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2)',
              }" />
            </div>
          </div>
        </div>

        <!-- Panel boundary lines -->
        <div v-for="pct in verticalLines" :key="`v-${pct}`"
          class="absolute top-0 bottom-0 w-px bg-white/70 pointer-events-none z-10" :style="{ left: `${pct}%` }" />
        <div v-for="pct in horizontalLines" :key="`h-${pct}`"
          class="absolute left-0 right-0 h-px bg-white/70 pointer-events-none z-10" :style="{ top: `${pct}%` }" />
      </div>
    </div>
  </BrickCard>
</template>
