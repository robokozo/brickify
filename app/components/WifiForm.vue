<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">📶 WiFi Credentials</h2>
    </div>

    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Network Name (SSID) <span class="text-red-500">*</span>
        </label>
        <input v-model="localConfig.ssid" type="text" placeholder="My WiFi Network"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          @input="emitUpdate" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Security Type <span class="text-red-500">*</span>
        </label>
        <select v-model="localConfig.security"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          @change="emitUpdate">
          <option v-for="option in securityOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-if="localConfig.security !== 'nopass'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Password <span class="text-red-500">*</span>
        </label>
        <input v-model="localConfig.password" type="text" placeholder="Your WiFi password"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          @input="emitUpdate" />
      </div>

      <div class="flex items-center gap-2">
        <input id="hidden-network" v-model="localConfig.hidden" type="checkbox"
          class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" @change="emitUpdate" />
        <label for="hidden-network" class="text-sm font-medium text-gray-700">Hidden Network</label>
      </div>

      <div v-if="!isValid" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Please fill in all required fields
      </div>
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

const securityOptions = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'No Password' }
]

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
