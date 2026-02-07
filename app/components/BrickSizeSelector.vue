<script setup lang="ts">
import { computed } from 'vue'

export interface BrickSize {
  width: number
  height: number
}

const props = defineProps<{
  modelValue: BrickSize[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BrickSize[]]
}>()

// All available brick sizes (normalized: larger×smaller)
const allBrickSizes: BrickSize[] = [
  { width: 8, height: 2 },
  { width: 6, height: 2 },
  { width: 4, height: 2 },
  { width: 4, height: 1 },
  { width: 3, height: 2 },
  { width: 3, height: 1 },
  { width: 2, height: 2 },
  { width: 2, height: 1 },
]

const isSelected = (size: BrickSize) => {
  return props.modelValue.some(s => s.width === size.width && s.height === size.height)
}

const toggleSize = (size: BrickSize) => {
  if (isSelected(size)) {
    emit('update:modelValue', props.modelValue.filter(s => !(s.width === size.width && s.height === size.height)))
  } else {
    emit('update:modelValue', [...props.modelValue, size])
  }
}

const selectAll = () => {
  emit('update:modelValue', [...allBrickSizes])
}

const selectNone = () => {
  emit('update:modelValue', [])
}

const selectedCount = computed(() => props.modelValue.length)
</script>

<template>
  <div>
    <h3 class="m-0 mb-3 text-gray-800 text-lg font-semibold">🧱 Available Brick Sizes</h3>
    <p class="text-sm text-gray-500 mb-4">Select the brick sizes you have available (1×1 is always included)</p>

    <!-- Quick actions -->
    <div class="flex gap-2 mb-4">
      <button type="button"
        class="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        @click="selectAll">
        Select All
      </button>
      <button type="button"
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        @click="selectNone">
        Select None
      </button>
      <span class="ml-auto text-sm text-gray-500 self-center">
        {{ selectedCount }} of {{ allBrickSizes.length }} selected
      </span>
    </div>

    <!-- Brick size grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <label v-for="size in allBrickSizes" :key="`${size.width}x${size.height}`"
        class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all" :class="isSelected(size)
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-gray-50'">
        <input type="checkbox" :checked="isSelected(size)" class="sr-only" @change="toggleSize(size)">
        <BrickPreview :width="size.width" :height="size.height" color="#3B82F6" />
        <span class="font-medium text-gray-900">{{ size.width }}×{{ size.height }}</span>
      </label>
    </div>

    <!-- 1x1 always included note -->
    <div class="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <BrickPreview :width="1" :height="1" color="#22C55E" />
      <div>
        <span class="font-medium text-green-800">1×1</span>
        <span class="text-green-600 text-sm ml-2">(Always included)</span>
      </div>
    </div>
  </div>
</template>
