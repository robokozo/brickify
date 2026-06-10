<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import BrickButton from '~/components/BrickButton.vue'
import { ref, computed } from 'vue'
import type { MosaicColorGroup } from '~/composables/useMosaicConverter'
import type { BrickColor } from '~/composables/useBrickPalette'

const props = withDefaults(defineProps<{
  colorGroups: MosaicColorGroup[]
  totalPieces: number
  pieceType: 'Plate' | 'Tile'
  /** Color provided by the baseplate instead of placed pieces, if any */
  baseplateColor?: BrickColor | null
  /** How many pieces the baseplate color saves */
  baseplateSavings?: number
}>(), {
  baseplateColor: null,
  baseplateSavings: 0,
})

// BrickLink 1×1 part numbers by piece type
const PART_1X1_PLATE = '3024'
const PART_1X1_TILE = '3070'

const platePartNumbers: Record<string, string> = {
  '1×1': '3024', '1×2': '3023', '1×3': '3623', '1×4': '3710',
  '1×6': '3666', '1×8': '3460', '1×10': '4477', '1×12': '60479',
  '2×2': '3022', '2×3': '3021', '2×4': '3020', '2×6': '3795', '2×8': '3034',
  '2×10': '3832', '2×12': '2445', '2×14': '91988', '2×16': '4282',
  '4×4': '3031', '4×6': '3032', '4×8': '3035', '4×10': '3030',
  '6×6': '3958', '6×8': '3036', '8×16': '92438',
}

const tilePartNumbers: Record<string, string> = {
  '1×1': '3070', '1×2': '3069', '1×3': '63864', '1×4': '2431',
  '1×6': '6636', '1×8': '4162',
  '2×2': '3068', '2×3': '26603', '2×4': '87079', '2×6': '69729',
  '4×4': '1751', '6×6': '10202', '8×16': '90498',
}

const getPartNumber = ({ width, height }: { width: number; height: number }): string | null => {
  const key1 = `${width}×${height}`
  const key2 = `${height}×${width}`
  const lookup = props.pieceType === 'Plate' ? platePartNumbers : tilePartNumbers
  return lookup[key1] ?? lookup[key2] ?? null
}

const expandedColorId = ref<string | null>(null)

const toggleColor = (colorId: string): void => {
  expandedColorId.value = expandedColorId.value === colorId ? null : colorId
}

const isExpanded = (colorId: string): boolean => expandedColorId.value === colorId

// --- Print ---
const printPartsList = (): void => {
  const lines: string[] = [
    'Brick Mosaic Parts List',
    '=======================',
    '',
  ]

  if (props.baseplateColor !== null) {
    lines.push(`Baseplate: ${props.baseplateColor.name} (${props.baseplateColor.hex}), provides this color in place of ${props.baseplateSavings} pieces`, '')
  }

  for (const group of props.colorGroups) {
    lines.push(`${group.color.name} (${group.color.hex}): ${group.total} pieces`)
    for (const brick of group.bricks) {
      const part = getPartNumber({ width: brick.width, height: brick.height })
      lines.push(`  ${brick.width}×${brick.height} ${props.pieceType}${part !== null ? ` (Part ${part})` : ''}: ${brick.count} pcs`)
    }
    lines.push('')
  }

  lines.push(`TOTAL: ${props.totalPieces} pieces`)

  const printWindow = window.open('', '_blank')
  if (printWindow !== null) {
    printWindow.document.write(`<html><head><title>Brick Mosaic Parts List</title>
      <style>body{font-family:Arial,sans-serif;padding:2rem;max-width:800px;margin:0 auto}
      pre{white-space:pre-wrap;background:#f5f5f5;padding:1rem;border-radius:4px;line-height:1.6}</style>
      </head><body><pre>${lines.join('\n')}</pre></body></html>`)
    printWindow.document.close()
    printWindow.print()
  }
}

// --- Copy ---
const copyPartsList = async (): Promise<void> => {
  const lines: string[] = ['Brick Mosaic Parts List', '']

  if (props.baseplateColor !== null) {
    lines.push(`Baseplate: ${props.baseplateColor.name} (${props.baseplateColor.hex})`)
  }

  for (const group of props.colorGroups) {
    const brickSummary = group.bricks
      .map((b) => {
        const part = getPartNumber({ width: b.width, height: b.height })
        return `${b.count}× ${b.width}×${b.height}${part !== null ? ` (${part})` : ''}`
      })
      .join(', ')
    lines.push(`${group.color.name}: ${brickSummary}`)
  }

  lines.push(``, `TOTAL: ${props.totalPieces} pieces`)

  try {
    await navigator.clipboard.writeText(lines.join('\n'))
  } catch {
    // clipboard unavailable, fail silently
  }
}

// Luminance helper to choose readable text color on color swatch
const textColorForHex = (hex: string): 'white' | 'black' => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.4 ? 'black' : 'white'
}
</script>

<template>
  <BrickCard color="green" title="Parts List">

    <div class="p-5 space-y-4">
      <!-- Total summary -->
      <div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
        <strong>Total pieces: {{ totalPieces }}</strong>
        &nbsp;·&nbsp;
        {{ colorGroups.length }} colors
      </div>

      <!-- Baseplate savings -->
      <div v-if="baseplateColor !== null"
        class="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
        <div class="w-6 h-6 rounded border border-gray-300 shrink-0"
          :style="{ backgroundColor: baseplateColor.hex }" />
        <span>
          <strong>{{ baseplateColor.name }}</strong> comes from the baseplate, saving
          {{ baseplateSavings }} pieces
        </span>
      </div>

      <!-- Per-color accordion -->
      <div v-for="group in colorGroups" :key="group.colorId" class="border border-gray-200 rounded-lg overflow-hidden">

        <!-- Color header row -->
        <button type="button" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          @click="toggleColor(group.colorId)">
          <!-- Color swatch -->
          <div
            class="w-8 h-8 rounded border border-gray-300 shrink-0 flex items-center justify-center text-xs font-bold"
            :style="{ backgroundColor: group.color.hex, color: textColorForHex(group.color.hex) }">
          </div>
          <!-- Color info -->
          <div class="flex-1 text-left">
            <span class="font-semibold text-gray-900">{{ group.color.name }}</span>
            <span class="ml-2 text-xs text-gray-500 font-mono">{{ group.color.hex }}</span>
          </div>
          <!-- Piece count badge -->
          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shrink-0">
            {{ group.total }} pcs
          </span>
          <!-- Chevron -->
          <span class="text-gray-400 shrink-0 transition-transform"
            :class="isExpanded(group.colorId) ? 'rotate-180' : ''">▾</span>
        </button>

        <!-- Brick breakdown (expanded) -->
        <div v-if="isExpanded(group.colorId)" class="border-t border-gray-100 divide-y divide-gray-100">
          <div v-for="brick in group.bricks" :key="`${brick.width}x${brick.height}`"
            class="flex items-center gap-3 px-4 py-2.5 bg-gray-50 text-sm">
            <!-- Brick size swatch -->
            <div class="shrink-0 rounded border border-gray-300" :style="{
              backgroundColor: group.color.hex,
              width: `${Math.min(brick.width, 4) * 14}px`,
              height: `${Math.min(brick.height, 4) * 14}px`,
            }" />
            <div class="flex-1 text-gray-800 font-medium">
              {{ brick.width }}×{{ brick.height }} {{ pieceType }}
            </div>
            <div v-if="getPartNumber({ width: brick.width, height: brick.height }) !== null"
              class="text-xs text-gray-500 font-mono">
              Part {{ getPartNumber({ width: brick.width, height: brick.height }) }}
            </div>
            <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium shrink-0">
              {{ brick.count }} pcs
            </span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 flex-wrap pt-2">
        <BrickButton color="green" @click="printPartsList">
          🖨️ Print Parts List
        </BrickButton>
        <BrickButton color="gray" @click="copyPartsList">
          📋 Copy to Clipboard
        </BrickButton>
      </div>
    </div>
  </BrickCard>
</template>
