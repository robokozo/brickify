<script setup lang="ts">
const useDithering = defineModel<boolean>('useDithering', { required: true })
const pieceType = defineModel<'Plate' | 'Tile'>('pieceType', { required: true })
const panelCols = defineModel<number>('panelCols', { default: 1 })
const panelRows = defineModel<number>('panelRows', { default: 1 })

interface PanelOption { cols: number; rows: number; label: string }
const panelOptions: PanelOption[] = [
  { cols: 1, rows: 1, label: '1×1' },
  { cols: 2, rows: 1, label: '2×1' },
  { cols: 1, rows: 2, label: '1×2' },
  { cols: 2, rows: 2, label: '2×2' },
  { cols: 3, rows: 2, label: '3×2' },
  { cols: 2, rows: 3, label: '2×3' },
  { cols: 3, rows: 3, label: '3×3' },
]
const isActive = (opt: PanelOption) => opt.cols === panelCols.value && opt.rows === panelRows.value
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

      <!-- Panel layout -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Panel Layout <span class="font-normal text-gray-400">(48×48 studs each)</span></p>
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in panelOptions" :key="`${opt.cols}x${opt.rows}`" type="button" :class="[
            'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
            isActive(opt)
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 text-gray-700 hover:border-blue-300',
          ]" @click="panelCols = opt.cols; panelRows = opt.rows">
            <div class="flex flex-col items-center gap-1">
              <!-- Mini grid icon -->
              <div class="grid gap-px" :style="{ gridTemplateColumns: `repeat(${opt.cols}, 8px)` }">
                <div v-for="n in opt.cols * opt.rows" :key="n" class="w-2 h-2 rounded-sm"
                  :class="isActive(opt) ? 'bg-blue-500' : 'bg-gray-300'" />
              </div>
              <span>{{ opt.label }}</span>
            </div>
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {{ panelCols * 48 }}×{{ panelRows * 48 }} studs total across {{ panelCols * panelRows }} panel{{ panelCols * panelRows > 1 ? 's' : '' }}
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
