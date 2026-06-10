<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import { computed, watch } from 'vue'
import type { VcardConfig } from '~/composables/useQrPayloads'

const model = defineModel<VcardConfig>({ required: true })

const emit = defineEmits<{
  (e: 'valid', value: boolean): void
}>()

const phonePattern = /^\+?[\d\s\-().]+$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlPattern = /^https?:\/\/[\w\-.]+(:\d+)?(\/[^\s]*)?$/

const hasName = computed(() =>
  (model.value.firstName + model.value.lastName).trim().length > 0,
)
const phoneOk = computed(() =>
  model.value.phone.trim().length === 0 || phonePattern.test(model.value.phone.trim()),
)
const emailOk = computed(() =>
  model.value.email.trim().length === 0 || emailPattern.test(model.value.email.trim()),
)
const websiteOk = computed(() =>
  model.value.website.trim().length === 0 || urlPattern.test(model.value.website.trim()),
)

const isValid = computed(() =>
  hasName.value && phoneOk.value && emailOk.value && websiteOk.value,
)

watch(isValid, (valid) => { emit('valid', valid) }, { immediate: true })
</script>

<template>
  <BrickCard color="yellow" title="👤 Contact Card">
    <div class="p-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name <span class="text-red-500">*</span>
          </label>
          <input v-model="model.firstName" type="text" placeholder="Ada"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input v-model="model.lastName" type="text" placeholder="Lovelace"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input v-model="model.phone" type="tel" placeholder="+1 555 123 4567"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="model.email" type="email" placeholder="ada@example.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization</label>
          <input v-model="model.organization" type="text" placeholder="Optional"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input v-model="model.title" type="text" placeholder="Optional"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input v-model="model.website" type="url" placeholder="https://example.com (optional)"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
      </div>

      <div v-if="!hasName" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        A first or last name is required
      </div>
      <div v-if="!phoneOk" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Invalid phone number format
      </div>
      <div v-if="!emailOk" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Must be a valid email address
      </div>
      <div v-if="!websiteOk" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        Website must be a valid URL starting with https:// or http://
      </div>

      <p class="text-xs text-gray-500">
        Contact cards hold a lot of data, which makes the QR code (and the brick build) bigger.
        Fill in only what you need to keep the build small.
      </p>
    </div>
  </BrickCard>
</template>
