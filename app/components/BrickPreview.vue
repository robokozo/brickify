<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width: number
  height: number
  color: string
  showStuds?: boolean
}>(), {
  showStuds: true
})

// Normalize: always display with larger dimension as width (horizontal)
const displayWidth = computed(() => Math.max(props.width, props.height))
const displayHeight = computed(() => Math.min(props.width, props.height))

// Calculate a contrasting stud color
const studColor = computed(() => {
  const hex = props.color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  if (luminance > 0.5) {
    // Darken for light backgrounds
    return `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`
  } else {
    // Lighten for dark backgrounds
    return `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`
  }
})

// Generate studs as a 2D array for proper row/column layout
const rows = computed(() => {
  const result = []
  for (let row = 0; row < displayHeight.value; row++) {
    const cols = []
    for (let col = 0; col < displayWidth.value; col++) {
      cols.push({ row, col })
    }
    result.push(cols)
  }
  return result
})
</script>

<template>
  <div class="inline-flex flex-col rounded border border-black/20 shadow-sm overflow-hidden"
    :style="{ backgroundColor: color }">
    <div v-for="(row, rowIdx) in rows" :key="rowIdx" class="flex">
      <div v-for="stud in row" :key="`${stud.row}-${stud.col}`" class="w-4 h-4 flex items-center justify-center">
        <div v-if="showStuds" class="w-2.5 h-2.5 rounded-full border border-black/10" :style="{
          backgroundColor: studColor,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2)'
        }" />
      </div>
    </div>
  </div>
</template>
