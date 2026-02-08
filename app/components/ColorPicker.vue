<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ColorSuggestion } from '~/composables/useContrastChecker'
import type { BrickSize } from '~/composables/useBrickConverter'

const props = withDefaults(defineProps<{
  foreground: string
  background: string
  foregroundPieceType?: 'Plate' | 'Tile'
  backgroundPieceType?: 'Plate' | 'Tile'
  foregroundBrickSizes?: BrickSize[]
  backgroundBrickSizes?: BrickSize[]
  useBaseplate?: boolean
  baseplateSize?: number
  baseplateColor?: string
}>(), {
  foregroundPieceType: 'Plate',
  backgroundPieceType: 'Tile',
  foregroundBrickSizes: () => [],
  backgroundBrickSizes: () => [],
  useBaseplate: false,
  baseplateSize: 48,
  baseplateColor: '#FFFFFF'
})

const emit = defineEmits<{
  (e: 'update:foreground', value: string): void
  (e: 'update:background', value: string): void
  (e: 'update:foregroundPieceType', value: 'Plate' | 'Tile'): void
  (e: 'update:backgroundPieceType', value: 'Plate' | 'Tile'): void
  (e: 'update:foregroundBrickSizes', value: BrickSize[]): void
  (e: 'update:backgroundBrickSizes', value: BrickSize[]): void
  (e: 'update:useBaseplate', value: boolean): void
  (e: 'update:baseplateSize', value: number): void
  (e: 'update:baseplateColor', value: string): void
}>()

const { getContrastRating, colorSuggestions } = useContrastChecker()

const localForeground = ref(props.foreground)
const localBackground = ref(props.background)

watch(() => props.foreground, (newValue) => {
  localForeground.value = newValue
})

watch(() => props.background, (newValue) => {
  localBackground.value = newValue
})

const contrastRating = computed(() => {
  return getContrastRating(localForeground.value, localBackground.value)
})

const emitUpdate = () => {
  emit('update:foreground', localForeground.value)
  emit('update:background', localBackground.value)
}

const applySuggestion = (suggestion: ColorSuggestion) => {
  localForeground.value = suggestion.foreground
  localBackground.value = suggestion.background
  emitUpdate()
}

const swapColors = () => {
  const temp = localForeground.value
  localForeground.value = localBackground.value
  localBackground.value = temp
  emitUpdate()
}

const ratingClasses = computed(() => {
  const level = contrastRating.value?.level
  if (level === 'excellent') return 'bg-green-100 border-l-4 border-green-500'
  if (level === 'good') return 'bg-amber-100 border-l-4 border-amber-500'
  return 'bg-red-100 border-l-4 border-red-500'
})

const ratingTextClass = computed(() => {
  const level = contrastRating.value?.level
  if (level === 'excellent') return 'text-green-800'
  if (level === 'good') return 'text-amber-800'
  return 'text-red-800'
})
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="m-0 mb-6 text-gray-800 text-2xl font-semibold">⚙️ Setup</h2>

    <!-- Color Settings -->
    <section class="mb-8">
      <h3 class="m-0 mb-4 text-gray-700 text-lg font-semibold flex items-center gap-2">
        <span>🎨</span> Color Settings
      </h3>

      <div class="mb-4">
        <h4 class="m-0 mb-3 text-gray-600 text-base font-medium">Suggested Combinations</h4>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          <button v-for="(suggestion, index) in colorSuggestions" :key="index"
            class="flex items-center gap-3 p-3 bg-gray-100 border-2 border-gray-300 rounded-md cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5"
            @click="applySuggestion(suggestion)">
            <div class="shrink-0">
              <div class="w-10 h-10 rounded flex items-center justify-center border border-gray-300"
                :style="{ background: suggestion.background }">
                <div class="w-5 h-5 rounded-sm" :style="{ background: suggestion.foreground }" />
              </div>
            </div>
            <span class="text-sm text-gray-800 text-left">{{ suggestion.name }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4 items-end">
        <div>
          <label for="foreground" class="block mb-2 text-gray-700 font-medium">Foreground Color (Dark modules)</label>
          <div class="flex gap-2 items-center">
            <input id="foreground" v-model="localForeground" type="color"
              class="w-15 h-12 border-2 border-gray-300 rounded-md cursor-pointer" @input="emitUpdate" />
            <input v-model="localForeground" type="text"
              class="flex-1 p-3 border-2 border-gray-300 rounded-md text-base font-mono focus:outline-none focus:border-blue-500"
              placeholder="#000000" @input="emitUpdate" />
          </div>
        </div>

        <button type="button"
          class="p-2 mb-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
          title="Swap colors" @click="swapColors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div>
          <label for="background" class="block mb-2 text-gray-700 font-medium">Background Color (Light modules)</label>
          <div class="flex gap-2 items-center">
            <input id="background" v-model="localBackground" type="color"
              class="w-15 h-12 border-2 border-gray-300 rounded-md cursor-pointer" @input="emitUpdate" />
            <input v-model="localBackground" type="text"
              class="flex-1 p-3 border-2 border-gray-300 rounded-md text-base font-mono focus:outline-none focus:border-blue-500"
              placeholder="#FFFFFF" @input="emitUpdate" />
          </div>
        </div>
      </div>

      <div v-if="contrastRating" class="p-4 rounded-md" :class="ratingClasses">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">{{ contrastRating.level === 'excellent' ? '✨' : contrastRating.level === 'good' ? '✓' :
            '⚠️' }}</span>
          <strong :class="ratingTextClass">Contrast Ratio: {{ contrastRating.ratio }}:1</strong>
        </div>
        <p class="m-0 text-gray-800 text-sm">{{ contrastRating.description }}</p>
      </div>
    </section>

    <!-- Piece Settings -->
    <section class="mb-8">
      <h3 class="m-0 mb-4 text-gray-700 text-lg font-semibold flex items-center gap-2">
        <span>🧱</span> Piece Settings
      </h3>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label for="fg-piece-type" class="block mb-2 text-gray-700 font-medium">Foreground Piece Type</label>
          <select id="fg-piece-type" :value="foregroundPieceType"
            @change="emit('update:foregroundPieceType', ($event.target as HTMLSelectElement).value as 'Plate' | 'Tile')"
            class="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-blue-500">
            <option value="Plate">Plates (with studs)</option>
            <option value="Tile">Tiles (smooth top)</option>
          </select>
        </div>
        <div>
          <label for="bg-piece-type" class="block mb-2 text-gray-700 font-medium">Background Piece Type</label>
          <select id="bg-piece-type" :value="backgroundPieceType"
            @change="emit('update:backgroundPieceType', ($event.target as HTMLSelectElement).value as 'Plate' | 'Tile')"
            :disabled="useBaseplate"
            class="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
            <option value="Plate">Plates (with studs)</option>
            <option value="Tile">Tiles (smooth top)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BrickSizeSelector :model-value="foregroundBrickSizes"
          @update:model-value="emit('update:foregroundBrickSizes', $event)" label="Foreground" :color="foreground"
          :show-studs="foregroundPieceType === 'Plate'" />
        <BrickSizeSelector :model-value="backgroundBrickSizes"
          @update:model-value="emit('update:backgroundBrickSizes', $event)" label="Background" :color="background"
          :disabled="useBaseplate" :show-studs="backgroundPieceType === 'Plate'" />
      </div>
    </section>

    <!-- Baseplate Settings -->
    <section>
      <h3 class="m-0 mb-4 text-gray-700 text-lg font-semibold flex items-center gap-2">
        <span>📐</span> Baseplate Settings
      </h3>

      <div class="mb-4">
        <label
          class="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
          <input type="checkbox" :checked="useBaseplate"
            @change="emit('update:useBaseplate', ($event.target as HTMLInputElement).checked)"
            class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
          <div>
            <div class="font-medium text-purple-800">Use baseplate for background</div>
            <div class="text-sm text-purple-600">
              If you already have a baseplate in the background color, you only need foreground pieces
            </div>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="baseplate-size" class="block mb-2 text-gray-700 font-medium">Baseplate Size</label>
          <select id="baseplate-size" :value="baseplateSize"
            @change="emit('update:baseplateSize', Number(($event.target as HTMLSelectElement).value))"
            class="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-blue-500">
            <option :value="48">48×48 studs</option>
          </select>
        </div>
        <div v-if="!useBaseplate">
          <label for="baseplate-color" class="block mb-2 text-gray-700 font-medium">Baseplate Color</label>
          <div class="flex gap-2 items-center">
            <input id="baseplate-color" type="color" :value="baseplateColor"
              @input="emit('update:baseplateColor', ($event.target as HTMLInputElement).value)"
              class="w-15 h-12 border-2 border-gray-300 rounded-md cursor-pointer" />
            <span class="text-sm text-gray-500">For preview</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
