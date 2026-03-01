<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'upload', file: File): void
}>()

const isDragging = ref(false)
const previewUrl = ref<string | null>(null)
const fileName = ref<string | null>(null)

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const processFile = (file: File): void => {
  if (!ACCEPTED_TYPES.includes(file.type)) return

  if (previewUrl.value !== null) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  fileName.value = file.name
  emit('upload', file)
}

const onFileInput = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file !== undefined) processFile(file)
}

const onDrop = (event: DragEvent): void => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file !== undefined) processFile(file)
}

const onDragOver = (event: DragEvent): void => {
  event.preventDefault()
  isDragging.value = true
}

const onDragLeave = (): void => {
  isDragging.value = false
}

const onPaste = (event: ClipboardEvent): void => {
  const items = event.clipboardData?.items
  if (items === undefined) return
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file !== null) {
        processFile(file)
        break
      }
    }
  }
}

onMounted(() => { window.addEventListener('paste', onPaste) })
onUnmounted(() => { window.removeEventListener('paste', onPaste) })
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">🖼️ Upload Image</h2>
    </div>
    <div class="p-6">
      <label :class="[
        'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors',
        isDragging === true
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50',
      ]" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" @change="onFileInput" />

        <div v-if="previewUrl !== null" class="flex flex-col items-center gap-3">
          <img :src="previewUrl" alt="Uploaded preview"
            class="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow" />
          <p class="text-sm text-gray-600 font-medium">{{ fileName }}</p>
          <p class="text-xs text-blue-600">Click or drop a new image to replace</p>
        </div>

        <div v-else class="flex flex-col items-center gap-2 text-gray-500">
          <span class="text-5xl">📁</span>
          <p class="text-base font-medium text-gray-700">Drop, paste, or click to browse</p>
          <p class="text-xs text-gray-400">JPEG, PNG, WebP, or GIF · Ctrl+V / ⌘V to paste from clipboard</p>
        </div>
      </label>
    </div>
  </div>
</template>
