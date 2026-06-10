<script setup lang="ts">
import { ref, computed } from 'vue'
import BrickCard from '~/components/BrickCard.vue'
import { BRICK_COLORS } from '~/composables/useBrickPalette'

interface BaseplateOption {
  id: string
  name: string
  hex: string
  total: number
}

const props = withDefaults(defineProps<{
  baseplateOptions?: BaseplateOption[]
}>(), {
  baseplateOptions: () => [],
})

const useDithering = defineModel<boolean>('useDithering', { required: true })
const pieceType = defineModel<'Plate' | 'Tile'>('pieceType', { required: true })
const panelCols = defineModel<number>('panelCols', { default: 1 })
const panelRows = defineModel<number>('panelRows', { default: 1 })
const baseplateColorId = defineModel<string | null>('baseplateColorId', { default: null })
const maxColors = defineModel<number | null>('maxColors', { default: null })
const excludedColorIds = defineModel<string[]>('excludedColorIds', { default: () => [] })

const selectedBaseplate = computed(() =>
  props.baseplateOptions.find((o) => o.id === baseplateColorId.value) ?? null,
)

const onBaseplateChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value
  baseplateColorId.value = value.length > 0 ? value : null
}

// --- Palette controls ---
const MAX_COLOR_OPTIONS = [16, 12, 8, 6, 4]
const MIN_ALLOWED_COLORS = 2

const onMaxColorsChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value
  maxColors.value = value.length > 0 ? Number(value) : null
}

const showColorList = ref(false)
const allowedCount = computed(() => BRICK_COLORS.length - excludedColorIds.value.length)

const isExcluded = (id: string): boolean => excludedColorIds.value.includes(id)

const toggleColor = (id: string): void => {
  if (isExcluded(id)) {
    excludedColorIds.value = excludedColorIds.value.filter((c) => c !== id)
  } else {
    // Keep at least a couple of colors to map the image onto
    if (allowedCount.value <= MIN_ALLOWED_COLORS) return
    excludedColorIds.value = [...excludedColorIds.value, id]
  }
}

const useAllColors = (): void => {
  excludedColorIds.value = []
}

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
  <BrickCard color="yellow" title="Settings">
    <div class="p-5 space-y-5">

      <!-- Piece type -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Piece Type</p>
        <div class="flex gap-3">
          <button v-for="type in (['Plate', 'Tile'] as const)" :key="type" type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            pieceType === type
              ? 'border-brick-blue bg-blue-50 text-brick-blue'
              : 'border-gray-200 text-gray-700 hover:border-brick-blue/50',
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
        <p class="text-sm font-medium text-gray-700 mb-2">Panel Layout <span class="font-normal text-gray-400">(48×48
            studs each)</span></p>
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in panelOptions" :key="`${opt.cols}x${opt.rows}`" type="button" :class="[
            'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors',
            isActive(opt)
              ? 'border-brick-blue bg-blue-50 text-brick-blue'
              : 'border-gray-200 text-gray-700 hover:border-brick-blue/50',
          ]" @click="panelCols = opt.cols; panelRows = opt.rows">
            <div class="flex flex-col items-center gap-1">
              <!-- Mini grid icon -->
              <div class="grid gap-px" :style="{ gridTemplateColumns: `repeat(${opt.cols}, 8px)` }">
                <div v-for="n in opt.cols * opt.rows" :key="n" class="w-2 h-2 rounded-sm"
                  :class="isActive(opt) ? 'bg-brick-blue' : 'bg-gray-300'" />
              </div>
              <span>{{ opt.label }}</span>
            </div>
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {{ panelCols * 48 }}×{{ panelRows * 48 }} studs total across {{ panelCols * panelRows }} panel{{ panelCols *
            panelRows > 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Dithering -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Color Quantization</p>
        <div class="flex gap-3">
          <button type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            useDithering === false
              ? 'border-brick-blue bg-blue-50 text-brick-blue'
              : 'border-gray-200 text-gray-700 hover:border-brick-blue/50',
          ]" @click="useDithering = false">
            📌 Nearest Color
          </button>
          <button type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            useDithering === true
              ? 'border-brick-blue bg-blue-50 text-brick-blue'
              : 'border-gray-200 text-gray-700 hover:border-brick-blue/50',
          ]" @click="useDithering = true">
            🎨 Dithering
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Nearest color is sharp and blocky; dithering blends colors for smoother gradients
        </p>
      </div>

      <!-- Palette -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Colors</p>
        <div class="flex items-center gap-2">
          <label for="max-colors" class="text-sm text-gray-600 shrink-0">Max colors</label>
          <select id="max-colors" :value="maxColors ?? ''"
            class="flex-1 py-2.5 px-3 rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-700 bg-white focus:border-brick-blue focus:outline-none"
            @change="onMaxColorsChange">
            <option value="">No limit</option>
            <option v-for="n in MAX_COLOR_OPTIONS" :key="n" :value="n">{{ n }} colors</option>
          </select>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Fewer colors means fewer kinds of pieces to order; the most-used colors are kept
        </p>

        <button type="button" class="mt-2 text-sm font-semibold text-brick-blue hover:underline"
          @click="showColorList = !showColorList">
          {{ showColorList ? 'Hide' : 'Choose' }} available colors ({{ allowedCount }} of {{ BRICK_COLORS.length }})
        </button>
        <div v-if="showColorList" class="mt-2 space-y-2">
          <div class="flex flex-wrap gap-1.5">
            <button v-for="color in BRICK_COLORS" :key="color.id" type="button" :title="color.name" :class="[
              'w-7 h-7 rounded-md border-2 transition-all',
              isExcluded(color.id)
                ? 'border-gray-200 opacity-25 grayscale'
                : 'border-gray-400 hover:scale-110',
            ]" :style="{ backgroundColor: color.hex }" @click="toggleColor(color.id)" />
          </div>
          <p class="text-xs text-gray-500">
            Click a color to exclude it (for example, colors you do not own). Faded colors are not used.
          </p>
          <button v-if="excludedColorIds.length > 0" type="button"
            class="text-xs font-semibold text-brick-blue hover:underline" @click="useAllColors">
            Use all colors
          </button>
        </div>
      </div>

      <!-- Baseplate color -->
      <div v-if="baseplateOptions.length > 0">
        <p class="text-sm font-medium text-gray-700 mb-2">Baseplate Color</p>
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg border-2 shrink-0"
            :class="selectedBaseplate !== null ? 'border-gray-300' : 'border-dashed border-gray-300'"
            :style="{ backgroundColor: selectedBaseplate?.hex ?? 'transparent' }" />
          <select :value="baseplateColorId ?? ''"
            class="flex-1 py-2.5 px-3 rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-700 bg-white focus:border-brick-blue focus:outline-none"
            @change="onBaseplateChange">
            <option value="">None (place every piece)</option>
            <option v-for="option in baseplateOptions" :key="option.id" :value="option.id">
              {{ option.name }} (skips {{ option.total }} pieces)
            </option>
          </select>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Pieces matching the baseplate color are left off and the baseplate shows through,
          lowering the piece count
        </p>
      </div>

    </div>
  </BrickCard>
</template>
