<script setup lang="ts">
import { computed, watch } from 'vue'
import type { UrlConfig } from '~/composables/useQrPayloads'

const model = defineModel<UrlConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const urlPattern = /^https?:\/\/[\w\-.]+(:\d+)?(\/[^\s]*)?$/

const isValid = computed(() => urlPattern.test(model.value.url.trim()))

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">🔗 URL</h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          URL <span class="text-red-500">*</span>
        </label>
        <input v-model="model.url" type="url" placeholder="https://example.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        <p class="mt-1 text-xs text-gray-500">Include the full URL with https://</p>
      </div>
      <div v-if="model.url.trim().length > 0 && !isValid"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Must be a valid URL starting with https:// or http://
      </div>
    </div>
  </div>
</template>
