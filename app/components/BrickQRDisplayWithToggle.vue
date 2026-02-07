<script setup lang="ts">
import type { Brick } from '~/composables/useLegoConverter'

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
  showForegroundStuds: true,
  showBackgroundStuds: true,
  useBaseplate: false
})
</script>

<template>
  <BrickQRDisplay :bricks="bricks" :grid-size="gridSize" :foreground="foreground" :background="background"
    :max-size="maxSize" :show-foreground-studs="showForegroundStuds" :show-background-studs="showBackgroundStuds"
    :use-baseplate="useBaseplate" />
</template>
