<script setup lang="ts">
import { computed } from 'vue'
import { QR_TYPE_LIST } from '~/composables/useQrPayloads'
import type { QrContentType } from '~/composables/useQrPayloads'

const props = defineProps<{
  modelValue: QrContentType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: QrContentType): void
}>()

const isSelected = computed(() => (type: QrContentType) => props.modelValue === type)
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">🔲 QR Code Type</h2>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button v-for="info in QR_TYPE_LIST" :key="info.type" type="button" :class="[
          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors text-left',
          isSelected(info.type)
            ? 'border-blue-500 bg-blue-50 text-blue-900'
            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50',
        ]" @click="emit('update:modelValue', info.type)">
          <span class="text-2xl">{{ info.icon }}</span>
          <span class="font-semibold text-sm">{{ info.label }}</span>
          <span class="text-xs text-gray-500 text-center leading-tight">{{ info.description }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
