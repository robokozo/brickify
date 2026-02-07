<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-semibold text-gray-900">📐 Baseplate Configuration</h2>
    </template>

    <div class="space-y-4">
      <UFormGroup label="Baseplate Preset">
        <USelect
          v-model="selectedPreset"
          :options="presetOptions"
          size="lg"
          @change="handlePresetChange"
        />
      </UFormGroup>

      <div v-if="selectedPreset === 'Custom'" class="grid grid-cols-2 gap-4">
        <UFormGroup label="Width (studs)">
          <UInput
            v-model.number="localConfig.width"
            type="number"
            min="1"
            max="200"
            size="lg"
            @input="emitUpdate"
          />
        </UFormGroup>

        <UFormGroup label="Height (studs)">
          <UInput
            v-model.number="localConfig.height"
            type="number"
            min="1"
            max="200"
            size="lg"
            @input="emitUpdate"
          />
        </UFormGroup>
      </div>

      <UAlert
        v-if="qrSize && maxScale"
        color="blue"
        variant="soft"
      >
        <template #description>
          <div class="space-y-1 text-sm">
            <p><strong>QR Code Size:</strong> {{ qrSize }} × {{ qrSize }} modules</p>
            <p><strong>Baseplate Size:</strong> {{ localConfig.width }} × {{ localConfig.height }} studs</p>
            <p><strong>Maximum Scale:</strong> {{ maxScale }}× ({{ qrSize * maxScale }} × {{ qrSize * maxScale }} studs)</p>
          </div>
        </template>
      </UAlert>
    </div>
  </UCard>
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
