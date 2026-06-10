<script setup lang="ts">
import { computed } from 'vue'

type StripColor = 'red' | 'yellow' | 'blue' | 'green' | 'none'

const props = withDefaults(defineProps<{
  color?: StripColor
  title?: string
  subtitle?: string
}>(), {
  color: 'none',
  title: '',
  subtitle: '',
})

const STRIP_CLASSES: Record<Exclude<StripColor, 'none'>, string> = {
  red: 'bg-brick-red',
  yellow: 'bg-brick-yellow',
  blue: 'bg-brick-blue',
  green: 'bg-brick-green',
}

const stripClass = computed(() =>
  props.color === 'none' ? null : STRIP_CLASSES[props.color],
)
</script>

<template>
  <div class="brick-card">
    <div v-if="stripClass !== null" class="stud-strip" :class="stripClass" />

    <div v-if="title.length > 0"
      class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">{{ title }}</h2>
        <p v-if="subtitle.length > 0" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header-extra" />
    </div>

    <slot />
  </div>
</template>
