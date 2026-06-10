<script setup lang="ts">
import BrickCard from '~/components/BrickCard.vue'
import BrickButton from '~/components/BrickButton.vue'
import { ref, computed } from 'vue'
import type { BrickCount, BrickTypeCount } from '~/composables/useBrickConverter'
import type { StyledQrBuild, StyledColorGroup } from '~/composables/useQrStyling'

const props = withDefaults(defineProps<{
  brickCount: BrickCount
  styledBuild: StyledQrBuild | null
  foreground: string
  background: string
  foregroundPieceType?: 'Plate' | 'Tile'
  backgroundPieceType?: 'Plate' | 'Tile'
  useBaseplate?: boolean
  qrTypeLabel?: string
}>(), {
  foregroundPieceType: 'Plate',
  backgroundPieceType: 'Tile',
  useBaseplate: false,
  qrTypeLabel: 'QR Code',
})

// Part number mappings from brickarchitect.com
const platePartNumbers: Record<string, string> = {
  '1×1': '3024', '1×2': '3023', '1×3': '3623', '1×4': '3710', '1×5': '78329',
  '1×6': '3666', '1×8': '3460', '1×10': '4477', '1×12': '60479',
  '2×2': '3022', '2×3': '3021', '2×4': '3020', '2×6': '3795', '2×8': '3034',
  '2×10': '3832', '2×12': '2445', '2×14': '91988', '2×16': '4282',
  '3×3': '11212',
  '4×4': '3031', '4×6': '3032', '4×8': '3035', '4×10': '3030', '4×12': '3029',
  '6×6': '3958', '6×8': '3036', '6×10': '3033', '6×12': '3028',
  '8×16': '92438',
}

const tilePartNumbers: Record<string, string> = {
  '1×1': '3070', '1×2': '3069', '1×3': '63864', '1×4': '2431',
  '1×6': '6636', '1×8': '4162',
  '2×2': '3068', '2×3': '26603', '2×4': '87079', '2×6': '69729',
  '4×4': '1751', '6×6': '10202', '8×16': '90498',
}

// Round 1×1 pieces have their own part numbers
const ROUND_PLATE_1X1 = '4073'
const ROUND_TILE_1X1 = '98138'

const getPartNumber = (
  width: number,
  height: number,
  pieceType: 'Plate' | 'Tile',
  round = false,
): string | null => {
  if (round) {
    return pieceType === 'Plate' ? ROUND_PLATE_1X1 : ROUND_TILE_1X1
  }
  // Try both orientations (width×height and height×width)
  const key1 = `${width}×${height}`
  const key2 = `${height}×${width}`
  const lookup = pieceType === 'Plate' ? platePartNumbers : tilePartNumbers
  return lookup[key1] || lookup[key2] || null
}

const getPartDisplay = (
  width: number,
  height: number,
  pieceType: 'Plate' | 'Tile',
  round = false,
): string => {
  const partNumber = getPartNumber(width, height, pieceType, round)
  const baseName = `${width}×${height}${round ? ' Round' : ''} ${pieceType}`
  return partNumber ? `${baseName} (Part ${partNumber})` : baseName
}

type SortOption = 'size-desc' | 'size-asc' | 'count-desc' | 'count-asc'

const sortBy = ref<SortOption>('count-desc')

const sortOptions = [
  { value: 'size-desc', label: 'Size (largest first)' },
  { value: 'size-asc', label: 'Size (smallest first)' },
  { value: 'count-desc', label: 'Count (most first)' },
  { value: 'count-asc', label: 'Count (fewest first)' },
]

const sortBricks = (bricks: BrickTypeCount[]): BrickTypeCount[] => {
  return [...bricks].sort((a, b) => {
    const areaA = a.width * a.height
    const areaB = b.width * b.height

    switch (sortBy.value) {
      case 'size-desc':
        return areaB - areaA || b.width - a.width
      case 'size-asc':
        return areaA - areaB || a.width - b.width
      case 'count-desc':
        return b.count - a.count || areaB - areaA
      case 'count-asc':
        return a.count - b.count || areaA - areaB
      default:
        return 0
    }
  })
}

const sortedGroups = computed(() => {
  if (!props.styledBuild) return []
  return props.styledBuild.foregroundGroups.map((group) => ({
    ...group,
    counts: sortBricks(group.counts),
  }))
})

const sortedBackground = computed(() => {
  if (!props.styledBuild) return []
  return sortBricks(props.styledBuild.backgroundCounts)
})

// Single solid-color builds keep the original section heading
const groupHeading = (group: StyledColorGroup): string =>
  sortedGroups.value.length === 1 ? 'Foreground (Dark modules)' : group.label

const showForegroundStuds = computed(() => props.foregroundPieceType === 'Plate')
const showBackgroundStuds = computed(() => props.backgroundPieceType === 'Plate')

const displayTotal = computed(() => {
  if (!props.styledBuild) return 0
  if (props.useBaseplate) {
    return props.styledBuild.foregroundTotal
  }
  return props.styledBuild.total
})

const buildForegroundLines = (): string => {
  if (!props.styledBuild) return ''
  return props.styledBuild.foregroundGroups
    .map((group) => {
      const rows = group.counts
        .map((b) => `- ${getPartDisplay(b.width, b.height, props.foregroundPieceType, group.round)}: ${b.count} pieces`)
        .join('\n')
      return `${group.label.toUpperCase()} - Color: ${group.colorHex}\n${rows}\nSubtotal: ${group.total} pieces`
    })
    .join('\n\n')
}

const printPartsList = () => {
  if (!props.styledBuild) return

  const backgroundSection = props.useBaseplate
    ? `BACKGROUND: Using baseplate (${props.background})`
    : `BACKGROUND (Light modules) - Color: ${props.background}\n${props.styledBuild.backgroundCounts.map(b => `- ${getPartDisplay(b.width, b.height, props.backgroundPieceType)}: ${b.count} pieces`).join('\n')}\nSubtotal: ${props.styledBuild.backgroundTotal} pieces`

  const printContent = `
Brick ${props.qrTypeLabel} - Optimized Parts List
${'='.repeat((`Brick ${props.qrTypeLabel} - Optimized Parts List`).length)}

${buildForegroundLines()}

${backgroundSection}

TOTAL PIECES NEEDED: ${displayTotal.value}

Optimization: Saved ${props.styledBuild.savingsPercent}%
(${props.brickCount.total - props.styledBuild.total} fewer pieces than using only 1×1 bricks)

Shopping Tips:
- Order 5-10% extra pieces for any mistakes
- All colors should be opaque for best scanning
- Foreground: ${props.foregroundPieceType}s ${showForegroundStuds.value ? '(with studs)' : '(smooth top)'}
- Background: ${props.backgroundPieceType}s ${showBackgroundStuds.value ? '(with studs)' : '(smooth top)'}
- Tiles give a cleaner finished look, plates are easier to adjust
- Larger pieces are easier to work with and more stable
  `.trim()

  const printWindow = window.open('', '_blank')
  if (printWindow !== null && printWindow !== undefined) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Brick ${props.qrTypeLabel} - Parts List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            pre {
              white-space: pre-wrap;
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 4px;
              line-height: 1.6;
            }
            @media print {
              body { padding: 1rem; }
            }
          </style>
        </head>
        <body>
          <pre>${printContent}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

const copyPartsList = async () => {
  if (!props.styledBuild) return

  const foregroundSection = props.styledBuild.foregroundGroups
    .map((group) => {
      const rows = group.counts
        .map(b => {
          const partNum = getPartNumber(b.width, b.height, props.foregroundPieceType, group.round)
          return `${b.count}× ${b.width}×${b.height}${group.round ? ' round' : ''}${partNum ? ` (${partNum})` : ''}`
        })
        .join(', ')
      return `${group.label} (${group.colorHex}): ${rows}`
    })
    .join('\n')

  const backgroundSection = props.useBaseplate
    ? `Background: Using baseplate (${props.background})`
    : `Background (${props.background}): ${props.styledBuild.backgroundCounts.map(b => {
      const partNum = getPartNumber(b.width, b.height, props.backgroundPieceType)
      return `${b.count}× ${b.width}×${b.height}${partNum ? ` (${partNum})` : ''}`
    }).join(', ')}\nTotal: ${props.styledBuild.backgroundTotal} pieces`

  const text = `Brick ${props.qrTypeLabel} - Optimized Parts List

${foregroundSection}
Total: ${props.styledBuild.foregroundTotal} pieces

${backgroundSection}

TOTAL: ${displayTotal.value} pieces
Savings: ${props.styledBuild.savingsPercent}% (${props.brickCount.total - props.styledBuild.total} fewer pieces)`

  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <BrickCard color="yellow" title="📋 Parts List">

    <div v-if="styledBuild" class="p-6 space-y-6">
      <!-- Optimization Summary -->
      <div v-if="styledBuild.savingsPercent > 0"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        <div class="font-semibold">Optimized Build!</div>
        <div class="text-sm">Using larger bricks saves {{ styledBuild.savingsPercent }}% pieces ({{
          brickCount.total - styledBuild.total }} fewer pieces)</div>
      </div>

      <!-- Sort Control -->
      <div class="flex items-center gap-2">
        <label for="sort" class="text-sm font-medium text-gray-700">Sort by:</label>
        <select id="sort" v-model="sortBy"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Foreground color groups -->
      <div v-for="group in sortedGroups" :key="`${group.colorHex}-${group.round}`">
        <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span class="w-5 h-5 rounded border border-gray-300 inline-block shrink-0"
            :class="group.round ? 'rounded-full' : ''" :style="{ backgroundColor: group.colorHex }" />
          {{ groupHeading(group) }}
          <span class="text-xs text-gray-400 font-mono font-normal">{{ group.colorHex }}</span>
        </h3>
        <div class="space-y-2">
          <div v-for="brick in group.counts" :key="`${group.colorHex}-${brick.width}x${brick.height}`"
            class="flex items-center flex-wrap gap-x-4 gap-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <BrickPreview :width="brick.width" :height="brick.height" :color="group.colorHex"
              :show-studs="showForegroundStuds" :round="group.round" />
            <div class="flex-1">
              <div class="font-semibold text-gray-900">
                {{ brick.width }}×{{ brick.height }}{{ group.round ? ' Round' : '' }} {{ foregroundPieceType }}
              </div>
              <div v-if="getPartNumber(brick.width, brick.height, foregroundPieceType, group.round)"
                class="text-xs text-gray-500">
                Part {{ getPartNumber(brick.width, brick.height, foregroundPieceType, group.round) }}
              </div>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {{ brick.count }} pieces
            </span>
          </div>
        </div>
        <div class="mt-2 text-right text-sm font-medium text-gray-600">
          Subtotal: {{ group.total }} pieces
        </div>
      </div>

      <!-- Background Bricks -->
      <div v-if="!useBaseplate">
        <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span class="w-5 h-5 rounded border border-gray-300 inline-block shrink-0"
            :style="{ backgroundColor: background }" />
          Background (Light modules)
        </h3>
        <div class="space-y-2">
          <div v-for="brick in sortedBackground" :key="`bg-${brick.width}x${brick.height}`"
            class="flex items-center flex-wrap gap-x-4 gap-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <BrickPreview :width="brick.width" :height="brick.height" :color="background"
              :show-studs="showBackgroundStuds" />
            <div class="flex-1">
              <div class="font-semibold text-gray-900">{{ brick.width }}×{{ brick.height }} {{ backgroundPieceType }}
              </div>
              <div v-if="getPartNumber(brick.width, brick.height, backgroundPieceType)" class="text-xs text-gray-500">
                Part {{ getPartNumber(brick.width, brick.height, backgroundPieceType) }}
              </div>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {{ brick.count }} pieces
            </span>
          </div>
        </div>
        <div class="mt-2 text-right text-sm font-medium text-gray-600">
          Subtotal: {{ styledBuild.backgroundTotal }} pieces
        </div>
      </div>

      <!-- Total Count -->
      <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-lg">
        <strong>Total pieces needed: {{ displayTotal }}</strong>
      </div>


      <!-- Action Buttons -->
      <div class="flex gap-3 flex-wrap">
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
