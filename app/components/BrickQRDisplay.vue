<script setup lang="ts">
import { computed } from 'vue'
import type { Brick } from '~/composables/useBrickConverter'

const props = withDefaults(defineProps<{
  bricks: Brick[]
  gridSize: number
  foreground: string
  background: string
  maxSize?: number
  showForegroundStuds?: boolean
  showBackgroundStuds?: boolean
  useBaseplate?: boolean
}>(), {
  maxSize: 600,
  showForegroundStuds: true,
  showBackgroundStuds: true,
  useBaseplate: false
})

// Filter bricks based on useBaseplate - if using baseplate, only show foreground bricks
const displayBricks = computed(() => {
  if (props.useBaseplate) {
    return props.bricks.filter(b => b.isForeground)
  }
  return props.bricks
})

const cellSize = computed(() => {
  // Dynamically adjust cell size based on total grid size
  if (props.gridSize <= 32) return 16
  if (props.gridSize <= 48) return 12
  if (props.gridSize <= 64) return 8
  return 6
})

const containerSize = computed(() => {
  return Math.min(props.gridSize * cellSize.value, props.maxSize)
})

// Calculate contrasting stud color for a given base color
const getStudColor = (color: string) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  if (luminance > 0.5) {
    return `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`
  } else {
    return `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`
  }
}

const foregroundStudColor = computed(() => getStudColor(props.foreground))
const backgroundStudColor = computed(() => getStudColor(props.background))

// Generate stud positions for a brick
const getStudsForBrick = (brick: Brick) => {
  const studs = []
  for (let row = 0; row < brick.height; row++) {
    for (let col = 0; col < brick.width; col++) {
      studs.push({ row, col })
    }
  }
  return studs
}
</script>

<template>
  <div class="rounded relative border-2 border-gray-500 shadow-lg" :style="{
    width: `${containerSize}px`,
    height: `${containerSize}px`,
    backgroundColor: useBaseplate ? background : '#9ca3af',
  }">
    <!-- Baseplate studs (when using baseplate) -->
    <div v-if="useBaseplate" class="absolute inset-0 grid" :style="{
      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      gridTemplateRows: `repeat(${gridSize}, 1fr)`,
    }">
      <div v-for="i in gridSize * gridSize" :key="`baseplate-stud-${i}`" class="flex items-center justify-center">
        <div class="w-1/2 h-1/2 rounded-full border border-black/10" :style="{
          backgroundColor: backgroundStudColor,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2)'
        }" />
      </div>
    </div>
    <div v-for="(brick, index) in displayBricks" :key="`brick-${index}`"
      class="absolute rounded-sm box-border transition-opacity hover:opacity-80 hover:z-10 hover:outline-2 hover:outline-blue-500"
      :class="{ 'border border-black/30': brick.isForeground || !useBaseplate }" :style="{
        left: `${(brick.x / gridSize) * 100}%`,
        top: `${(brick.y / gridSize) * 100}%`,
        width: `${(brick.width / gridSize) * 100}%`,
        height: `${(brick.height / gridSize) * 100}%`,
        background: brick.isForeground ? foreground : background,
      }" :title="`${brick.width}×${brick.height} at (${brick.x + 1}, ${brick.y + 1})`">
      <!-- Studs grid inside brick -->
      <div v-if="(brick.isForeground && showForegroundStuds) || (!brick.isForeground && showBackgroundStuds)"
        class="w-full h-full grid" :style="{
          gridTemplateColumns: `repeat(${brick.width}, 1fr)`,
          gridTemplateRows: `repeat(${brick.height}, 1fr)`,
        }">
        <div v-for="stud in getStudsForBrick(brick)" :key="`${stud.row}-${stud.col}`"
          class="flex items-center justify-center">
          <div class="w-1/2 h-1/2 rounded-full border border-black/10" :style="{
            backgroundColor: brick.isForeground ? foregroundStudColor : backgroundStudColor,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2)'
          }" />
        </div>
      </div>
    </div>
  </div>
</template>
