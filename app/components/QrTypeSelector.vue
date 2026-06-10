<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import { computed } from 'vue'
import { QR_TYPE_LIST } from '~/composables/useQrPayloads'
import type { QrContentType } from '~/composables/useQrPayloads'

const modelValue = defineModel<QrContentType>({ required: true })

const isSelected = computed(() => (type: QrContentType) => modelValue.value === type)
</script>

<template>
  <BrickCard color="red" title="🔲 QR Code Type">
    <div class="p-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
        <button v-for="info in QR_TYPE_LIST" :key="info.type" type="button" :class="[
          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors text-left',
          isSelected(info.type)
            ? 'border-brick-blue bg-blue-50 text-brick-blue'
            : 'border-gray-200 bg-white text-gray-700 hover:border-brick-blue/50 hover:bg-blue-50',
        ]" @click="modelValue = info.type">
          <span class="text-2xl">{{ info.icon }}</span>
          <span class="font-semibold text-sm">{{ info.label }}</span>
          <span class="text-xs text-gray-500 text-center leading-tight">{{ info.description }}</span>
        </button>
      </div>
    </div>
  </BrickCard>
</template>
