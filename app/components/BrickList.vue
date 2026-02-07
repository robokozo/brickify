<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-2xl font-semibold text-gray-900">📋 Parts List</h2>
    </div>

    <div v-if="optimizedBrickCount" class="p-6 space-y-6">
      <!-- Optimization Summary -->
      <div v-if="optimizedBrickCount.savingsPercent > 0"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        <div class="font-semibold">Optimized Build!</div>
        <div class="text-sm">Using larger bricks saves {{ optimizedBrickCount.savingsPercent }}% pieces ({{
          brickCount.total - optimizedBrickCount.total }} fewer pieces)</div>
      </div>

      <!-- Foreground Bricks -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">Foreground (Dark modules)</h3>
        <div class="space-y-2">
          <div v-for="brick in optimizedBrickCount.foreground" :key="brick.size"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="w-14 h-14 rounded-md border-2 border-gray-400 shadow-sm" :style="{ background: foreground }">
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">{{ brick.size }} Plate/Tile</div>
              <div class="text-sm text-gray-500">{{ foreground }}</div>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {{ brick.count }} pieces
            </span>
          </div>
        </div>
        <div class="mt-2 text-right text-sm font-medium text-gray-600">
          Subtotal: {{ optimizedBrickCount.foregroundTotal }} pieces
        </div>
      </div>

      <!-- Background Bricks -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">Background (Light modules)</h3>
        <div class="space-y-2">
          <div v-for="brick in optimizedBrickCount.background" :key="brick.size"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="w-14 h-14 rounded-md border-2 border-gray-400 shadow-sm" :style="{ background: background }">
            </div>
            <div class="flex-1">
              <div class="font-semibold text-gray-900">{{ brick.size }} Plate/Tile</div>
              <div class="text-sm text-gray-500">{{ background }}</div>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {{ brick.count }} pieces
            </span>
          </div>
        </div>
        <div class="mt-2 text-right text-sm font-medium text-gray-600">
          Subtotal: {{ optimizedBrickCount.backgroundTotal }} pieces
        </div>
      </div>

      <!-- Total Count -->
      <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-lg">
        <strong>Total pieces needed: {{ optimizedBrickCount.total }}</strong>
      </div>

      <!-- Shopping Tips -->
      <div class="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
        <div class="font-semibold">💡 Shopping Tips</div>
        <ul class="mt-2 space-y-1 text-sm list-disc list-inside">
          <li>Plates are approximately 3.2mm thick</li>
          <li>Tiles have a smooth top surface (recommended for finished look)</li>
          <li>Consider ordering 5-10% extra pieces for any mistakes</li>
          <li>Both foreground and background pieces should be opaque for best scanning</li>
          <li>Larger bricks are easier to work with and more stable</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 flex-wrap">
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2"
          @click="printPartsList">
          🖨️ Print Parts List
        </button>
        <button
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg shadow transition-colors flex items-center gap-2"
          @click="copyPartsList">
          📋 Copy to Clipboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrickCount, OptimizedBrickCount } from '~/composables/useLegoConverter'

const props = defineProps<{
  brickCount: BrickCount
  optimizedBrickCount: OptimizedBrickCount | null
  foreground: string
  background: string
}>()

const printPartsList = () => {
  if (!props.optimizedBrickCount) return

  const foregroundList = props.optimizedBrickCount.foreground
    .map(b => `- ${b.size} Plate/Tile: ${b.count} pieces`)
    .join('\n')

  const backgroundList = props.optimizedBrickCount.background
    .map(b => `- ${b.size} Plate/Tile: ${b.count} pieces`)
    .join('\n')

  const printContent = `
LEGO WiFi QR Code - Optimized Parts List
=========================================

FOREGROUND (Dark modules) - Color: ${props.foreground}
${foregroundList}
Subtotal: ${props.optimizedBrickCount.foregroundTotal} pieces

BACKGROUND (Light modules) - Color: ${props.background}
${backgroundList}
Subtotal: ${props.optimizedBrickCount.backgroundTotal} pieces

TOTAL PIECES NEEDED: ${props.optimizedBrickCount.total}

Optimization: Saved ${props.optimizedBrickCount.savingsPercent}% 
(${props.brickCount.total - props.optimizedBrickCount.total} fewer pieces than using only 1×1 bricks)

Shopping Tips:
- Order 5-10% extra pieces for any mistakes
- Both colors should be opaque for best scanning
- Tiles have smooth tops (recommended for finished look)
- Plates are 3.2mm thick
- Larger bricks are easier to work with and more stable
  `.trim()

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>LEGO WiFi QR Code - Parts List</title>
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
  if (!props.optimizedBrickCount) return

  const foregroundList = props.optimizedBrickCount.foreground
    .map(b => `${b.count}× ${b.size}`)
    .join(', ')

  const backgroundList = props.optimizedBrickCount.background
    .map(b => `${b.count}× ${b.size}`)
    .join(', ')

  const text = `LEGO WiFi QR Code - Optimized Parts List

Foreground (${props.foreground}): ${foregroundList}
Total: ${props.optimizedBrickCount.foregroundTotal} pieces

Background (${props.background}): ${backgroundList}
Total: ${props.optimizedBrickCount.backgroundTotal} pieces

TOTAL: ${props.optimizedBrickCount.total} pieces
Savings: ${props.optimizedBrickCount.savingsPercent}% (${props.brickCount.total - props.optimizedBrickCount.total} fewer pieces)`

  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.brick-list {
  /* Additional custom styles if needed */
}
</style>
