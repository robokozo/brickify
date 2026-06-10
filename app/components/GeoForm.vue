<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import { computed, watch } from 'vue'
import type { GeoConfig } from '~/composables/useQrPayloads'

const model = defineModel<GeoConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const latPattern = /^-?([0-8]?\d(\.\d+)?|90(\.0+)?)$/
const lonPattern = /^-?((1[0-7]\d|[0-9]?\d)(\.\d+)?|180(\.0+)?)$/

const isLatValid = computed(() => latPattern.test(model.value.latitude.trim()))
const isLonValid = computed(() => lonPattern.test(model.value.longitude.trim()))
const isValid = computed(
  () =>
    model.value.latitude.trim().length > 0 &&
    model.value.longitude.trim().length > 0 &&
    isLatValid.value &&
    isLonValid.value,
)

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })
</script>

<template>
  <BrickCard color="yellow" title="📍 Location">
    <div class="p-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Latitude <span class="text-red-500">*</span>
          </label>
          <input v-model="model.latitude" type="text" placeholder="48.8584"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          <p class="mt-1 text-xs text-gray-500">−90 to 90</p>
          <p v-if="model.latitude.trim().length > 0 && !isLatValid" class="mt-1 text-xs text-red-600">Invalid latitude
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Longitude <span class="text-red-500">*</span>
          </label>
          <input v-model="model.longitude" type="text" placeholder="2.2945"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          <p class="mt-1 text-xs text-gray-500">−180 to 180</p>
          <p v-if="model.longitude.trim().length > 0 && !isLonValid" class="mt-1 text-xs text-red-600">Invalid longitude
          </p>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
        <input v-model="model.query" type="text" placeholder="Optional place name or address"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        <p class="mt-1 text-xs text-gray-500">Opens a map app on mobile devices</p>
      </div>
      <div v-if="!isValid && (model.latitude.trim().length === 0 || model.longitude.trim().length === 0)"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Latitude and longitude are required
      </div>
    </div>
  </BrickCard>
</template>
