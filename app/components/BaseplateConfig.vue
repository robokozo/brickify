<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">📐 Baseplate Configuration</h2>
    </div>

    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Baseplate Preset</label>
        <select v-model="selectedPreset"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          @change="handlePresetChange">
          <option v-for="option in presetOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-if="selectedPreset === 'Custom'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Width (studs)</label>
          <input v-model.number="localConfig.width" type="number" min="1" max="200"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            @input="emitUpdate" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Height (studs)</label>
          <input v-model.number="localConfig.height" type="number" min="1" max="200"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            @input="emitUpdate" />
        </div>
      </div>

      <div v-if="qrSize && maxScale" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        <div class="space-y-1 text-sm">
          <p><strong>QR Code Size:</strong> {{ qrSize }} × {{ qrSize }} modules</p>
          <p><strong>Baseplate Size:</strong> {{ localConfig.width }} × {{ localConfig.height }} studs</p>
          <p><strong>Maximum Scale:</strong> {{ maxScale }}× ({{ qrSize * maxScale }} × {{ qrSize * maxScale }} studs)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BaseplateConfig } from '~/composables/useLegoConverter'

const props = defineProps<{
  modelValue: BaseplateConfig
  qrSize?: number
  maxScale?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BaseplateConfig): void
}>()

const { baseplatePresets } = useLegoConverter()

const presets = baseplatePresets
const presetOptions = presets.map(p => ({ value: p.name, label: p.name }))
const selectedPreset = ref('32x32')
const localConfig = ref<BaseplateConfig>({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  localConfig.value = { ...newValue }
}, { deep: true })

const handlePresetChange = () => {
  const preset = presets.find(p => p.name === selectedPreset.value)
  if (preset && preset.name !== 'Custom') {
    localConfig.value = {
      width: preset.width,
      height: preset.height
    }
    emitUpdate()
  }
}

const emitUpdate = () => {
  emit('update:modelValue', { ...localConfig.value })
}

// Initialize with default preset
if (localConfig.value.width === 32 && localConfig.value.height === 32) {
  selectedPreset.value = '32x32'
}
</script>
