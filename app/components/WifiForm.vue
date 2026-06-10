<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import { computed, watch } from 'vue'
import type { WifiConfig } from '~/composables/useQrPayloads'

const model = defineModel<WifiConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const securityOptions = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'No Password' },
]

const isValid = computed(() => {
  const { ssid, password, security } = model.value
  if (!ssid.trim()) return false
  if (security !== 'nopass' && !password.trim()) return false
  return true
})

watch(isValid, (valid) => {
  emit('valid', valid)
}, { immediate: true })
</script>

<template>
  <BrickCard color="yellow" title="📶 WiFi Credentials">

    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Network Name (SSID) <span class="text-red-500">*</span>
        </label>
        <input v-model="model.ssid" type="text" placeholder="My WiFi Network"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Security Type <span class="text-red-500">*</span>
        </label>
        <select v-model="model.security"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
          <option v-for="option in securityOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-if="model.security !== 'nopass'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Password <span class="text-red-500">*</span>
        </label>
        <input v-model="model.password" type="text" placeholder="Your WiFi password"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
      </div>

      <div class="flex items-center gap-2">
        <input id="hidden-network" v-model="model.hidden" type="checkbox"
          class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <label for="hidden-network" class="text-sm font-medium text-gray-700">Hidden Network</label>
      </div>

      <div v-if="!isValid" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Please fill in all required fields
      </div>
    </div>
  </BrickCard>
</template>
