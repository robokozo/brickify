<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{
  options: Array<{ value: string; label: string }>
}>()
</script>

<template>
  <div class="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
    <button v-for="opt in options" :key="opt.value" type="button" :class="[
      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
      model === opt.value ? 'bg-white text-brick-blue shadow-sm' : 'text-gray-500 hover:text-gray-700',
    ]" @click="model = opt.value">
      {{ opt.label }}
    </button>
  </div>
</template>
