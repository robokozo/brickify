<template>
  <div class="wifi-form">
    <h2 class="section-title">📶 WiFi Credentials</h2>
    <div class="form-group">
      <label for="ssid">Network Name (SSID) *</label>
      <input
        id="ssid"
        v-model="localConfig.ssid"
        type="text"
        placeholder="My WiFi Network"
        class="form-input"
        @input="emitUpdate"
      />
    </div>

    <div class="form-group">
      <label for="security">Security Type *</label>
      <select
        id="security"
        v-model="localConfig.security"
        class="form-input"
        @change="emitUpdate"
      >
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">No Password</option>
      </select>
    </div>

    <div v-if="localConfig.security !== 'nopass'" class="form-group">
      <label for="password">Password *</label>
      <input
        id="password"
        v-model="localConfig.password"
        type="text"
        placeholder="Your WiFi password"
        class="form-input"
        @input="emitUpdate"
      />
    </div>

    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input
          v-model="localConfig.hidden"
          type="checkbox"
          @change="emitUpdate"
        />
        <span>Hidden Network</span>
      </label>
    </div>

    <div v-if="!isValid" class="error-message">
      Please fill in all required fields
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WiFiConfig } from '~/composables/useQRCode'

const props = defineProps<{
  modelValue: WiFiConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: WiFiConfig): void
  (e: 'valid', value: boolean): void
}>()

const localConfig = ref<WiFiConfig>({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  localConfig.value = { ...newValue }
}, { deep: true })

const isValid = computed(() => {
  const { ssid, password, security } = localConfig.value
  if (!ssid.trim()) return false
  if (security !== 'nopass' && !password.trim()) return false
  return true
})

watch(isValid, (valid) => {
  emit('valid', valid)
}, { immediate: true })

const emitUpdate = () => {
  emit('update:modelValue', { ...localConfig.value })
}
</script>

<style scoped>
.wifi-form {
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

.checkbox-group {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.checkbox-label span {
  color: #34495e;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fadbd8;
  border-radius: 4px;
}
</style>
