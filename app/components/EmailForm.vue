<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { EmailConfig } from '~/composables/useQrPayloads'

const props = defineProps<{
  modelValue: EmailConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: EmailConfig): void
  (e: 'valid', value: boolean): void
}>()

const local = ref<EmailConfig>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (newValue) => {
    local.value = { ...newValue }
  },
  { deep: true },
)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValid = computed(() => emailPattern.test(local.value.address.trim()))

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })

const emitUpdate = () => { emit('update:modelValue', { ...local.value }) }
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">✉️ Email</h2>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span class="text-red-500">*</span>
        </label>
        <input v-model="local.address" type="email" placeholder="someone@example.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          @input="emitUpdate" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input v-model="local.subject" type="text" placeholder="Optional subject line"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          @input="emitUpdate" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Body</label>
        <textarea v-model="local.body" rows="3" placeholder="Optional message body"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y"
          @input="emitUpdate" />
      </div>
      <div v-if="local.address.trim().length > 0 && !isValid"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Must be a valid email address
      </div>
      <div v-if="!isValid && local.address.trim().length === 0"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Email address is required
      </div>
    </div>
  </div>
</template>
