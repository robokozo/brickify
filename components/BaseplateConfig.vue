<template>
  <div class="baseplate-config">
    <h2 class="section-title">📐 Baseplate Configuration</h2>
    
    <div class="form-group">
      <label for="preset">Baseplate Preset</label>
      <select
        id="preset"
        v-model="selectedPreset"
        class="form-input"
        @change="handlePresetChange"
      >
        <option
          v-for="preset in presets"
          :key="preset.name"
          :value="preset.name"
        >
          {{ preset.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedPreset === 'Custom'" class="custom-dimensions">
      <div class="form-group">
        <label for="width">Width (studs)</label>
        <input
          id="width"
          v-model.number="localConfig.width"
          type="number"
          min="1"
          max="200"
          class="form-input"
          @input="emitUpdate"
        />
      </div>

      <div class="form-group">
        <label for="height">Height (studs)</label>
        <input
          id="height"
          v-model.number="localConfig.height"
          type="number"
          min="1"
          max="200"
          class="form-input"
          @input="emitUpdate"
        />
      </div>
    </div>

    <div v-if="qrSize && maxScale" class="info-box">
      <p><strong>QR Code Size:</strong> {{ qrSize }} × {{ qrSize }} modules</p>
      <p><strong>Baseplate Size:</strong> {{ localConfig.width }} × {{ localConfig.height }} studs</p>
      <p><strong>Maximum Scale:</strong> {{ maxScale }}x ({{ qrSize * maxScale }} × {{ qrSize * maxScale }} studs)</p>
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

<style scoped>
.baseplate-config {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.custom-dimensions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-box {
  margin-top: 1rem;
  padding: 1rem;
  background: #e8f4f8;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.info-box p {
  margin: 0.5rem 0;
  color: #2c3e50;
  font-size: 0.95rem;
}

.info-box strong {
  color: #1a5490;
}
</style>
