<script setup lang="ts">
import { computed } from 'vue'

type ButtonColor = 'red' | 'yellow' | 'blue' | 'green' | 'gray'

const props = withDefaults(defineProps<{
  color?: ButtonColor
  size?: 'md' | 'lg'
  block?: boolean
}>(), {
  color: 'blue',
  size: 'md',
  block: false,
})

const COLOR_CLASSES: Record<ButtonColor, string> = {
  red: 'bg-brick-red',
  yellow: 'bg-brick-yellow text-gray-900',
  blue: 'bg-brick-blue',
  green: 'bg-brick-green',
  gray: 'bg-gray-500',
}

const classes = computed(() => [
  'btn-brick flex items-center justify-center gap-2',
  COLOR_CLASSES[props.color],
  props.size === 'lg' ? 'px-6 py-4 text-lg' : 'px-4 py-2.5',
  props.block === true ? 'w-full' : '',
])
</script>

<template>
  <button type="button" :class="classes">
    <slot />
  </button>
</template>
