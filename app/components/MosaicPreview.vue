<script setup lang="ts">
import { computed } from 'vue'
import { PANEL_SIZE } from '~/composables/useMosaicConverter'
import { useLegoPalette } from '~/composables/useLegoPalette'

const props = withDefaults(defineProps<{
  colorGrid: string[][]
  showStuds: boolean
  panelCols?: number
  panelRows?: number
}>(), {
  panelCols: 1,
  panelRows: 1,
})

const CELL_PX = 9 // px per stud

const totalCols = computed(() => props.panelCols * PANEL_SIZE)
const totalRows = computed(() => props.panelRows * PANEL_SIZE)

const { getColorById } = useLegoPalette()

// Flatten the 2D grid into a 1D array for v-for
const flatCells = computed(() => {
  const cells: string[] = []
  for (const row of props.colorGrid) {
    for (const id of row) {
      cells.push(id)
    }
  }
  return cells
})

const colorForId = (id: string): string => {
  const color = getColorById(id)
  return color !== null ? color.hex : '#CCCCCC'
}

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
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">🔍 Mosaic Preview</h2>
      <p class="text-sm text-gray-500 mt-0.5">
        {{ totalCols }}×{{ totalRows }} studs
        <template v-if="panelCols > 1 || panelRows > 1">
          &mdash; {{ panelCols }}×{{ panelRows }} panels of {{ PANEL_SIZE }}×{{ PANEL_SIZE }}
        </template>
      </p>
    </div>
    <div class="p-6 flex justify-center overflow-auto">
      <div class="relative border border-gray-200 rounded shrink-0" :style="{
        width: `${totalCols * CELL_PX}px`,
        height: `${totalRows * CELL_PX}px`,
      }">
        <!-- Stud grid -->
        <div class="absolute inset-0 grid" :style="{
          gridTemplateColumns: `repeat(${totalCols}, ${CELL_PX}px)`,
          gridTemplateRows: `repeat(${totalRows}, ${CELL_PX}px)`,
        }">
          <div v-for="(id, i) in flatCells" :key="i" class="relative flex items-center justify-center"
            :style="{ backgroundColor: colorForId(id), width: `${CELL_PX}px`, height: `${CELL_PX}px` }">
            <div v-if="showStuds === true" class="rounded-full absolute" :style="{
              width: `${CELL_PX * 0.55}px`,
              height: `${CELL_PX * 0.55}px`,
              backgroundColor: 'rgba(0,0,0,0.25)',
            }" />
          </div>
        </div>

        <!-- Panel boundary lines -->
        <div v-for="pct in verticalLines" :key="`v-${pct}`"
          class="absolute top-0 bottom-0 w-px bg-white/70 pointer-events-none z-10" :style="{ left: `${pct}%` }" />
        <div v-for="pct in horizontalLines" :key="`h-${pct}`"
          class="absolute left-0 right-0 h-px bg-white/70 pointer-events-none z-10" :style="{ top: `${pct}%` }" />
      </div>
    </div>
  </div>
</template>
