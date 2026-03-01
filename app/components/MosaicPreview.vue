<script setup lang="ts">
import { computed } from 'vue'
import { MOSAIC_SIZE } from '~/composables/useMosaicConverter'
import { useLegoPalette } from '~/composables/useLegoPalette'

const props = defineProps<{
  colorGrid: string[][]
  showStuds: boolean
}>()

const CELL_PX = 9 // px per stud — 48 × 9 = 432 px total

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
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">🔍 Mosaic Preview</h2>
      <p class="text-sm text-gray-500 mt-0.5">{{ MOSAIC_SIZE }}×{{ MOSAIC_SIZE }} studs</p>
    </div>
    <div class="p-6 flex justify-center overflow-auto">
      <div class="grid border border-gray-200 rounded shrink-0" :style="{
        gridTemplateColumns: `repeat(${MOSAIC_SIZE}, ${CELL_PX}px)`,
        gridTemplateRows: `repeat(${MOSAIC_SIZE}, ${CELL_PX}px)`,
        width: `${MOSAIC_SIZE * CELL_PX}px`,
        height: `${MOSAIC_SIZE * CELL_PX}px`,
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
    </div>
  </div>
</template>
