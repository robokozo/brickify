<script setup lang="ts">
import { computed, watch } from 'vue'
import type { PhoneConfig } from '~/composables/useQrPayloads'

const model = defineModel<PhoneConfig>({ required: true })

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
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">📞 Phone Number</h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <input v-model="model.phone" type="tel" placeholder="+1 (555) 000-0000"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        <p class="mt-1 text-xs text-gray-500">Digits, spaces, +, -, ( ) allowed</p>
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
  </div>
</template>
