<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import { computed, watch } from 'vue'
import type { EmailConfig } from '~/composables/useQrPayloads'

const model = defineModel<EmailConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValid = computed(() => emailPattern.test(model.value.address.trim()))

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })
</script>

<template>
  <BrickCard color="yellow" title="✉️ Email">
    <div class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span class="text-red-500">*</span>
        </label>
        <input v-model="model.address" type="email" placeholder="someone@example.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input v-model="model.subject" type="text" placeholder="Optional subject line"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Body</label>
        <textarea v-model="model.body" rows="3" placeholder="Optional message body"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y" />
      </div>
      <div v-if="model.address.trim().length > 0 && !isValid"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Must be a valid email address
      </div>
      <div v-if="!isValid && model.address.trim().length === 0"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Email address is required
      </div>
    </div>
  </BrickCard>
</template>
