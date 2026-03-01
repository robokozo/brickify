<script setup lang="ts">
import { computed, watch } from 'vue'
import type { TextConfig } from '~/composables/useQrPayloads'

const model = defineModel<TextConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const isValid = computed(() => model.value.text.trim().length > 0)

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">📝 Plain Text</h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Text <span class="text-red-500">*</span>
        </label>
        <textarea v-model="model.text" rows="4" placeholder="Enter any text…"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y" />
      </div>
      <div v-if="!isValid" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Please enter some text
      </div>
    </div>
  </div>
</template>
