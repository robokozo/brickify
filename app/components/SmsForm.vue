<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import { computed, watch } from 'vue'
import type { SmsConfig } from '~/composables/useQrPayloads'

const model = defineModel<SmsConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const phonePattern = /^\+?[\d\s\-().]+$/

const isValid = computed(
  () => model.value.phone.trim().length > 0 && phonePattern.test(model.value.phone.trim()),
)

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })
</script>

<template>
  <BrickCard color="yellow" title="💬 SMS">
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <input v-model="model.phone" type="tel" placeholder="+1 (555) 000-0000"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        <p class="mt-1 text-xs text-gray-500">Digits, spaces, +, -, ( ) allowed</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea v-model="model.message" rows="3" placeholder="Optional pre-filled message"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y" />
      </div>
      <div v-if="model.phone.trim().length > 0 && !isValid"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Invalid phone number format
      </div>
      <div v-if="model.phone.trim().length === 0"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Phone number is required
      </div>
    </div>
  </BrickCard>
</template>
