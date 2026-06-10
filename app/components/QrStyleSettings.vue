<script setup lang="ts">
import { computed } from 'vue'
import type { EyeShape, GradientDirection } from '~/composables/useQrStyling'
import { GRADIENT_STEPS } from '~/composables/useQrStyling'
import BrickCard from '~/components/BrickCard.vue'

const props = defineProps<{
  foreground: string
  background: string
}>()

const eyeShape = defineModel<EyeShape>('eyeShape', { default: 'square' })
const eyeColor = defineModel<string | null>('eyeColor', { default: null })
const gradientEnabled = defineModel<boolean>('gradientEnabled', { default: false })
const gradientColor = defineModel<string>('gradientColor', { default: '#0061b3' })
const gradientDirection = defineModel<GradientDirection>('gradientDirection', { default: 'diagonal' })

const { getContrastRating } = useContrastChecker()

const DEFAULT_EYE_COLOR = '#D6001C'

const useCustomEyeColor = computed({
  get: () => eyeColor.value !== null,
  set: (enabled: boolean) => {
    eyeColor.value = enabled ? DEFAULT_EYE_COLOR : null
  },
})

// Proxy so the color input always has a string to bind to
const eyeColorInput = computed({
  get: () => eyeColor.value ?? DEFAULT_EYE_COLOR,
  set: (value: string) => { eyeColor.value = value },
})

const directionOptions: Array<{ value: GradientDirection; label: string }> = [
  { value: 'diagonal', label: '↘ Diagonal' },
  { value: 'horizontal', label: '→ Horizontal' },
  { value: 'vertical', label: '↓ Vertical' },
  { value: 'radial', label: '◎ Radial' },
]

// Every styled color still has to contrast with the background or the code
// stops scanning, so warn when one falls below WCAG AA
const contrastWarnings = computed(() => {
  const warnings: Array<string> = []
  if (eyeColor.value !== null) {
    const rating = getContrastRating(eyeColor.value, props.background)
    if (rating.level === 'poor') {
      warnings.push(`Corner color contrast is low (${rating.ratio}:1). Corners are what scanners find first, so keep them dark on a light background.`)
    }
  }
  if (gradientEnabled.value === true) {
    const rating = getContrastRating(gradientColor.value, props.background)
    if (rating.level === 'poor') {
      warnings.push(`Gradient end color contrast is low (${rating.ratio}:1). Light gradient ends may make parts of the code unscannable.`)
    }
  }
  return warnings
})
</script>

<template>
  <BrickCard color="red" title="✨ Style">
    <div class="p-6 space-y-6">

      <!-- Corner (finder pattern) style -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Corner Marker Shape</p>
        <div class="flex gap-3">
          <button v-for="shape in (['square', 'round'] as const)" :key="shape" type="button" :class="[
            'flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors',
            eyeShape === shape
              ? 'border-brick-blue bg-blue-50 text-brick-blue'
              : 'border-gray-200 text-gray-700 hover:border-brick-blue/50',
          ]" @click="eyeShape = shape">
            {{ shape === 'square' ? '⬛ Square pieces' : '⚫ Round pieces' }}
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Round uses 1×1 round pieces in the three corner markers for a dotted look
        </p>
      </div>

      <!-- Corner color -->
      <div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="useCustomEyeColor" type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-brick-blue focus:ring-blue-400" />
          <span class="text-sm font-medium text-gray-700">Custom corner color</span>
        </label>
        <div v-if="useCustomEyeColor" class="flex gap-2 items-center mt-2">
          <input v-model="eyeColorInput" type="color"
            class="w-15 h-12 border-2 border-gray-300 rounded-md cursor-pointer" />
          <input v-model="eyeColorInput" type="text"
            class="flex-1 min-w-0 p-3 border-2 border-gray-300 rounded-md text-base font-mono focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <!-- Gradient -->
      <div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="gradientEnabled" type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-brick-blue focus:ring-blue-400" />
          <span class="text-sm font-medium text-gray-700">Gradient foreground</span>
        </label>
        <div v-if="gradientEnabled" class="mt-2 space-y-3">
          <div class="flex gap-2 items-center">
            <div class="w-12 h-12 rounded-md border-2 border-gray-300 shrink-0"
              :style="{ background: `linear-gradient(135deg, ${foreground}, ${gradientColor})` }" />
            <input v-model="gradientColor" type="color"
              class="w-15 h-12 border-2 border-gray-300 rounded-md cursor-pointer" />
            <input v-model="gradientColor" type="text"
              class="flex-1 min-w-0 p-3 border-2 border-gray-300 rounded-md text-base font-mono focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label for="gradient-direction" class="block mb-1 text-sm font-medium text-gray-700">Direction</label>
            <select id="gradient-direction" v-model="gradientDirection"
              class="w-full px-3 py-2.5 border-2 border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-blue-500">
              <option v-for="option in directionOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <p class="text-xs text-gray-500">
            The gradient runs from the foreground color to this one in {{ GRADIENT_STEPS }} brick
            colors, each listed separately in the parts list
          </p>
        </div>
      </div>

      <!-- Contrast warnings -->
      <div v-for="(warning, i) in contrastWarnings" :key="i"
        class="p-3 bg-amber-100 border-l-4 border-amber-500 rounded text-amber-800 text-sm">
        ⚠️ {{ warning }}
      </div>

    </div>
  </BrickCard>
</template>
