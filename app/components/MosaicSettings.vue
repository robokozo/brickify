<script setup lang="ts">
const useDithering = defineModel<boolean>('useDithering', { required: true })
const pieceType = defineModel<'Plate' | 'Tile'>('pieceType', { required: true })
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">⚙️ Settings</h2>
    </div>
    <div class="p-6 space-y-5">

      <!-- Piece type -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Piece Type</p>
        <div class="flex gap-3">
          <button v-for="type in (['Plate', 'Tile'] as const)" :key="type" type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            pieceType === type
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 text-gray-700 hover:border-blue-300',
          ]" @click="pieceType = type">
            {{ type === 'Plate' ? '🧱 Plate (studs)' : '🟦 Tile (smooth)' }}
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Tiles give a smooth finished surface; plates are more widely available
        </p>
      </div>

      <!-- Dithering -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Color Quantization</p>
        <div class="flex gap-3">
          <button type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            useDithering === false
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 text-gray-700 hover:border-blue-300',
          ]" @click="useDithering = false">
            📌 Nearest Color
          </button>
          <button type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            useDithering === true
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 text-gray-700 hover:border-blue-300',
          ]" @click="useDithering = true">
            🎨 Dithering
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Nearest color is sharp and blocky; dithering blends colors for smoother gradients
        </p>
      </div>

    </div>
  </div>
</template>
