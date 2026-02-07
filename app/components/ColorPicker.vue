<template>
  <div class="color-picker">
    <h2 class="section-title">🎨 Color Selection</h2>

    <div class="color-inputs">
      <div class="form-group">
        <label for="foreground">Foreground Color (Dark modules)</label>
        <div class="color-input-wrapper">
          <input
            id="foreground"
            v-model="localForeground"
            type="color"
            class="color-input"
            @input="emitUpdate"
          />
          <input
            v-model="localForeground"
            type="text"
            class="hex-input"
            placeholder="#000000"
            @input="emitUpdate"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="background">Background Color (Light modules)</label>
        <div class="color-input-wrapper">
          <input
            id="background"
            v-model="localBackground"
            type="color"
            class="color-input"
            @input="emitUpdate"
          />
          <input
            v-model="localBackground"
            type="text"
            class="hex-input"
            placeholder="#FFFFFF"
            @input="emitUpdate"
          />
        </div>
      </div>
    </div>

    <div v-if="contrastRating" class="contrast-rating" :class="`rating-${contrastRating.level}`">
      <div class="rating-header">
        <span class="rating-icon">{{ contrastRating.level === 'excellent' ? '✨' : contrastRating.level === 'good' ? '✓' : '⚠️' }}</span>
        <strong>Contrast Ratio: {{ contrastRating.ratio }}:1</strong>
      </div>
      <p>{{ contrastRating.description }}</p>
    </div>

    <div class="preview-box">
      <h3>Preview</h3>
      <div 
        class="preview-grid"
        :style="{ 
          background: localBackground,
        }"
      >
        <div 
          class="preview-module"
          :style="{ background: localForeground }"
        />
        <div 
          class="preview-module"
          :style="{ background: localForeground }"
        />
        <div 
          class="preview-module"
          :style="{ background: localForeground }"
        />
      </div>
    </div>

    <div class="suggestions">
      <h3>Suggested Combinations</h3>
      <div class="suggestion-list">
        <button
          v-for="(suggestion, index) in colorSuggestions"
          :key="index"
          class="suggestion-item"
          @click="applySuggestion(suggestion)"
        >
          <div class="suggestion-preview">
            <div
              class="suggestion-bg"
              :style="{ background: suggestion.background }"
            >
              <div
                class="suggestion-fg"
                :style="{ background: suggestion.foreground }"
              />
            </div>
          </div>
          <span class="suggestion-name">{{ suggestion.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ColorSuggestion } from '~/composables/useContrastChecker'

const props = defineProps<{
  foreground: string
  background: string
}>()

const emit = defineEmits<{
  (e: 'update:foreground', value: string): void
  (e: 'update:background', value: string): void
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
</script>

<style scoped>
.color-picker {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.color-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
}

.color-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 50px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
}

.hex-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: monospace;
}

.hex-input:focus {
  outline: none;
  border-color: #3498db;
}

.contrast-rating {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.rating-excellent {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.rating-good {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.rating-poor {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.rating-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rating-icon {
  font-size: 1.2rem;
}

.rating-excellent strong {
  color: #155724;
}

.rating-good strong {
  color: #856404;
}

.rating-poor strong {
  color: #721c24;
}

.contrast-rating p {
  margin: 0;
  color: #2c3e50;
  font-size: 0.95rem;
}

.preview-box {
  margin-bottom: 1.5rem;
}

.preview-box h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.preview-grid {
  display: flex;
  gap: 4px;
  padding: 2rem;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  justify-content: center;
}

.preview-module {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.suggestions h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.suggestion-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  border-color: #3498db;
  background: #e8f4f8;
  transform: translateY(-2px);
}

.suggestion-preview {
  flex-shrink: 0;
}

.suggestion-bg {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
}

.suggestion-fg {
  width: 20px;
  height: 20px;
  border-radius: 2px;
}

.suggestion-name {
  font-size: 0.9rem;
  color: #2c3e50;
  text-align: left;
}
</style>
