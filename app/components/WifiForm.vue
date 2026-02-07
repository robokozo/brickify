<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-semibold text-gray-900">📶 WiFi Credentials</h2>
    </template>

    <div class="space-y-4">
      <UFormGroup label="Network Name (SSID)" required>
        <UInput
          v-model="localConfig.ssid"
          placeholder="My WiFi Network"
          size="lg"
          @input="emitUpdate"
        />
      </UFormGroup>

      <UFormGroup label="Security Type" required>
        <USelect
          v-model="localConfig.security"
          :options="securityOptions"
          size="lg"
          @change="emitUpdate"
        />
      </UFormGroup>

      <UFormGroup 
        v-if="localConfig.security !== 'nopass'" 
        label="Password" 
        required
      >
        <UInput
          v-model="localConfig.password"
          type="text"
          placeholder="Your WiFi password"
          size="lg"
          @input="emitUpdate"
        />
      </UFormGroup>

      <UCheckbox
        v-model="localConfig.hidden"
        label="Hidden Network"
        @change="emitUpdate"
      />

      <UAlert
        v-if="!isValid"
        color="red"
        variant="soft"
        title="Please fill in all required fields"
      />
    </div>
  </UCard>
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
