<script setup lang="ts">
import { computed } from 'vue'
import type { BrickSize } from '~/composables/useBrickConverter'

const { allBrickSizes } = useBrickConverter()

const props = withDefaults(defineProps<{
  modelValue: BrickSize[]
  label?: string
  color?: string
  disabled?: boolean
  showStuds?: boolean
}>(), {
  label: '',
  color: '#3B82F6',
  disabled: false,
  showStuds: true
})

const emit = defineEmits<{
  'update:modelValue': [value: BrickSize[]]
}>()

// Filter out 1×1 from the selectable options (it's always included)
const selectableBrickSizes = computed(() =>
  allBrickSizes.filter(s => !(s.width === 1 && s.height === 1))
)

const isSelected = (size: BrickSize) => {
  return props.modelValue.some(s => s.width === size.width && s.height === size.height)
}

const toggleSize = (size: BrickSize) => {
  if (props.disabled) return
  if (isSelected(size)) {
    emit('update:modelValue', props.modelValue.filter(s => !(s.width === size.width && s.height === size.height)))
  } else {
    emit('update:modelValue', [...props.modelValue, size])
  }
}

const selectAll = () => {
  if (props.disabled) return
  emit('update:modelValue', [...selectableBrickSizes.value])
}

const selectNone = () => {
  if (props.disabled) return
  emit('update:modelValue', [])
}

const selectedCount = computed(() => props.modelValue.length)

const summaryText = computed(() => {
  if (selectedCount.value === 0) return 'None selected'
  if (selectedCount.value === selectableBrickSizes.value.length) return 'All sizes selected'
  return `${selectedCount.value} size${selectedCount.value === 1 ? '' : 's'} selected`
})
</script>

<template>
  <div :class="{ 'opacity-50 pointer-events-none': disabled }">
    <label class="block mb-2 text-sm font-medium text-gray-700">
      {{ label ? `${label} Brick Sizes` : 'Available Brick Sizes' }}
    </label>

    <UPopover :ui="{ content: 'w-[var(--reka-popper-anchor-width)]' }">
      <UButton block color="neutral" variant="outline" :disabled="disabled" trailing-icon="i-lucide-chevron-down"
        class="justify-between">
        {{ summaryText }}
      </UButton>

      <template #content>
        <div class="max-h-64 overflow-auto">
          <!-- Quick actions -->
          <div class="sticky top-0 bg-gray-50 border-b border-gray-200 p-2 flex gap-2 z-10">
            <UButton size="xs" color="primary" variant="soft" @click="selectAll">
              All
            </UButton>
            <UButton size="xs" color="neutral" variant="soft" @click="selectNone">
              None
            </UButton>
            <span class="ml-auto text-xs text-gray-500 self-center">
              {{ selectedCount }}/{{ selectableBrickSizes.length }}
            </span>
          </div>

          <!-- Options -->
          <div class="p-2 space-y-1">
            <div v-for="size in selectableBrickSizes" :key="`${size.width}x${size.height}`"
              class="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors hover:bg-gray-50"
              :class="isSelected(size) ? 'bg-blue-50' : ''" @click="toggleSize(size)">
              <UCheckbox :model-value="isSelected(size)" @click.stop @update:model-value="toggleSize(size)" />
              <BrickPreview :width="size.width" :height="size.height" :color="color" :cell-size="6"
                :show-studs="showStuds" />
              <span class="text-sm font-medium text-gray-900">{{ size.width }}×{{ size.height }}</span>
            </div>
          </div>

          <!-- 1x1 note -->
          <div class="sticky bottom-0 bg-green-50 border-t border-green-200 p-2 flex items-center gap-2">
            <BrickPreview :width="1" :height="1" :color="color" :cell-size="10" :show-studs="showStuds" />
            <span class="text-xs text-green-700 font-medium">1×1 (Minimum requirement)</span>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
