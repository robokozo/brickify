<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GeoConfig } from '~/composables/useQrPayloads'

const props = defineProps<{
  modelValue: GeoConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GeoConfig): void
  (e: 'valid', value: boolean): void
}>()

const local = ref<GeoConfig>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (newValue) => {
    local.value = { ...newValue }
  },
  { deep: true },
)

const latPattern = /^-?([0-8]?\d(\.\d+)?|90(\.0+)?)$/
const lonPattern = /^-?((1[0-7]\d|[0-9]?\d)(\.\d+)?|180(\.0+)?)$/

const isLatValid = computed(() => latPattern.test(local.value.latitude.trim()))
const isLonValid = computed(() => lonPattern.test(local.value.longitude.trim()))
const isValid = computed(
  () =>
    local.value.latitude.trim().length > 0 &&
    local.value.longitude.trim().length > 0 &&
    isLatValid.value &&
    isLonValid.value,
)

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })

const emitUpdate = () => { emit('update:modelValue', { ...local.value }) }
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">📍 Location</h2>
    </div>
    <div class="p-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Latitude <span class="text-red-500">*</span>
          </label>
          <input v-model="local.latitude" type="text" placeholder="48.8584"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            @input="emitUpdate" />
          <p class="mt-1 text-xs text-gray-500">−90 to 90</p>
          <p v-if="local.latitude.trim().length > 0 && !isLatValid" class="mt-1 text-xs text-red-600">Invalid latitude
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Longitude <span class="text-red-500">*</span>
          </label>
          <input v-model="local.longitude" type="text" placeholder="2.2945"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            @input="emitUpdate" />
          <p class="mt-1 text-xs text-gray-500">−180 to 180</p>
          <p v-if="local.longitude.trim().length > 0 && !isLonValid" class="mt-1 text-xs text-red-600">Invalid longitude
          </p>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
        <input v-model="local.query" type="text" placeholder="Optional place name or address"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          @input="emitUpdate" />
        <p class="mt-1 text-xs text-gray-500">Opens a map app on mobile devices</p>
      </div>
      <div v-if="!isValid && (local.latitude.trim().length === 0 || local.longitude.trim().length === 0)"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Latitude and longitude are required
      </div>
    </div>
  </div>
</template>
