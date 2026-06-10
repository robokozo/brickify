<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
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
  <BrickCard color="yellow" title="📝 Plain Text">
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
  </BrickCard>
</template>
